import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICVConfig, IMission, IRLConfig, MissionData, MissionStatusEnum } from './core';
import { BE_URL } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class ModelConfigService {
  token!: string;
  constructor(private httpClient: HttpClient, private msgSrv: NzMessageService) {}

  /**
   * 获取token
   *
   * @return {*}  {string}
   * @memberof ModelConfigService
   */
  getToken(): string {
    // token没有被初始化 阻止请求进行
    if (this.token == null) {
      this.msgSrv.warning('token还没有初始化');
      throw new Error('token还没有初始化');
    }
    return this.token;
  }

  /**
   * 设置token
   *
   * @param {string} token
   * @memberof ModelConfigService
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * 获取CV任务 筛选条件为path和status 如果没有筛选条件 返回全部
   *
   * @param {{ path?: string; status?: MissionStatusEnum }} conditions
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVMissions(conditions: { path?: string; status?: MissionStatusEnum }) {
    return this.httpClient.get<{
      total: number;
      data: IMission<ICVConfig>[];
    }>(`/cv/config`, {
      params: conditions,
      headers: {
        token: this.getToken()
      }
    });
    // return this.httpClient.get<ICVConfig>(`${BE_URL}/project/cv/config`, {
    //   params: condition
    // });
  }

  /**
   * 根据id获取单个CV任务
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVMission(id: string) {
    return this.httpClient.get<IMission<ICVConfig>>(`/cv/config/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 复制指定id的任务 并且赋予状态为初始化
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  copyCVMission(id: string) {
    return this.httpClient.get<IMission<ICVConfig>>(`/cv/config/copy/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 返回对应mission的监控url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVMonitorUrl(id: string) {
    return this.httpClient.get<string>(`/cv/config/monitor-url/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 返回对应mission的结果url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVResultUrl(id: string) {
    return this.httpClient.get<string>(`/cv/config/result-url/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 返回对应mission的结果url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVMissionData(id: string) {
    return this.httpClient.get<MissionData>(`/cv/config/get-mission-data/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 创建一个CV任务
   *
   * @param {ICVConfig} cvConfig
   * @return {*}
   * @memberof ModelConfigService
   */
  createCVMission(cvConfig: ICVConfig & { name: string }) {
    return this.httpClient.post<IMission<ICVConfig>>(
      `/cv/config/create`,
      {
        config: cvConfig
      },
      { headers: { token: this.getToken() } }
    );
  }

  /**
   * 激活CV任务
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  activeCVMission(id: string) {
    return this.httpClient.post<IMission<ICVConfig>>(
      `/cv/config/active-mission`,
      {
        id
      },
      { headers: { token: this.getToken() } }
    );
  }

  /**
   * 获取RL任务 筛选条件为path和status 如果没有筛选条件 返回全部
   *
   * @param {{ path?: string; status?: MissionStatusEnum }} conditions
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLMissions(conditions: { path?: string; status?: MissionStatusEnum }) {
    return this.httpClient.get<{
      total: number;
      data: IMission<IRLConfig>[];
    }>(`/rl/config`, {
      params: conditions,
      headers: {
        token: this.getToken()
      }
    });
    // return this.httpClient.get<IRLConfig>(`${BE_URL}/project/rl/config`, {
    //   params: condition
    // });
  }

  /**
   * 根据id获取单个RL任务
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLMission(id: string) {
    return this.httpClient.get<IMission<IRLConfig>>(`/rl/config/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 复制指定id的任务 并且赋予状态为初始化
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  copyRLMission(id: string) {
    return this.httpClient.get<IMission<IRLConfig>>(`/rl/config/copy/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 返回对应mission的监控url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLMonitorUrl(id: string) {
    return this.httpClient.get<string>(`/rl/config/monitor-url/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 返回对应mission的结果url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLResultUrl(id: string) {
    return this.httpClient.get<string>(`/rl/config/result-url/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 返回对应mission的结果url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLMissionData(id: string) {
    return this.httpClient.get<MissionData>(`/rl/config/get-mission-data/${id}`, {
      headers: {
        token: this.getToken()
      }
    });
  }

  /**
   * 创建一个RL任务
   *
   * @param {IRLConfig} cvConfig
   * @return {*}
   * @memberof ModelConfigService
   */
  createRLMission(cvConfig: IRLConfig & { name: string }) {
    return this.httpClient.post<IMission<IRLConfig>>(
      `/rl/config/create`,
      {
        config: cvConfig
      },
      { headers: { token: this.getToken() } }
    );
  }

  /**
   * 激活RL任务
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  activeRLMission(id: string) {
    return this.httpClient.post<IMission<IRLConfig>>(
      `/rl/config/active-mission`,
      {
        id
      },
      { headers: { token: this.getToken() } }
    );
  }
}
