import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { ModelCVConfigEditComponent } from './edit/edit.component';
import { ICVConfig, IMission, MissionStatusEnum } from 'src/app/core/service/project/core';
import { ModelConfigService } from 'src/app/core/service';
import { ModelCVConfigViewComponent } from './view/view.component';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-model-cv-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less']
})
export class ModelCVConfigComponent implements OnInit, OnDestroy {
  componentDestroyed$: Subject<void> = new Subject();

  searchSchema: SFSchema = {
    properties: {
      keyword: {
        type: 'string',
        title: '任务名'
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
  missionList: IMission<ICVConfig>[] = [];

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
    { title: '算法类型', index: 'config.model' },
    {
      title: '状态',
      format: (record: IMission<ICVConfig>) => {
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
          click: (record: IMission<ICVConfig>) => {
            this.modal
              .createStatic(
                ModelCVConfigEditComponent,
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
          iif: (record: IMission<ICVConfig>) => {
            return record.status === MissionStatusEnum.Init;
          }
        },
        {
          text: '执行',
          click: (record: IMission<ICVConfig>) => {
            this.modelConfigService.activeCVMission(record.id).subscribe(() => {
              // 改变当前任务状态
              this.searchStream$.next(this.searchStream$.value);

              console.log(this.missionList);
              this.msgSrv.success('执行成功');
            });
          },
          iif: (record: IMission<ICVConfig>) => {
            return record.status === MissionStatusEnum.Init;
          }
        },
        {
          text: '任务监控',
          click: (record: IMission<ICVConfig>) => {
            this.modal
              .createStatic(
                ModelCVConfigViewComponent,
                { id: record.id },
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
          iif: (record: IMission<ICVConfig>) => {
            return record.status === MissionStatusEnum.Active;
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
            return this.modelConfigService.getCVMissions({});
          } else {
            return this.modelConfigService.getCVMissions({ status });
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

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
