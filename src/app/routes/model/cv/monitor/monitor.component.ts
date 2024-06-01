import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ModelConfigService, missionCondition } from 'src/app/core/service';
import { IMission, ICVConfig, ImportDataTypeEnum, MissionStatusEnum, MissionTypeEnum } from 'src/app/core/service/project/core';
import { ModelCompUploadComponent } from '../../components/upload-comp/upload.component';
import { ModelCVConfigEditComponent } from '../config/edit/edit.component';
import { ModelCVPyClusterMonitorComponent } from './view/view.component';
import { ModelCVConfigViewComponent } from '../config/view/view.component';
import { ModelCVResultViewComponent } from '../result/view/view.component';
@Component({
  selector: 'app-model-rl-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.less']
})
export class ModelCVMonitorComponent implements OnInit, OnDestroy {
  componentDestroyed$: Subject<void> = new Subject();

  searchSchema: SFSchema = {
    properties: {
      keyword: {
        type: 'string',
        title: '任务名',
        default: ''
      }
      // status: {
      //   title: '任务状态',
      //   type: 'string',
      //   default: 'All',
      //   enum: [
      //     { label: '全部', value: 'All' },
      //     { label: '未执行', value: MissionStatusEnum.Init },
      //     { label: '运行中', value: MissionStatusEnum.Active }
      //   ]
      // }
    }
  };

  total = 0;
  missionList: IMission<ICVConfig>[] = [];

  page: STPage = {
    front: false,
    show: true,
    showSize: true
  };

