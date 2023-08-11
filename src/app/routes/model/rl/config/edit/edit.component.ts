import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModelConfigService } from 'src/app/core/service';
import { IMission, IRLConfig, RLAlgorithmEnum, RLModeEnum } from 'src/app/core/service/project/core';
import { isNull } from 'src/app/shared/utils/utils';

type numberOrNull = number | null;
type formData = {
  name: string;
  path: string; //	配置文件存储路径(工程路径之下)
  algorithm: RLAlgorithmEnum; //	算法类型(六种RL算法中选择)
  algorithm_type: boolean; //	是否on-policy
  mode?: RLModeEnum | null; //	deploy/ser/dev 三选一，
  server_num: numberOrNull; // 整型
  init_step_count?: numberOrNull; // 整型
  samples_per_insert: numberOrNull; // float
  memory_size?: numberOrNull; // 整型
  collection_env_num: numberOrNull; // 整型
  learning_rate: numberOrNull; // float
  batch_size: numberOrNull; // 整型
  max_episode_length: numberOrNull; // 整型
  worker_num: numberOrNull; // 整型
  env_num: numberOrNull; // 整型
  render: boolean; //	是否渲染
  target_mode_dir: string; // 模型保存路径
};

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
  rlModes = Object.values(RLModeEnum);
  booleanOptions = [
    {
      label: '是',
      value: true
    },
    {
      label: '否',
      value: false
    }
  ];
  labels: Record<keyof formData, { en: string; cn: string }> = {
    name: { en: 'name', cn: '任务名称' },
    path: { en: 'path', cn: '配置文件存储路径' }, //	配置文件存储路径(工程路径之下)
    algorithm: { en: 'algorithm', cn: '算法选择' }, //	算法类型(六种RL算法中选择)
    algorithm_type: { en: 'algorithm_type', cn: '算法类型' }, //	是否on-policy
    mode: { en: 'mode', cn: '执行模式' }, //	deploy/ser/dev 三选一，
    server_num: { en: 'server_num', cn: '存储节点数量' }, // 整型
    init_step_count: { en: 'init_step_count', cn: '初始步骤计数' }, // 整型
    samples_per_insert: { en: 'samples_per_insert', cn: '插入样本数' }, // float
    memory_size: { en: 'memory_size', cn: '内存大小' }, // 整型
    collection_env_num: { en: 'collection_env_num', cn: '采集节点数量' }, // 整型
    learning_rate: { en: 'learning_rate', cn: '算法学习率' }, // float
    batch_size: { en: 'batch_size', cn: '批大小' }, // 整型
    max_episode_length: { en: 'max_episode_length', cn: '最大游戏步数' }, // 整型
    worker_num: { en: 'worker_num', cn: '数据加载进程数量' }, // 整型
    env_num: { en: 'env_num', cn: '评估进程数量' }, // 整型
    render: { en: 'render', cn: '渲染开关' }, //	是否渲染
    target_mode_dir: { en: 'target_mode_dir', cn: '目标模型路径' } // 模型保存路径
  };

  get isValid(): boolean {
    if (this.formData == null) {
      return false;
    }

    return !(
      isNull(this.formData.name) ||
      isNull(this.formData.path) ||
      isNull(this.formData.server_num) ||
      isNull(this.formData.samples_per_insert) ||
      isNull(this.formData.collection_env_num) ||
      isNull(this.formData.learning_rate) ||
      isNull(this.formData.batch_size) ||
      isNull(this.formData.worker_num) ||
      isNull(this.formData.env_num) ||
      isNull(this.formData.target_mode_dir)
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
        name: '',
        path: '', //	配置文件存储路径(工程路径之下)
        algorithm: RLAlgorithmEnum.dqn, //	算法类型(六种RL算法中选择)
        algorithm_type: true, //	是否on-policy
        mode: null, //	deploy/ser/dev 三选一，
        server_num: null, // 整型
        init_step_count: null, // 整型
        samples_per_insert: null, // float
        memory_size: null, // 整型
        collection_env_num: null, // 整型
        learning_rate: null, // float
        batch_size: null, // 整型
        max_episode_length: null, // 整型
        worker_num: null, // 整型
        env_num: null, // 整型
        render: true, //	是否渲染
        target_mode_dir: ''
      };
    } else {
      this.modelConfigService.getRLMission(this.record.id).subscribe(mission => {
        this.originMission = mission;

        this.formData = {
          ...mission.config,
          name: mission.name
        };
      });
    }
  }

  save(): void {
    if (this.record.id === null) {
      this.modelConfigService.createRLMission(this.formData as IRLConfig & { name: string }).subscribe(() => {
        this.msgSrv.success('创建成功');

        this.modal.destroy(true);
      });
    } else {
      this.modelConfigService.updateRLMission(this.record.id, this.formData as IRLConfig & { name: string }).subscribe(() => {
        this.msgSrv.success('更新成功');

        this.modal.destroy(true);
      });
    }
  }

  close(): void {
    this.modal.destroy();
  }
}
