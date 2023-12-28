import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Route, Router } from '@angular/router';
import { format, getDay } from 'date-fns';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomePageComponent implements OnInit, OnDestroy {
  clockTime: string = '';
  dateString: string = '';
  weekString: string = '';

  clockSubscriber!: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.clockSubscriber = this.getTimeString();
  }

  getTimeString() {
    const clockSubscriber = timer(0, 1000).subscribe(i => {
      const now = new Date();

      this.clockTime = format(now, 'HH:mm:ss');
      this.dateString = format(now, 'yyyy/MM/dd');
      const weekZh = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      this.weekString = weekZh[getDay(now)];
    });
    return clockSubscriber;
  }

  jumpPos(type: 'cv' | 'rl') {
    switch (type) {
      case 'cv':
        window.open('/#/model/cv/config');

        return;

      case 'rl':
        window.open('/#/model/rl/config');

        return;

      default:
        break;
    }
    throw new Error('wrong type');
  }

  ngOnDestroy(): void {
    // 结束
    this.clockSubscriber.unsubscribe();
  }
}
