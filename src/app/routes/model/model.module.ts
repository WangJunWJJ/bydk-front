import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { ModelRoutingModule } from './model-routing.module';
import { ModelCVConfigComponent } from './cv/config/config.component';
import { ModelCVConfigEditComponent } from './cv/config/edit/edit.component';
import { ModelCVMonitorComponent } from './cv/monitor/monitor.component';
import { ModelCVResultComponent } from './cv/result/result.component';
import { ModelCVResultEditComponent } from './cv/result/edit/edit.component';
import { ModelCVResultViewComponent } from './cv/result/view/view.component';
import { ModelCVConfigViewComponent } from './cv/config/view/view.component';
import { ModelRLConfigComponent } from './rl/config/config.component';
import { ModelRLConfigEditComponent } from './rl/config/edit/edit.component';
import { ModelRLConfigViewComponent } from './rl/config/view/view.component';
import { ModelRLMonitorComponent } from './rl/monitor/monitor.component';
import { ModelRLResultEditComponent } from './rl/result/edit/edit.component';
import { ModelRLResultComponent } from './rl/result/result.component';
import { ModelRLResultViewComponent } from './rl/result/view/view.component';
import { ModelCompUploadComponent } from './components/upload-comp/upload.component';

const COMPONENTS: Array<Type<void>> = [
  ModelCVConfigComponent,
  ModelCVMonitorComponent,
  ModelCVResultComponent,
  ModelRLConfigComponent,
  ModelRLMonitorComponent,
  ModelRLResultComponent
];
const COMPONENTS_NOROUNT: Array<Type<void>> = [
  ModelCVConfigEditComponent,
  ModelCVConfigViewComponent,
  ModelCVResultEditComponent,
  ModelCVResultViewComponent,
  ModelRLConfigEditComponent,
  ModelRLConfigViewComponent,
  ModelRLResultEditComponent,
  ModelRLResultViewComponent,
  ModelCompUploadComponent
];

@NgModule({
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  imports: [SharedModule, ModelRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: COMPONENTS_NOROUNT
})
export class ModelModule {}
