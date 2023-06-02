import { NgModule, Optional, SkipSelf } from '@angular/core';

import { I18NService } from './i18n/i18n.service';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { ModelConfigService } from './service';
import { PyClusterService } from './service/project/pycluster.service';

const PROJECT_SERVICES = [ModelConfigService, PyClusterService];

@NgModule({
  providers: [...PROJECT_SERVICES, I18NService]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
