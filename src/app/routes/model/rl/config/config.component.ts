import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { ModelRLConfigEditComponent } from './edit/edit.component';
import { IRLConfig, IMission, MissionStatusEnum, ImportDataTypeEnum, MissionTypeEnum } from 'src/app/core/service/project/core';
import { ModelConfigService, missionCondition } from 'src/app/core/service';
import { ModelRLConfigViewComponent } from './view/view.component';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ModelCompUploadComponent } from '../../components/upload-comp/upload.component';

@Component({
  selector: 'app-model-rl-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less']
})
export class ModelRLConfigComponent implements OnInit, OnDestroy {
  componentDestroyed$: Subject<void> = new Subject();

  searchSchema: SFSchema = {
    properties: {
      keyword: {
        type: 'string',
        title: '任务名',
        default: ''
      },
      status: {
        title: '任务状态',
        type: 'string',
        default: 'All',
        enum: [
          { label: '全部', value: 'All' },
          { label: '未执行', value: MissionStatusEnum.Init },
          { label: '执行中', value: MissionStatusEnum.Active }
        ]
      }
    }
  };

  total = 0;
  missionList: IMission<IRLConfig>[] = [];

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
    status: 'All' as MissionStatusEnum | 'All'
  });

  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '任务名', index: 'name' },
    { title: '配置路径', index: 'path' },
    { title: '算法类型', index: 'config.algorithm', width: '90px' },
    {
      title: '状态',
      width: '90px',
      format: (record: IMission<IRLConfig>) => {
        const status = record.status;

        switch (status) {
          case MissionStatusEnum.Init:
            return '未执行';
          case MissionStatusEnum.Active:
            return '执行中';
          case MissionStatusEnum.Done:
            return '已完成';

          default:
            return '其他';
        }
      }
    },
    { title: '创建时间', type: 'date', index: 'created', dateFormat: 'yyyy-MM-dd HH:mm', width: '180px' },
    {
      title: '操作',
      width: '200px',
      buttons: [
        {
          text: '编辑',
          click: (record: IMission<IRLConfig>) => {
            this.modal
              .createStatic(
                ModelRLConfigEditComponent,
                {
                  record: {
                    id: record.id
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
          },
          iif: (record: IMission<IRLConfig>) => {
            return record.status === MissionStatusEnum.Init;
          }
        },
        {
          text: '执行',
          click: (record: IMission<IRLConfig>) => {
            this.modelConfigService.activeRLMission(record.id).subscribe(() => {
              // 改变当前任务状态
              this.searchStream$.next(this.searchStream$.value);

              console.log(this.missionList);
              this.msgSrv.success('执行成功');
            });
          },
          iif: (record: IMission<IRLConfig>) => {
            return record.status === MissionStatusEnum.Init;
          }
        },
        {
          text: '任务监控',
          click: (record: IMission<IRLConfig>) => {
            this.modal
              .createStatic(
                ModelRLConfigViewComponent,
                {
                  record: {
                    id: record.id
                  }
                },
                {
                  modalOptions: {
                    nzMaskClosable: false,
                    nzStyle: { top: '20px' },
                    nzKeyboard: false
                  },
                  size: window.innerWidth * 0.9
                }
              )
              .subscribe(() => {
                this.searchStream$.next({ ...this.searchStream$.value });
              });
          },
          iif: (record: IMission<IRLConfig>) => {
            return record.status === MissionStatusEnum.Active;
          }
        },
        {
          text: '复制任务',
          click: (record: IMission<IRLConfig>) => {
            this.modelConfigService.copyRLMission(record.id).subscribe(newMission => {
              this.searchStream$.next({ ...this.searchStream$.value });

              this.msgSrv.success('复制成功');
            });
          }
        }
      ]
    }
  ];

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
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
          return this.modelConfigService.getRLMissions(condition);
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
        ModelRLConfigEditComponent,
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
            missionType: MissionTypeEnum.RL
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
