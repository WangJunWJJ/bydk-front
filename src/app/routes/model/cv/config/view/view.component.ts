import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { zip } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { ICVConfig, IMission } from 'src/app/core/service/project/core';

@Component({
  selector: 'app-model-cv-config-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.less']
})
export class ModelCVConfigViewComponent implements OnInit {
  record!: {
    id: string;
  };
  mission!: IMission<ICVConfig>;
  monitorUrl!: SafeResourceUrl;

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    // TODO 测试用 用于转换url 否则被识别为危险url
    private sanitizer: DomSanitizer,
    private modelConfigService: ModelConfigService
  ) {}

  ngOnInit(): void {
    zip(this.modelConfigService.getCVMission(this.record.id), this.modelConfigService.getCVMonitorUrl(this.record.id)).subscribe(
      ([mission, url]) => {
        this.mission = mission;
        this.monitorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    );
  }

  close(): void {
    this.modal.destroy();
  }
}
