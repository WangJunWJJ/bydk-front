import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControlDirective, NgForm } from '@angular/forms';
import { SEComponent } from '@delon/abc/se';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModelConfigService } from 'src/app/core/service';
import { RLAlgorithmEnum, IRLConfig, IMission, RLModeEnum } from 'src/app/core/service/project/core';

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

  get isValid(): boolean {
    if (this.formData == null) {
      return false;
    }

    return !(
      this.formData.name === '' ||
      this.formData.path === '' ||
      this.formData.server_num == null ||
      this.formData.samples_per_insert == null ||
      this.formData.collection_env_num == null ||
      this.formData.learning_rate == null ||
      this.formData.batch_size == null ||
      this.formData.worker_num == null ||
      this.formData.env_num == null
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
