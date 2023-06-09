import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { ICVConfig, IMission, MissionStatusEnum } from 'src/app/core/service/project/core';
import { ModelConfigService } from 'src/app/core/service';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ModelCVResultEditComponent } from './edit/edit.component';
import { ModelCVResultViewComponent } from './view/view.component';

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
        title: '任务名'
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
                  size: window.innerWidth * 0.8
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
        this.missionList = data.reverse();
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

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
