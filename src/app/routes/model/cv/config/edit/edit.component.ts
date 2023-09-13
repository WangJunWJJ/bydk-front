import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModelConfigService } from 'src/app/core/service';
import { CVAlgorithmEnum, ICVConfig, IMission } from 'src/app/core/service/project/core';

type formData = ICVConfig & { name: string };
type cvConfig =
  | 'name'
  | 'path'
  | 'model'
  | 'clean_train_data_dir'
  | 'clean_test_data_dir'
  | 'adv_train_data_dir'
  // | 'adv_test_data_dir'
  | 'label_dir'
  | 'patch_dir'
  | 'orig_model_dir'
  | 'target_mode_dir'
  | 'weather_augmentations'
  // | 'config_opts_dir'
  | 'else_config_info';
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
  cvModelAlgorithms = Object.values(CVAlgorithmEnum);
  labels: Record<cvConfig, { en: string; cn: string }> = {
    name: { en: 'name', cn: '训练任务名称' },
    path: { en: 'path', cn: '训练对象路径' }, //	配置文件存储路径(工程路径之下)
    model: { en: 'model', cn: '样本生成算法' }, //	算法类型（有限种类中选择）
    clean_train_data_dir: { en: 'clean_train_data_dir', cn: '训练样本路径' },
    clean_test_data_dir: { en: 'clean_test_data_dir', cn: '测试样本路径' }, //	路径信息
    adv_train_data_dir: { en: 'adv_train_data_dir', cn: '对抗样本路径' }, //	路径信息
    // adv_test_data_dir: { en: 'adv_test_data_dir', cn: '对抗测试样本路径' }, //	路径信息
    label_dir: { en: 'label_dir', cn: '数据标签路径' }, //	路径信息
    patch_dir: { en: 'patch_dir', cn: '迷彩贴图路径' }, //	路径信息
    orig_model_dir: { en: 'orig_model_dir', cn: '原始模型路径' }, //	路径信息
    target_mode_dir: { en: 'target_mode_dir', cn: '目标模型路径' }, //	路径信息
    weather_augmentations: { en: 'weather_augmentations', cn: '天气干扰参数' }, //	路径信息
    // config_opts_dir: { en: 'config_opts_dir', cn: '算法参数配置' }, //	算法配置信息
    else_config_info: { en: 'else_config_info', cn: '自定义配置' } // 用户自定义配置信息（扩展）
  };

  get isValid(): boolean {
    if (this.formData == null) {
      return false;
    }

    return !(
      this.formData.name === '' ||
      this.formData.path === '' ||
      this.formData.clean_train_data_dir === '' ||
      this.formData.clean_test_data_dir === '' ||
      this.formData.adv_train_data_dir === '' ||
      this.formData.adv_test_data_dir === '' ||
      this.formData.label_dir === '' ||
      this.formData.patch_dir === '' ||
      this.formData.orig_model_dir === '' ||
      this.formData.target_mode_dir === '' ||
      this.formData.weather_augmentations === '' ||
      this.formData.config_opts_dir === ''
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
        model: CVAlgorithmEnum.fgsm, //	算法类型（有限种类中选择）
        clean_train_data_dir: '', //	路径信息
        clean_test_data_dir: '', //	路径信息
        adv_train_data_dir: '', //	路径信息
        adv_test_data_dir: '', //	路径信息
        label_dir: '', //	路径信息
        patch_dir: '', //	路径信息
        orig_model_dir: '', //	路径信息
        target_mode_dir: '', //	路径信息
        weather_augmentations: '', //	路径信息
        config_opts_dir: '', //	算法配置信息
        else_config_info: {} // 用户自定义配置信息（扩展）
      };
    } else {
      this.modelConfigService.getCVMission(this.record.id).subscribe(mission => {
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
