import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import * as echarts from 'echarts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Subject, debounceTime, filter, switchMap, take, takeUntil, timer, zip } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { IRLConfig, IMission, MissionData } from 'src/app/core/service/project/core';
import { setDigits } from 'src/app/shared/utils/utils';

type chartType = keyof MissionData;

@Component({
  selector: 'app-model-rl-config-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.less']
})
export class ModelRLConfigViewComponent implements OnInit, OnDestroy, AfterViewInit {
  record!: {
    id: string;
  };
  mission!: IMission<IRLConfig>;
  chartTypeOptions = [
    'insert_total',
    'sample_total',
    'average_insert_speed',
    'average_sample_speed',
    'current_insert_speed',
    'current_sample_speed',
    'insert_block_time',
    'sample_block_time',
    'memory_usage'
  ];

  // 容器标签
  @ViewChild('chartContainer')
  chartContainer!: ElementRef;

  chartTypeStream$ = new BehaviorSubject('insert_total' as chartType);
  // 这里记录时间序列相关的mission数据
  missionData: MissionData[] = [];

  monitorUrl!: string;

  chart!: echarts.ECharts;
  chartCompletedSubject$: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);

  componentDestroyed$: Subject<void> = new Subject();

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private modelConfigService: ModelConfigService
  ) {}

  ngOnInit(): void {
    this.generateChart();
    this.loadMission();
    this.loadData();
  }

  initChart() {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    const colors = ['#5470C6', '#EE6666'];
    this.chart.setOption({
      color: colors,
      animation: false,
      title: {
        text: '任务状态监控',
        textStyle: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: 20
        },
        left: 'center'
      },
      legend: {
        left: 'center',
        bottom: 0,
        padding: 10,
        // itemHeight: 30,
        textStyle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)'
        }
      },
      tooltip: {
        trigger: 'axis'
        // axisPointer: {
        //   type: 'cross'
        // }
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
              return `时间  ${params.value}`;
            }
          }
        }
        // data: [
        //   '1',
        //   '2',
        //   '3',
        //   '4',
        //   '5',
        //   '6',
        //   '7',
        //   '8',
        //   '9',
        //   '10',
        //   '11',
        //   '12',
        //   '13',
        //   '14',
        //   '15',
        //   '16',
        //   '17',
        //   '18',
        //   '19',
        //   '20',
        //   '21',
        //   '22',
        //   '23',
        //   '24',
        //   '25',
        //   '26',
        //   '27',
        //   '28',
        //   '29',
        //   '30',
        //   '31',
        //   '32',
        //   '33',
        //   '34',
        //   '35',
        //   '36',
        //   '37',
        //   '38',
        //   '39',
        //   '40',
        //   '41',
        //   '42',
        //   '43',
        //   '44',
        //   '45',
        //   '46',
        //   '47',
        //   '48',
        //   '49',
        //   '50',
        //   '51',
        //   '52',
        //   '53',
        //   '54',
        //   '55',
        //   '56',
        //   '57',
        //   '58',
        //   '59',
        //   '60'
        // ]
      },
      yAxis: [
        {
          type: 'value',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: 13
          },
          minInterval: 0.2,
          axisLabel: {
            color: 'rgba(255,255,255,0.8)'
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255,255,255,0.3)'
            }
          }
          // min: 0,
          // max: 1
        }
      ],
      series: [
        {
          id: 'unique',
          name: 'insert_total',
          type: 'line',
          // smooth: true,
          emphasis: {
            focus: 'series'
          },
          z: 1
        }
        // {
        //   name: '内存',
        //   type: 'line',
        //   // smooth: true,
        //   emphasis: {
        //     focus: 'series'
        //   },
        //   z: 2
        // }
      ]
    });
    this.chartCompletedSubject$.next(true);
  }

  // 获取任务
  loadMission() {
    this.modelConfigService.getRLMission(this.record.id).subscribe(mission => {
      this.mission = mission;
    });
  }

  // 加载任务数据 直接写入 不做处理
  loadData() {
    // const randomGenerate = (min: number, max: number, isInt = true) => {
    //   const ret = min + Math.random() * (max - min);
    //   return isInt ? Math.floor(ret) : setDigits(ret);
    // };

    // const test = () => {
    //   const ret: MissionData[] = [];
    //   for (let i = 0; i < 10000; i++) {
    //     ret.push({
    //       insert_total: randomGenerate(10000, 20000),
    //       sample_total: randomGenerate(40000, 80000),
    //       average_insert_speed: randomGenerate(200, 500),
    //       average_sample_speed: randomGenerate(1000, 3000),
    //       current_insert_speed: randomGenerate(0, 2000),
    //       current_sample_speed: randomGenerate(0, 1000),
    //       insert_block_time: randomGenerate(0, 100),
    //       sample_block_time: randomGenerate(0, 100),
    //       memory_usage: randomGenerate(0.1, 0.6, false)
    //     });
    //   }
    //   return ret;
    // };
    // this.missionData = test();
    // this.chartTypeStream$.next(this.chartTypeStream$.value);
    // return;

    // this.chartTypeStream$.next(this.chartTypeStream$.value);
    // 1s获取一次数据 存入missionData数组中
    timer(0, 1000)
      .pipe(
        takeUntil(this.componentDestroyed$),
        switchMap(_ => {
          return this.modelConfigService.getRLMissionData(this.record.id);
        })
      )
      .subscribe(missionData => {
        this.missionData.push(missionData);
        this.chartTypeStream$.next(this.chartTypeStream$.value);
      });
  }

  generateChart() {
    this.chartCompletedSubject$
      .pipe(
        takeUntil(this.componentDestroyed$),
        filter(flag => flag),
        take(1)
      )
      .subscribe(() => {
        this.chartTypeStream$.pipe(takeUntil(this.componentDestroyed$)).subscribe(chartType => {
          const dLen = this.missionData.length; // 数据长度
          const chartLen = 100; // 渲染长度
          // 渲染的数据
          const chartData: number[] = this.missionData.slice(dLen > chartLen ? dLen - chartLen : 0, dLen).map(item => {
            return item[chartType];
          });

          // 更新图数据
          this.chart.setOption({
            series: [{ id: 'unique', name: chartType, data: chartData }]
          });
        });
      });
  }

  close(): void {
    this.modal.destroy();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  // 根据select内容 变更chart
  ngSelectChange(e: chartType) {
    this.chartTypeStream$.next(e);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
