import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MONITOR_URL } from '../constant';
import { ClusterLogTypeEnum, ISlaveData, PyClusterResponse } from './core';

@Injectable({
  providedIn: 'root'
})
export class PyClusterService {
  constructor(private httpClient: HttpClient) {}

  /**
   * 返回Cluster数据
   *
   * @return {*}
   * @memberof PyClusterService
   */
  getClusterData() {
    return this.httpClient.get<PyClusterResponse>(`${MONITOR_URL}/heartbeat/main`);
  }

  /**
   * 返回ip对应的slave数据
   *
   * @return {*}
   * @memberof PyClusterService
   */
  getSlaveData(ip: string) {
    return this.httpClient.get<ISlaveData>(`${MONITOR_URL}/heartbeat/${ip}`);
  }

  /**
   * 用于请求日志信息
   *
   * @param {number} pi 页码 默认一页为20项
   * @param {ClusterLogTypeEnum} type 日志类型
   * @return {*}
   * @memberof PyClusterService
   */
  getClusterLog(pi: number, type: ClusterLogTypeEnum) {
    return this.httpClient.get<Array<{ content: string; time: string; type: string }>>(
      `${MONITOR_URL}/log/more?type=${type}&offset=${20 * (pi - 1)}`
    );
  }

  /**
   * 清除全部日志
   *
   * @return {*}
   * @memberof PyClusterService
   */
  clearLog() {
    return this.httpClient.get(`${MONITOR_URL}/log/clear`);
  }
}
