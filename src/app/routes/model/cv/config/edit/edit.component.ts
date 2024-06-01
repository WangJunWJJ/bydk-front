import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { is } from 'date-fns/locale';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModelConfigService } from 'src/app/core/service';
import { CVAlgorithmEnum, CVTaskTypeEnum, CVTypeEnum, ICVConfig, IMission } from 'src/app/core/service/project/core';
import { isNull } from 'src/app/shared/utils/utils';

type formData = ICVConfig;

@Component({
  selector: 'app-model-cv-config-edit',
  templateUrl: './edit.component.html'
})
export class ModelCVConfigEditComponent implements OnInit {
  record!: {
    id: string | null;
  };
  originMission!: IMission<ICVConfig>;
  formData!: formData;
  labels: Record<keyof ICVConfig, { en: string; cn: string }> = {
    task_name: { en: '属性名: task_name', cn: '训练任务名称' },
    config_path: { en: '属性名: config_path', cn: '配置文件路径' },
    cv_type: { en: '属性名: cv_type', cn: '视觉任务分类' },
    task_type: { en: '属性名: task_type', cn: '训练任务类型' },
    algorithm_type: { en: '属性名: algorithm_type', cn: '样本生成算法' },
    log_path: { en: '属性名: log_path', cn: '训练日志路径' },

    target_model_path: { en: '属性名: target_model_path', cn: '生成模型路径' },
    train_data_path: { en: '属性名: train_data_path', cn: '训练样本路径' },
    test_data_path: { en: '属性名: test_data_path', cn: '测试样本路径' },
    original_data_path: { en: '属性名: original_data_path', cn: '原始样本路径' },
    adv_data_path: { en: '属性名: adv_data_path', cn: '对抗样本路径' },
    patch_dir: { en: '属性名: patch_dir', cn: '迷彩贴图路径' },
    original_model_path: { en: '属性名: original_model_path', cn: '原始模型路径' },
    advGAN_path: { en: '属性名: advGAN_path', cn: 'GAN模型路径' },
    weather_augmentations: { en: '属性名: weather_augmentations', cn: '是否天气干扰' },
    other_config: { en: '属性名: other_config', cn: '自定义配置' }
  };

  get isValid(): boolean {
    if (this.formData == null) {
      return false;
    }

    if (isNull(this.formData.task_name) || isNull(this.formData.config_path) || isNull(this.formData.log_path)) {
      return false;
    }

    if (this.formData.cv_type === CVTypeEnum.classification) {
      if (this.formData.algorithm_type === CVAlgorithmEnum.advGAN && isNull(this.formData.advGAN_path)) {
        return false;
      }

      if (this.formData.task_type === CVTaskTypeEnum.train) {
        return !(isNull(this.formData.target_model_path) || isNull(this.formData.train_data_path) || isNull(this.formData.test_data_path));
      } else if (this.formData.task_type === CVTaskTypeEnum.sample) {
        return !(
          isNull(this.formData.algorithm_type) ||
          isNull(this.formData.original_model_path) ||
          isNull(this.formData.original_data_path) ||
          isNull(this.formData.adv_data_path)
        );
      } else if (this.formData.task_type === CVTaskTypeEnum.adv_train) {
        return !(isNull(this.formData.target_model_path) || isNull(this.formData.train_data_path) || isNull(this.formData.test_data_path));
      }
    } else if (this.formData.cv_type === CVTypeEnum.detection) {
      if (this.formData.task_type === CVTaskTypeEnum.train) {
        return !(isNull(this.formData.target_model_path) || isNull(this.formData.train_data_path) || isNull(this.formData.test_data_path));
      } else if (this.formData.task_type === CVTaskTypeEnum.sample) {
        return !(
          isNull(this.formData.algorithm_type) ||
          isNull(this.formData.original_model_path) ||
          isNull(this.formData.original_data_path) ||
          isNull(this.formData.adv_data_path) ||
          isNull(this.formData.patch_dir)
        );
      } else if (this.formData.task_type === CVTaskTypeEnum.adv_train) {
        return !(isNull(this.formData.target_model_path) || isNull(this.formData.train_data_path) || isNull(this.formData.test_data_path));
      }
    }

    throw new Error('未知的任务类型');
  }

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private modelConfigService: ModelConfigService
  ) {}

  ngOnInit(): void {
    const newFormData = {
      task_name: '', // 任务名
      cv_type: CVTypeEnum.classification, // 视觉任务分类
      task_type: CVTaskTypeEnum.train, // 训练任务类型
      algorithm_type: null as any, // 对抗样本生成算法
      config_path: '', // 配置文件路径
      log_path: '', // 任务训练日志路径

      target_model_path: '', // 训练模型保存路径
      train_data_path: '', // 训练样本存放路径
      test_data_path: '', // 测试样本存放路径
      original_data_path: '', // 原始对抗样本路径
      adv_data_path: '', // 生成对抗样本路径
      patch_dir: '', // 目标检测贴图路径
      original_model_path: '', // 原始智能感知模型路径
      advGAN_path: '', // advGAN模型路径
      weather_augmentations: true, //	是否加入天气干扰
      other_config: '' // 自定义配置
    };
    if (this.record.id === null) {
      this.formData = {
        ...newFormData
      };
    } else {
      this.modelConfigService.getCVMission(this.record.id).subscribe(mission => {
        this.originMission = mission;

        this.formData = {
          ...newFormData,
          ...mission.config
        };
      });
    }
  }

  // 改变类型时 更改相对应的算法类型
  changeCVType(cvType: any): void {
    console.log({ cvType });
    this.formData.algorithm_type = null as any;
  }

  save(): void {
    if (this.record.id === null) {
      this.modelConfigService.createCVMission(this.formData).subscribe(() => {
        this.msgSrv.success('创建成功');

        this.modal.destroy(true);
      });
    } else {
      this.modelConfigService.updateCVMission(this.record.id, this.formData).subscribe(() => {
        this.msgSrv.success('更新成功');

        this.modal.destroy(true);
      });
    }
  }

  close(): void {
    this.modal.destroy();
  }
}