  isLoading = true;
  searchStream$: BehaviorSubject<{
    pi: number;
    ps: number;
    keyword: string;
    status: MissionStatusEnum | 'All';
  }> = new BehaviorSubject({
    pi: 1,
    ps: 10,
    keyword: '',
    status: MissionStatusEnum.Active as MissionStatusEnum | 'All'
  });

  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '任务名', index: 'name' },
    { title: '配置路径', index: 'path' },
    {
      title: '算法类型',
      index: 'config.decision_algorithm',
      width: '90px',
      format: (record: IMission<ICVConfig>) => {
        return record.config.algorithm_type ?? '未选择';
      }
    },
    {
      title: '状态',
      width: '90px',
      render: 'status-badge',
      index: 'status',
      format: (record: IMission<ICVConfig>) => {
        const status = record.status;

        switch (status) {
          case MissionStatusEnum.Init:
            return '未执行';
          case MissionStatusEnum.Active:
            return '运行中';
          case MissionStatusEnum.Done:
            return '已完成';

          default:
            return '其他';
        }
      }
    },
    {
      title: '创建时间',
      index: 'created',
      format: (record: IMission<ICVConfig>) => {
        return format(new Date(record.created), 'yyyy-MM-dd HH:mm');
      },
      width: '180px'
    },
    {
      title: '操作',
      width: '200px',
      buttons: [
        {
          text: '节点监控',
          icon: 'edit',
          className: ['st-btn', 'st-btn_edit'],
          click: (record: IMission<ICVConfig>) => {
            this.modal
              .createStatic(
                ModelCVPyClusterMonitorComponent,
                {
                  record: {
                    id: record.id,
                    mission: record
                  }
                },
                {
                  modalOptions: {
                    nzMaskClosable: false,
                    nzKeyboard: false
                  },
                  size: window.innerWidth * 0.8
                }
              )
              .subscribe(() => {
                this.searchStream$.next({ ...this.searchStream$.value });
              });
          }
        },
        {
          text: '训练分析',
          icon: 'file-protect',
          className: ['st-btn', 'st-btn_result'],
          click: (record: IMission<ICVConfig>) => {
            this.modal
              .createStatic(
                ModelCVResultViewComponent,
                {
                  record: {
                    id: record.id
                  }
                },
                {
                  modalOptions: {
                    nzMaskClosable: false,
                    nzStyle: { top: '20px' },
                    nzKeyboard: false,
                    nzCloseOnNavigation: true,
                    nzOnCancel: () => {
                      this.modelConfigService.closeCVTensorboard(record.id).subscribe();
                    }
                  },
                  size: window.innerWidth * 0.8
                }
              )
              .subscribe(() => {
                // 更新任务时间
                this.modelConfigService.closeCVTensorboard(record.id).subscribe();
              });
          }
        },
        {
          text: '停止训练',
          icon: 'delete',
          className: ['st-btn', 'st-btn_delete'],
          click: (record: IMission<ICVConfig>) => {
            this.modalSrv.confirm({
              nzTitle: '停止确认',
              nzContent: `当前任务正在进行中，停止训练可能导致无法预测的结果，确定要停止吗？`,
              nzOkText: '确认',
              nzOkType: 'primary',
              nzOkDanger: true,
              nzOnOk: () => {
                this.modelConfigService.endCVMission(record.id).subscribe(
                  newMission => {
                    this.searchStream$.next({ ...this.searchStream$.value });
                    this.msgSrv.success('当前训练已停止，请在训练结果中查看训练');
                  },
                  err => {
                    this.searchStream$.next({ ...this.searchStream$.value });
                    this.msgSrv.error('停止训练失败，请稍后重试');
                  }
                );
              },
              nzCancelText: '取消',
              nzOnCancel: () => {}
            });
          }
        }
      ]
    }
  ];
  // 用于保存已经执行的任务id 防止重复点击active按钮
  tempActiveIdSets: Set<string> = new Set();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private modalSrv: NzModalService,
    private msgSrv: NzMessageService,
    private modelConfigService: ModelConfigService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.searchStream$
      .pipe(
        debounceTime(120),
        takeUntil(this.componentDestroyed$),
        switchMap(searchConfig => {
          this.isLoading = true;

          const condition: missionCondition = {
            pi: searchConfig.pi,
            ps: searchConfig.ps
          };

          if (searchConfig.status !== 'All') {
            condition.status = searchConfig.status;
          }
          if (searchConfig.keyword !== '') {
            condition.keyword = searchConfig.keyword;
          }
          return this.modelConfigService.getCVMissions(condition);
        })
      )
      .subscribe(({ total, data }) => {
        this.missionList = data;
        this.total = total;
        this.isLoading = false;
      });
  }

  search(e: any): void {
    this.searchStream$.next({
      ...this.searchStream$.value,
      ...e,
      pi: 1
    });
  }

  reset(e: any) {
    this.searchStream$.next({ ...this.searchStream$.value, ...e });
  }

  addConfig(): void {
    this.modal
      .createStatic(
        ModelCVConfigEditComponent,
        {
          record: {
            id: null
          }
        },
        {
          modalOptions: {
            nzMaskClosable: false,
            nzKeyboard: false
          },
          size: window.innerWidth * 0.8
        }
      )
      .subscribe(() => {
        this.searchStream$.next({ ...this.searchStream$.value });
      });
  }

  change(e: STChange) {
    switch (e.type) {
      case 'pi':
        this.searchStream$.next({
          ...this.searchStream$.value,
          pi: e.pi
        });
        break;
      case 'ps':
        this.searchStream$.next({
          ...this.searchStream$.value,
          ps: e.ps
        });
        break;

      default:
        break;
    }
  }

  uploadModels() {
    this.modal
      .createStatic(
        ModelCompUploadComponent,
        {
          record: {
            id: null,
            type: ImportDataTypeEnum.MODELS,
            missionType: MissionTypeEnum.CV
          }
        },
        {
          modalOptions: {
            nzTitle: '模型上传下载',
            nzMaskClosable: false,
            nzKeyboard: false,
            nzStyle: { top: '30px' },
            nzClassName: 'micro-directory',
            nzFooter: null
          },
          size: window.innerWidth * 0.8
        }
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
