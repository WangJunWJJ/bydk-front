import { OnDestroy, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

/**
 * 用于管理页面的公共状态
 *
 * @export
 * @class PageService
 * @implements {OnDestroy}
 */
@Injectable({
  providedIn: 'root'
})
export class PageService implements OnDestroy {
  // 暂时未启用
  // 用于保存cv的选择状态 选择的为运行中的任务 默认未选择
  cvUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');
  // 用于保存rl的选择状态 选择的为运行中的任务 默认未选择
  rlUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {}

  ngOnDestroy() {
    this.cvUrlSubject.unsubscribe();
    this.rlUrlSubject.unsubscribe();
  }
}
