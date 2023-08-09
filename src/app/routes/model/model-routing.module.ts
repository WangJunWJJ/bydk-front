import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelCVConfigComponent } from './cv/config/config.component';
import { ModelCVMonitorComponent } from './cv/monitor/monitor.component';
import { ModelCVResultComponent } from './cv/result/result.component';
import { ModelRLConfigComponent } from './rl/config/config.component';
import { ModelRLMonitorComponent } from './rl/monitor/monitor.component';
import { ModelRLResultComponent } from './rl/result/result.component';

const routes: Routes = [
  { path: '', redirectTo: 'cv', pathMatch: 'full' },
  {
    path: 'cv',
    children: [
      { path: '', redirectTo: 'config', pathMatch: 'full' },
      { path: 'config', component: ModelCVConfigComponent, data: { title: '训练参数配置' } },
      { path: 'monitor', component: ModelCVMonitorComponent, data: { title: '系统状态监控' } },
      { path: 'result', component: ModelCVResultComponent, data: { title: '训练结果分析' } }
    ]
  },
  {
    path: 'rl',
    children: [
      { path: '', redirectTo: 'config', pathMatch: 'full' },
      { path: 'config', component: ModelRLConfigComponent, data: { title: '训练参数配置' } },
      { path: 'monitor', component: ModelRLMonitorComponent, data: { title: '系统状态监控' } },
      { path: 'result', component: ModelRLResultComponent, data: { title: '训练结果分析' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelRoutingModule {}
