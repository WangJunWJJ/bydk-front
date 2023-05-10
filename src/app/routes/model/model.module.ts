import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { ModelRoutingModule } from './model-routing.module';
import { ModelCVConfigComponent } from './cv/config/config.component';
import { ModelCVConfigEditComponent } from './cv/config/edit/edit.component';
import { ModelCVMonitorComponent } from './cv/monitor/monitor.component';
import { ModelCVResultComponent } from './result/result.component';
import { ModelCVResultEditComponent } from './result/edit/edit.component';
import { ModelCVResultViewComponent } from './result/view/view.component';

const COMPONENTS: Array<Type<void>> = [ModelCVConfigComponent, ModelCVMonitorComponent, ModelCVResultComponent];
const COMPONENTS_NOROUNT: Array<Type<void>> = [
  ModelCVConfigComponent,
  ModelCVConfigEditComponent,
  ModelCVResultEditComponent,
  ModelCVResultViewComponent
];

@NgModule({
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  imports: [SharedModule, ModelRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: COMPONENTS_NOROUNT
})
export class ModelModule {}
