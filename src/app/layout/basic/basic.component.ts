import { Component } from '@angular/core';
import { SettingsService, User } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';
import { MissionTypeEnum } from 'src/app/core/service/project/core';

@Component({
  selector: 'layout-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.less']
})
export class LayoutBasicComponent {
  options: LayoutDefaultOptions = {
    logoExpanded: `./assets/logo-full.svg`,
    logoCollapsed: `./assets/boyilogo.svg`,
    hideAside: false
  };
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;
  type: MissionTypeEnum = MissionTypeEnum.CV;

  get user(): User {
    return this.settings.user;
  }

  constructor(private settings: SettingsService) {}

  downloadHelp() {
    console.log('downloadHelp');
    const url = '../../../assets/files/用户手册.pdf';
    const filename = '用户手册.pdf';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = e => {
      const tempUrl = window.URL.createObjectURL(xhr.response);
      const a = document.createElement('a');
      a.href = tempUrl;
      a.download = filename;
      a.click();
      console.log(a);
    };
    xhr.send();
  }
}
