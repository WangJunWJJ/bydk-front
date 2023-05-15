import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModelConfigService } from 'src/app/core/service';

@Component({
  selector: 'app-model-cv-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.less']
})
export class ModelCVMonitorComponent implements OnInit {
  monitorUrl!: SafeResourceUrl;

  constructor(
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    // TODO 测试用 用于转换url 否则被识别为危险url
    private sanitizer: DomSanitizer,
    private modelConfigService: ModelConfigService
  ) {
    this.monitorUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:8080/');
  }

  ngOnInit(): void {}
}
