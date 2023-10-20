import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { zip } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { ICVConfig, IMission } from 'src/app/core/service/project/core';

@Component({
  selector: 'app-model-cv-result-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.less']
})
export class ModelCVResultViewComponent implements OnInit {
  record!: {
    id: string;
  };
  mission!: IMission<ICVConfig>;
  monitorUrl!: string;

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private modelConfigService: ModelConfigService
  ) {}

  ngOnInit(): void {
    zip(this.modelConfigService.getCVMission(this.record.id), this.modelConfigService.getCVResultUrl(this.record.id)).subscribe(
      ([mission, url]) => {
        this.mission = mission;
        // 全局设置url
        (window as any).tensorboardOrigin = url;
        localStorage.setItem('_tb_global_settings', JSON.stringify({ theme: 'dark' }));
        this.monitorUrl = url;
      }
    );
  }

  close(): void {
    this.modal.close(true);
  }
}
