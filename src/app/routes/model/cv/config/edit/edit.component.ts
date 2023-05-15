import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControlDirective, NgForm } from '@angular/forms';
import { SEComponent } from '@delon/abc/se';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModelConfigService } from 'src/app/core/service';
import { CVAlgorithmEnum, ICVConfig, IMission } from 'src/app/core/service/project/core';

type formData = ICVConfig & { name: string };

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
          name: mission.name,
          ...mission.config
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
      // TODO 增加相关的后端更新逻辑
      this.modelConfigService.createCVMission(this.formData).subscribe(() => {
        this.msgSrv.success('更新成功');

        this.modal.destroy(true);
      });
    }
  }

  close(): void {
    this.modal.destroy();
  }
}
