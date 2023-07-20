import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { IRLConfig, IMission, MissionStatusEnum } from 'src/app/core/service/project/core';
import { ModelConfigService, missionCondition } from 'src/app/core/service';
import { BehaviorSubject, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ModelRLResultEditComponent } from './edit/edit.component';
import { ModelRLResultViewComponent } from './view/view.component';

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
    // TODO 可能增加任务结束时间
    // { title: '任务结束时间', type: 'date', index: 'created', dateFormat: 'yyyy-MM-dd HH:mm' },
    {
      title: '操作',
      buttons: [
        {
          text: '训练结果',
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
          click: (record: IMission<IRLConfig>) => {
            this.modelConfigService.copyRLMission(record.id).subscribe(newMission => {
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
        // 实际上不需要reverse 这里模仿DESC排序
        // TODO 这里过滤应该发生在请求的筛选中
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
