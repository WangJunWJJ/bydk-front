import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICVConfig, IMission, IRLConfig, MissionStatusEnum } from './core';
import { BE_URL } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmService {
  constructor(private httpClient: HttpClient) {
    // TODO 从url获取token 此处为mock
    this.setToken('abcabc12');
  }

  /**
   * 获取token
   *
   * @return {*}  {string}
   * @memberof AlgorithmService
   */
  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  /**
   * 设置token
   *
   * @param {string} token
   * @memberof AlgorithmService
   */
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
   * 获取CV任务 筛选条件为path和status 如果没有筛选条件 返回全部
   *
   * @param {{ path?: string; status?: MissionStatusEnum }} conditions
   * @return {*}
   * @memberof AlgorithmService
   */
  getCVMissions(conditions: { path?: string; status?: MissionStatusEnum }) {
    return this.httpClient.get<{
      total: number;
      data: IMission<ICVConfig>[];
    }>(`/cv/get-config`, {
      params: conditions,
      headers: {
        token: this.getToken()
      }
    });
    // return this.httpClient.get<ICVConfig>(`${BE_URL}/project/cv/get-config`, {
    //   params: condition
    // });
  }

  /**
   * 根据id获取单个CV任务
   *
   * @param {string} id
   * @return {*}
   * @memberof AlgorithmService
   */
  getCVMission(id: string) {
    return this.httpClient.get<IMission<ICVConfig>>(`/cv/get-config/${id}`, {
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
   * @memberof AlgorithmService
   */
  createCVMission(cvConfig: ICVConfig) {
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
   * @memberof AlgorithmService
   */
  activeCVMission(id: string) {
    return this.httpClient.post<IMission<ICVConfig>>(
      `/cv/config/create`,
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
   * @memberof AlgorithmService
   */
  getRLMissions(conditions: { path?: string; status?: MissionStatusEnum }) {
    return this.httpClient.get<{
      total: number;
      data: IMission<IRLConfig>[];
    }>(`/rl/get-config`, {
      params: conditions,
      headers: {
        token: this.getToken()
      }
    });
    // return this.httpClient.get<IRLConfig>(`${BE_URL}/project/rl/get-config`, {
    //   params: condition
    // });
  }

  /**
   * 根据id获取单个RL任务
   *
   * @param {string} id
   * @return {*}
   * @memberof AlgorithmService
   */
  getRLMission(id: string) {
    return this.httpClient.get<IMission<IRLConfig>>(`/rl/get-config/${id}`, {
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
   * @memberof AlgorithmService
   */
  createRLMission(cvConfig: IRLConfig) {
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
   * @memberof AlgorithmService
   */
  activeRLMission(id: string) {
    return this.httpClient.post<IMission<IRLConfig>>(
      `/rl/config/create`,
      {
        id
      },
      { headers: { token: this.getToken() } }
    );
  }
}
