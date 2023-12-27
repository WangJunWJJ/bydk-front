import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import * as echarts from 'echarts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, Subject, debounceTime, filter, switchMap, take, takeUntil, timer } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { ClusterLogTypeEnum, ISlaveData, PyClusterResponse } from 'src/app/core/service/project/core';
import { PyClusterService } from 'src/app/core/service/project/pycluster.service';
import { setDigits } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-model-rl-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.less']
})
export class ModelRLMonitorComponent implements OnInit, OnDestroy, AfterViewInit {
  // 容器标签
  @ViewChild('chartContainer')
  chartContainer!: ElementRef;
  @ViewChild('scroll', { static: true }) scrollEle!: ElementRef;

  chart!: echarts.ECharts;
  chartCompletedSubject$: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);

  componentDestroyed$: Subject<void> = new Subject();

  renderData!: ISlaveData;
  memoryRate: number = 0;
  cpuRate: number = 0;

  ipTabs = ['全部'];

  // 用于控制请求内容
  configSubject$: BehaviorSubject<string | null> = new BehaviorSubject(null as string | null);

  // 日志系统
  logStream$ = new BehaviorSubject({
    pi: 1,
    type: ClusterLogTypeEnum.All
  });
  // 用于控制页面滚动事件 以加载数据
  scrollStream$: Subject<{
    scrollTop: number;
    scrollHeight: number;
  }> = new Subject();
  // 日志
  logs: Array<{
    type: ClusterLogTypeEnum;
    content: string;
    time: string;
  }> = [];
  nextFlag = true; // 判断是否加载
  isAllLoading = false; // 判断是否已经加载所有数据

  logOptions = [
    { label: '全部', value: ClusterLogTypeEnum.All },
    { label: '信息', value: ClusterLogTypeEnum.Info },
    { label: '警告', value: ClusterLogTypeEnum.Warning },
    { label: '错误', value: ClusterLogTypeEnum.Error },
    { label: '调试', value: ClusterLogTypeEnum.Debug }
  ];

  constructor(
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private modelConfigService: ModelConfigService,
    private pyClusterService: PyClusterService
  ) {}

  ngOnInit(): void {
    this.loadClusterData();
    this.initScrollEvent();
    this.loadLogs();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    const colors = ['#5470C6', '#EE6666'];
    this.chart.setOption({
      color: colors,
      animation: false,
      title: {
        text: '系统状态监控',
        textStyle: {
          color: '#1ddbff',
          fontSize: 24
        },
        left: 'center'
      },
      legend: {
        left: 'center',
        bottom: 0,
        padding: 10,
        itemGap: 30,
        textStyle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)'
        }
      },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (n: number) => {
          return `${setDigits(n, 1)}%`;
        }
      },
      grid: {
        containLabel: true,
        left: '0%',
        right: '2%',
        top: '15%',
        bottom: '10%'
      },

      xAxis: {
        type: 'category',
        axisTick: {
          alignWithLabel: true
        },
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 13
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.8)'
        },
        axisPointer: {
          label: {
            formatter: function (params: any) {
              return `时间: 第${params.value}秒`;
            }
          }
        },
        data: [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
          '30',
          '31',
          '32',
          '33',
          '34',
          '35',
          '36',
          '37',
          '38',
          '39',
          '40',
          '41',
          '42',
          '43',
          '44',
          '45',
          '46',
          '47',
          '48',
          '49',
          '50',
          '51',
          '52',
          '53',
          '54',
          '55',
          '56',
          '57',
          '58',
          '59',
          '60'
        ]
      },
      yAxis: [
        {
          type: 'value',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: 13
          },
          min: 0,
          max: 100,
          axisLabel: {
            color: 'rgba(255,255,255,0.8)'
          },
          splitNumber: 5,
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255,255,255,0.3)'
            }
          }
        }
      ],
      series: [
        {
          name: 'CPU',
          type: 'line',
          // smooth: true,
          emphasis: {
            focus: 'series'
          },
          z: 1
        },
        {
          name: '内存',
          type: 'line',
          // smooth: true,
          emphasis: {
            focus: 'series'
          },
          z: 2
        }
      ]
    });
    this.chartCompletedSubject$.next(true);
  }

  loadClusterData() {
    this.chartCompletedSubject$
      .pipe(
        takeUntil(this.componentDestroyed$),
        filter(flag => flag),
        take(1)
      )
      .subscribe(() => {
        this.configSubject$
          .pipe(
            takeUntil(this.componentDestroyed$),
            switchMap(config => {
              return timer(0, 1000).pipe(
                takeUntil(this.componentDestroyed$),
                switchMap(_ => {
                  if (config === null) {
                    return this.pyClusterService.getClusterData();
                  } else {
                    return this.pyClusterService.getSlaveData(config);
                  }
                })
              );
            })
          )
          .subscribe(configData => {
            if (this.configSubject$.value === null) {
              const data = configData as PyClusterResponse;
              // 加载tabs数据
              this.ipTabs = [
                '全部',
                ...data.slave_list.map(slave => {
                  return slave.ip as string;
                })
              ];
              this.renderData = data.cluster_abstraction;
              this.renderChart(this.renderData);
            } else {
              const data = configData as ISlaveData;
              this.renderData = data;
              this.renderChart(this.renderData);
            }
          });
      });
  }

  initScrollEvent() {
    const containerH = Math.ceil(window.innerHeight - 200 + 2);
    this.scrollStream$.pipe(takeUntil(this.componentDestroyed$), debounceTime(100)).subscribe(({ scrollHeight, scrollTop }) => {
      if (scrollTop + containerH >= scrollHeight && !this.nextFlag) {
        if (this.isAllLoading) {
          return;
        }

        if (!this.nextFlag) {
          this.logStream$.next({
            ...this.logStream$.value,
            pi: this.logStream$.value.pi + 1
          });
        }
      }
    });
  }

  ngSelectChange(e: ClusterLogTypeEnum) {
    this.isAllLoading = false;
    this.logStream$.next({
      type: e,
      pi: 1
    });
  }

  onScroll(e: any) {
    this.scrollStream$.next({
      scrollHeight: e.target.scrollHeight,
      scrollTop: e.target.scrollTop
    });
  }

  loadLogs() {
    this.logStream$
      .pipe(
        takeUntil(this.componentDestroyed$),
        switchMap(config => {
          this.nextFlag = true; // 开始加载
          return this.pyClusterService.getClusterLog(config.pi, config.type);
        })
      )
      .subscribe(data => {
        // 后端分页 一页20条数据
        if (data.length < 20) {
          this.isAllLoading = true;
        }
        const logs = data.map(log => {
          return {
            ...log,
            type: log.type.toLowerCase() as ClusterLogTypeEnum
          };
        });

        // 如果是第一页直接加载 否则继续添加元素
        if (this.logStream$.value.pi === 1) {
          this.logs = [...logs];
          this.scrollEle.nativeElement.scrollTop = 0;
        } else {
          this.logs = [...this.logs, ...logs];
        }
        this.nextFlag = false; // 加载完成
      });
  }

  renderChart(renderData: ISlaveData) {
    this.memoryRate = Math.floor(renderData.memory_usage[renderData.memory_usage.length - 1] * 100);
    this.cpuRate = Math.floor(renderData.cpu_workload[renderData.cpu_workload.length - 1] * 100);

    this.chart.setOption({
      series: [
        { name: 'CPU', data: renderData.cpu_workload.map(n => n * 100) },
        { name: '内存', data: renderData.memory_usage.map(n => n * 100) }
      ]
    });
  }

  tabChange(tabIndex: number) {
    if (tabIndex === 0) {
      this.configSubject$.next(null);
    } else {
      this.configSubject$.next(this.ipTabs[tabIndex]);
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
