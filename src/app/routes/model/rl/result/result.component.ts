import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ModelConfigService, missionCondition } from 'src/app/core/service';
import { IMission, IRLConfig, MissionStatusEnum } from 'src/app/core/service/project/core';
import { ModelRLResultEditComponent } from './edit/edit.component';
import { ModelRLResultViewComponent } from './view/view.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { format } from 'date-fns';

@Component({
  selector: 'app-model-rl-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.less']
})
export class ModelRLResultComponent implements OnInit, OnDestroy {
  componentDestroyed$: Subject<void> = new Subject();

  searchSchema: SFSchema = {
    properties: {
      keyword: {
        type: 'string',
        title: '任务名',
        default: ''
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
    status: MissionStatusEnum.Done as MissionStatusEnum | 'All'
  });

  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '任务名', index: 'name' },
    { title: '配置路径', index: 'path' },
    { title: '算法类型', index: 'config.algorithm', width: '90px' },
    {
      title: '状态',
      width: '90px',
      render: 'status-badge',
      index: 'status',
      format: (record: IMission<IRLConfig>) => {
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
      format: (record: IMission<IRLConfig>) => {
        return format(new Date(record.created), 'yyyy-MM-dd HH:mm');
      },
      width: '180px'
    },
    {
      title: '操作',
      width: '300px',
      buttons: [
        {
          text: '训练结果',
          icon: 'file-protect',
          className: ['st-btn', 'st-btn_result'],
          click: (record: IMission<IRLConfig>) => {
            this.modal
              .createStatic(
                ModelRLResultViewComponent,
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
          text: '复制任务',
          icon: 'copy',
          className: ['st-btn', 'st-btn_copy'],
          click: (record: IMission<IRLConfig>) => {
            this.modelConfigService.copyRLMission(record.id).subscribe(newMission => {
              this.msgSrv.success('复制成功');
            });
          }
        },
        {
          text: '删除任务',
          icon: 'delete',
          className: ['st-btn', 'st-btn_delete'],
          click: (record: IMission<IRLConfig>) => {
            this.modalSrv.confirm({
              nzTitle: '删除确认',
              nzContent: `删除任务后无法恢复，确认删除吗？`,
              nzOkText: '确认',
              nzOkType: 'primary',
              nzOkDanger: true,
              nzOnOk: () => {
                this.modelConfigService.deleteRLMission(record.id).subscribe(newMission => {
                  this.searchStream$.next({ ...this.searchStream$.value });

                  this.msgSrv.success('删除成功');
                });
              },
              nzCancelText: '取消',
              nzOnCancel: () => {}
            });
          }
        },
        {
          text: '下载模型',
          icon: 'download',
          className: ['st-btn', 'st-btn_download'],
          click: (record: IMission<IRLConfig>) => {
            // 下载功能
            this.modelConfigService.downloadRLTargetModels(record.id).subscribe(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${record.name}模型.zip`;
              a.click();
              window.URL.revokeObjectURL(url);
            });
          }
        }
      ]
    }
  ];

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
            ps: searchConfig.ps,
            status: MissionStatusEnum.Done
          };

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
        ModelRLResultEditComponent,
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

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
