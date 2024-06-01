import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModelConfigService } from 'src/app/core/service';
import { IMission, IRLConfig, RLAlgorithmEnum, RLModelEnum } from 'src/app/core/service/project/core';
import { isNull } from 'src/app/shared/utils/utils';

type numberOrNull = number | null;
type formData = IRLConfig;

@Component({
  selector: 'app-model-rl-config-edit',
  templateUrl: './edit.component.html'
})
export class ModelRLConfigEditComponent implements OnInit {
  record!: {
    id: string | null;
  };
  originMission!: IMission<IRLConfig>;
  formData!: formData;
  rlModelAlgorithms = Object.values(RLAlgorithmEnum);
  rlModes = Object.values(RLModelEnum);

  labels: Record<keyof IRLConfig, { en: string; cn: string }> = {
    task_name: { en: '属性名: task_name', cn: '训练任务名称' },
    config_path: { en: '属性名: config_path', cn: '配置文件路径' },
    model_path: { en: '属性名: model_path', cn: '生成模型路径' },
    log_path: { en: '属性名: log_path', cn: '训练日志路径' },
    collection_node_num: { en: '属性名: collection_node_num', cn: '采集节点数量' },
    node_collection_num: { en: '属性名: node_collection_num', cn: '采集环境数量' },
    evaluation_num: { en: '属性名: evaluation_num', cn: '评估环境数量' },
    store_node_num: { en: '属性名: store_node_num', cn: '存储节点数量' },
    decision_algorithm: { en: '属性名: decision_algorithm', cn: '智能算法选择' },
    model_type: { en: '属性名: model_type', cn: '神经网络类型' },
    other_config: { en: '属性名: other_config', cn: '自定义配置' }
  };

  // 判断输出是否合法
  get isValid(): boolean {
    if (this.formData == null) {
      return false;
    }

    return !(
      isNull(this.formData.task_name) ||
      isNull(this.formData.config_path) ||
      isNull(this.formData.model_path) ||
      isNull(this.formData.log_path) ||
      this.formData.collection_node_num < 1 ||
      this.formData.collection_node_num > 20 ||
      this.formData.node_collection_num < 1 ||
      this.formData.node_collection_num > 16 ||
      this.formData.evaluation_num < 1 ||
      this.formData.evaluation_num > 10 ||
      this.formData.store_node_num < 1 ||
      this.formData.store_node_num > 10
    );
  }

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private modelConfigService: ModelConfigService
  ) {}

  ngOnInit(): void {
    if (this.record.id === null) {
      this.formData = {
        task_name: '', // 任务名
        config_path: '', // 配置文件路径
        model_path: '', // 模型保存路径
        log_path: '', // 训练日志路径
        collection_node_num: 1, // 采集节点数量
        node_collection_num: 1, // 单节点并行采集环境数量
        evaluation_num: 1, // 评估环境数量
        store_node_num: 1, // 存储节点数量
        decision_algorithm: undefined, // 决策算法
        model_type: undefined, // 网络类型
        other_config: '' // 用户自定义配置信息（扩展）
      };
    } else {
      this.modelConfigService.getRLMission(this.record.id).subscribe(mission => {
        this.originMission = mission;

        this.formData = {
          ...mission.config
        };
      });
    }
  }

  save(): void {
    const newFormData = { ...this.formData };

    // 如果是空值
    Object.entries(newFormData).forEach(([key, value]) => {
      // 如果没有可选属性 删除该属性
      if (['decision_algorithm', 'model_type', 'other_config'].includes(key) && !value) {
        delete newFormData[key as keyof IRLConfig];
      }
    });

    if (this.record.id === null) {
      this.modelConfigService.createRLMission(newFormData).subscribe(() => {
        this.msgSrv.success('创建成功');

        this.modal.destroy(true);
      });
    } else {
      this.modelConfigService.updateRLMission(this.record.id, newFormData).subscribe(() => {
        this.msgSrv.success('更新成功');

        this.modal.destroy(true);
      });
    }
  }

  close(): void {
    this.modal.destroy();
  }
}
