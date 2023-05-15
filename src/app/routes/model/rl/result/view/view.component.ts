import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { zip } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { IRLConfig, IMission } from 'src/app/core/service/project/core';

@Component({
  selector: 'app-model-rl-result-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.less']
})
export class ModelRLResultViewComponent implements OnInit {
  record!: {
    id: string;
  };
  mission!: IMission<IRLConfig>;
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
    zip(this.modelConfigService.getRLMission(this.record.id), this.modelConfigService.getRLResultUrl(this.record.id)).subscribe(
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
