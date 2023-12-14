import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import * as echarts from 'echarts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Subject, filter, switchMap, take, takeUntil, timer } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { ICVConfig, IMission, MissionData } from 'src/app/core/service/project/core';
import { setDigits } from 'src/app/shared/utils/utils';

type chartType = keyof MissionData;

@Component({
  selector: 'app-model-cv-config-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.less']
})
export class ModelCVConfigViewComponent implements OnInit, OnDestroy, AfterViewInit {
  record!: {
    id: string;
  };
  mission!: IMission<ICVConfig>;
  chartTypeOptions = [
    'insert_total',
    'sample_total',
    'ave_insert_speed',
    'ave_sample_speed',
    'cur_insert_speed',
    'cur_sample_speed',
    'insert_block_time',
    'sample_block_time',
    'memory_usage'
  ];

  // 容器标签
  @ViewChild('chartContainer1')
  chartContainer1!: ElementRef;
  @ViewChild('chartContainer2')
  chartContainer2!: ElementRef;
  @ViewChild('chartContainer3')
  chartContainer3!: ElementRef;
  @ViewChild('chartContainer4')
  chartContainer4!: ElementRef;
  @ViewChild('chartContainer5')
  chartContainer5!: ElementRef;

  chartTypeStream$ = new BehaviorSubject('insert_total' as chartType);
  // 这里记录时间序列相关的mission数据
  missionData: MissionData[] = [];

  monitorUrl!: string;

  chart1!: echarts.ECharts;
  chart2!: echarts.ECharts;
  chart3!: echarts.ECharts;
  chart4!: echarts.ECharts;
  chart5!: echarts.ECharts;

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
    this.chart1 = echarts.init(this.chartContainer1.nativeElement);
    this.chart2 = echarts.init(this.chartContainer2.nativeElement);
    this.chart3 = echarts.init(this.chartContainer3.nativeElement);
    this.chart4 = echarts.init(this.chartContainer4.nativeElement);
    this.chart5 = echarts.init(this.chartContainer5.nativeElement);
    const colors = ['#5470C6', '#EE6666'];
    this.chart1.setOption({
      color: colors,
      animation: false,
      title: {
        text: '插入/采样累积次数',
        textStyle: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: 17
        }
      },
      legend: {
        left: 'right',
        top: 0,
        padding: 10,
        textStyle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        containLabel: true,
        left: '0%',
        right: '2%',
        top: '15%',
        bottom: '13%'
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
        }
      },
      yAxis: [
        {
          type: 'value',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: 13
          },
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
          name: 'insert_total',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 1
        },
        {
          name: 'sample_total',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 2
        }
      ]
    });
    this.chart2.setOption({
      color: colors,
      animation: false,
      title: {
        text: '插入/采样平均次数',
        textStyle: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: 17
        }
      },
      legend: {
        left: 'right',
        top: 0,
        padding: 10,
        textStyle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        containLabel: true,
        left: '0%',
        right: '2%',
        top: '15%',
        bottom: '13%'
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
        }
      },
      yAxis: [
        {
          type: 'value',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: 13
          },
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
          name: 'average_insert_speed',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 1
        },
        {
          name: 'average_sample_speed',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 2
        }
      ]
    });
    this.chart3.setOption({
      color: colors,
      animation: false,
      title: {
        text: '插入/采样当前次数',
        textStyle: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: 17
        }
      },
      legend: {
        left: 'right',
        top: 0,
        padding: 10,
        textStyle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        containLabel: true,
        left: '0%',
        right: '2%',
        top: '15%',
        bottom: '13%'
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
        }
      },
      yAxis: [
        {
          type: 'value',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: 13
          },
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
          name: 'current_insert_speed',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 1
        },
        {
          name: 'current_sample_speed',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 2
        }
      ]
    });
    this.chart4.setOption({
      color: colors,
      animation: false,
      title: {
        text: '插入/采样阻塞时间',
        textStyle: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: 17
        }
      },
      legend: {
        left: 'right',
        top: 0,
        padding: 10,
        textStyle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        containLabel: true,
        left: '0%',
        right: '2%',
        top: '15%',
        bottom: '13%'
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
        }
      },
      yAxis: [
        {
          type: 'value',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: 13
          },
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
          name: 'insert_block_time',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 1
        },
        {
          name: 'sample_block_time',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 2
        }
      ]
    });
    this.chart5.setOption({
      color: colors,
      animation: false,
      title: {
        text: '数据仓库内存使用率',
        textStyle: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: 17
        }
      },
      legend: {
        left: 'right',
        top: 0,
        padding: 10,
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
        bottom: '13%'
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
        }
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
          name: 'memory_usage',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          z: 1
        }
        // {
        //   name: 'sample_block_time',
        //   type: 'line',
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
    this.modelConfigService.getCVMission(this.record.id).subscribe(mission => {
      this.mission = mission;
    });
  }

  // 加载任务数据 直接写入 不做处理
  loadData() {
    timer(0, 1000)
      .pipe(
        takeUntil(this.componentDestroyed$),
        switchMap(_ => {
          return this.modelConfigService.getCVMissionData(this.record.id);
        })
      )
      .subscribe(missionData => {
        // 任务已经结束
        if ('msg' in missionData) {
          if (missionData.msg === 'Mission done') {
            this.componentDestroyed$.next(); // 结束数据流
            this.msgSrv.info('任务已结束');
          }
          return;
        }

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
          const chartLen = 60 * 3; // 渲染长度 展示时间3分钟
          // 渲染的数据
          const handledData = this.missionData.slice(dLen > chartLen ? dLen - chartLen : 0, dLen);

          // 将每一项作为数组填入chartData
          const chartData: Record<chartType, number[]> = {} as Record<chartType, number[]>;
          (
            [
              'insert_total',
              'sample_total',
              'ave_insert_speed',
              'ave_sample_speed',
              'cur_insert_speed',
              'cur_sample_speed',
              'insert_block_time',
              'sample_block_time',
              'memory_usage'
            ] as chartType[]
          ).forEach(key => {
            chartData[key] = handledData.map(item => {
              return item[key];
            });
          });

          // 更新图数据
          this.chart1.setOption({
            series: [
              { name: 'insert_total', data: chartData.insert_total },
              { name: 'sample_total', data: chartData.sample_total }
            ]
          });
          this.chart2.setOption({
            series: [
              { name: 'average_insert_speed', data: chartData.ave_insert_speed },
              { name: 'average_sample_speed', data: chartData.ave_sample_speed }
            ]
          });
          this.chart3.setOption({
            series: [
              { name: 'current_insert_speed', data: chartData.cur_insert_speed },
              { name: 'current_sample_speed', data: chartData.cur_sample_speed }
            ]
          });
          this.chart4.setOption({
            series: [
              { name: 'insert_block_time', data: chartData.insert_block_time },
              { name: 'sample_block_time', data: chartData.sample_block_time }
            ]
          });
          this.chart5.setOption({
            series: [
              {
                name: 'memory_usage',
                data: chartData.memory_usage.map(n => {
                  return n * 100;
                })
              }
            ]
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
