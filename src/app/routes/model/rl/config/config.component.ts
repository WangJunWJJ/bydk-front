import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { ModelRLConfigEditComponent } from './edit/edit.component';
import { IRLConfig, IMission, MissionStatusEnum } from 'src/app/core/service/project/core';
import { ModelConfigService } from 'src/app/core/service';
import { ModelRLConfigViewComponent } from './view/view.component';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';

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
        title: '任务名'
      }
    }
  };

  total = 0;
  missionList: IMission<IRLConfig>[] = [];

  page: STPage = {
    front: true,
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
    { title: '算法类型', index: 'config.algorithm' },
    {
      title: '状态',
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
    { title: '创建时间', type: 'date', index: 'created', dateFormat: 'yyyy-MM-dd HH:mm' },
    {
      title: '操作',
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
                  size: window.innerWidth * 0.8
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
          const status = searchConfig.status;

          if (status === 'All') {
            return this.modelConfigService.getRLMissions({});
          } else {
            return this.modelConfigService.getRLMissions({ status });
          }
        })
      )
      .subscribe(({ total, data }) => {
        // 实际上不需要reverse 这里模仿DESC排序
        // TODO 这里过滤应该发生在请求的筛选中
        this.missionList = data.filter(item => item.status !== MissionStatusEnum.Done).reverse();
        this.total = this.missionList.length;
        this.isLoading = false;
      });
  }

  search(e: any): void {
    this.searchStream$.next({
      ...this.searchStream$.value,
      ...e
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

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
