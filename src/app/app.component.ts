import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationError, RouteConfigLoadStart, Router } from '@angular/router';
import { TitleService, VERSION as VERSION_ALAIN } from '@delon/theme';
import { environment } from '@env/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VERSION as VERSION_ZORRO } from 'ng-zorro-antd/version';
import { ModelConfigService } from './core/service';

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `
})
export class AppComponent implements OnInit {
  constructor(
    el: ElementRef,
    renderer: Renderer2,
    private router: Router,
    private titleSrv: TitleService,
    private modelConfigService: ModelConfigService,
    private readonly activatedRoute: ActivatedRoute,
    private msgSrv: NzMessageService,
    private modalSrv: NzModalService
  ) {
    renderer.setAttribute(el.nativeElement, 'ng-alain-version', VERSION_ALAIN.full);
    renderer.setAttribute(el.nativeElement, 'ng-zorro-version', VERSION_ZORRO.full);
  }

  setToken() {
    // 获取token 写入storage
    // test
    // !test abcabc12是用来测试 后面删除
    let token = this.activatedRoute.snapshot.queryParamMap.get('token');
    console.log(token);
    if (token) {
      localStorage.setItem('rl_token', token);
    } else {
      token = localStorage.getItem('rl_token');
      if (!token) {
        console.warn('没有检测到当前用户token，请重新从云门户进入当前系统');
        // this.msgSrv.warning('没有检测到当前用户token，请重新从云门户进入当前系统');
        // !test abcabc12是用来测试 后面删除
        token = 'abcabc12';
      }
    }
    this.modelConfigService.setToken(token);
  }

  ngOnInit(): void {
    this.titleSrv.setTitle('智能模型训练系统');

    let configLoad = false;
    this.router.events.subscribe(ev => {
      if (ev instanceof RouteConfigLoadStart) {
        configLoad = true;
      }
      if (configLoad && ev instanceof NavigationError) {
        this.modalSrv.confirm({
          nzTitle: `提醒`,
          nzContent: environment.production ? `应用可能已发布新版本，请点击刷新才能生效。` : `无法加载路由：${ev.url}`,
          nzCancelDisabled: false,
          nzOkText: '刷新',
          nzCancelText: '忽略',
          nzOnOk: () => location.reload()
        });
      }
      if (ev instanceof NavigationEnd) {
        this.setToken();
        this.titleSrv.setTitle();
        this.modalSrv.closeAll();
      }
    });
  }
}
