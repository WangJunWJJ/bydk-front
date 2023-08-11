import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { ICVConfig, IMission, ImportDataTypeEnum, MissionStatusEnum, MissionTypeEnum } from 'src/app/core/service/project/core';
import { ModelConfigService, missionCondition } from 'src/app/core/service';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ModelCVResultEditComponent } from './edit/edit.component';
import { ModelCVResultViewComponent } from './view/view.component';
import { ModelCompUploadComponent } from '../../components/upload-comp/upload.component';

@Component({
  selector: 'app-model-cv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.less']
})
export class ModelCVResultComponent implements OnInit, OnDestroy {
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
    status: MissionStatusEnum.Done as MissionStatusEnum | 'All'
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
    // TODO 可能增加任务结束时间
    // { title: '任务结束时间', type: 'date', index: 'created', dateFormat: 'yyyy-MM-dd HH:mm' },
    {
      title: '操作',
      buttons: [
        {
          text: '训练结果',
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
                    nzKeyboard: false
                  },
                  size: window.innerWidth * 0.9
                }
              )
              .subscribe(() => {
                this.searchStream$.next({ ...this.searchStream$.value });
              });
          }
        },
        {
          text: '复制任务',
          click: (record: IMission<ICVConfig>) => {
            this.modelConfigService.copyCVMission(record.id).subscribe(newMission => {
              this.msgSrv.success('复制成功');
            });
          }
        },
        {
          text: '下载',
          children: [
            {
              text: '下载数据集',
              click: (record: IMission<ICVConfig>) => {
                // 下载功能
                this.modelConfigService.downloadCVDatasets(record.id).subscribe(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${record.name}数据集.zip`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                });
              }
            },
            {
              text: '下载模型',
              click: (record: IMission<ICVConfig>) => {
                // 下载功能
                this.modelConfigService.downloadCVTargetModels(record.id).subscribe(blob => {
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
            ps: searchConfig.ps,
            status: MissionStatusEnum.Done
          };

          if (searchConfig.keyword !== '') {
            condition.keyword = searchConfig.keyword;
          }
          return this.modelConfigService.getCVMissions(condition);
        })
      )
      .subscribe(({ total, data }) => {
        // 实际上不需要reverse 这里模仿DESC排序
        this.missionList = data.reverse();
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
        ModelCVResultEditComponent,
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

  uploadDatasets() {
    this.modal
      .createStatic(
        ModelCompUploadComponent,
        {
          record: {
            id: null,
            type: ImportDataTypeEnum.DATASETS,
            missionType: MissionTypeEnum.CV
          }
        },
        {
          modalOptions: {
            nzTitle: '数据集上传下载',
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
