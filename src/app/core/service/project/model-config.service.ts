import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICVConfig, IMission, IRLConfig, MissionData, MissionStatusEnum } from './core';
import { BE_URL } from '../constant';

export type missionCondition = {
  ps: number;
  pi: number;
  keyword?: string;
  status?: MissionStatusEnum;
};

@Injectable({
  providedIn: 'root'
})
export class ModelConfigService {
  rltoken!: string;
  constructor(private httpClient: HttpClient, private msgSrv: NzMessageService) {}

  /**
   * 获取token
   *
   * @return {*}  {string}
   * @memberof ModelConfigService
   */
  getToken(): string {
    // token没有被初始化 阻止请求进行
    if (this.rltoken == null) {
      this.msgSrv.warning('token还没有初始化');
      throw new Error('token还没有初始化');
    }
    return this.rltoken;
  }

  /**
   * 设置token
   *
   * @param {string} token
   * @memberof ModelConfigService
   */
  setToken(token: string) {
    this.rltoken = token;
  }

  /**
   * 获取CV任务 筛选条件为path和status 如果没有筛选条件 返回全部
   *
   * @param {{ path?: string; status?: MissionStatusEnum }} conditions
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVMissions(conditions: missionCondition) {
    return this.httpClient.get<{
      total: number;
      data: IMission<ICVConfig>[];
    }>(`${BE_URL}/cv/config`, {
      params: conditions,
      headers: {
        rltoken: this.getToken()
      }
    });
    // return this.httpClient.get<ICVConfig>(`${BE_URL}/project${BE_URL}/cv/config`, {
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
    return this.httpClient.get<IMission<ICVConfig>>(`${BE_URL}/cv/config/${id}`, {
      headers: {
        rltoken: this.getToken()
      }
    });
  }

  /**
   * 删除cv任务
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  deleteCVMission(id: string) {
    return this.httpClient.delete<{ msg: string }>(`${BE_URL}/cv/config/${id}`, {
      headers: {
        rltoken: this.getToken()
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
    return this.httpClient.post<IMission<ICVConfig>>(
      `${BE_URL}/cv/config/copy`,
      { id },
      {
        headers: {
          rltoken: this.getToken()
        }
      }
    );
  }

  /**
   * 返回对应mission的监控url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getCVMonitorUrl(id: string) {
    return this.httpClient.get<string>(`${BE_URL}/cv/config/monitor-url/${id}`, {
      headers: {
        rltoken: this.getToken()
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
    return this.httpClient.get<string>(`${BE_URL}/cv/config/result-url/${id}`, {
      headers: {
        rltoken: this.getToken()
      }
    });
  }

  /**
   * 下载生成模型
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  downloadCVTargetModels(id: string) {
    return this.httpClient.get(`${BE_URL}/cv/config/download-models/${id}`, {
      responseType: 'blob',
      headers: {
        rltoken: this.getToken()
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
    return this.httpClient.get<MissionData>(`${BE_URL}/cv/config/get-mission-data/${id}`, {
      headers: {
        rltoken: this.getToken()
      }
    });
  }

  /**
   * 创建RL任务
   *
   * @param {ICVConfig} cvConfig
   * @return {*}
   * @memberof ModelConfigService
   */
  createCVMission(cvConfig: ICVConfig & { name: string }) {
    return this.httpClient.post<IMission<ICVConfig>>(`${BE_URL}/cv/config`, cvConfig, { headers: { rltoken: this.getToken() } });
  }

  /**
   * 更新任务
   *
   * @param {ICVConfig} cvConfig
   * @return {*}
   * @memberof ModelConfigService
   */
  updateCVMission(id: string, cvConfig: ICVConfig & { name: string }) {
    return this.httpClient.put<IMission<ICVConfig>>(`${BE_URL}/cv/config/${id}`, cvConfig, {
      headers: { rltoken: this.getToken() }
    });
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
      `${BE_URL}/cv/config/active-mission`,
      {
        id
      },
      { headers: { rltoken: this.getToken() } }
    );
  }

  /**
   * 获取RL任务 筛选条件为path和status 如果没有筛选条件 返回全部
   *
   * @param {{ path?: string; status?: MissionStatusEnum }} conditions
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLMissions(conditions: missionCondition) {
    return this.httpClient.get<{
      total: number;
      data: IMission<IRLConfig>[];
    }>(`${BE_URL}/rl/config`, {
      params: conditions,
      headers: {
        rltoken: this.getToken()
      }
    });
    // return this.httpClient.get<IRLConfig>(`${BE_URL}/project${BE_URL}/rl/config`, {
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
    return this.httpClient.get<IMission<IRLConfig>>(`${BE_URL}/rl/config/${id}`, {
      headers: {
        rltoken: this.getToken()
      }
    });
  }

  /**
   * 删除cv任务
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  deleteRLMission(id: string) {
    return this.httpClient.delete<{ msg: string }>(`${BE_URL}/rl/config/${id}`, {
      headers: {
        rltoken: this.getToken()
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
    return this.httpClient.post<IMission<IRLConfig>>(
      `${BE_URL}/rl/config/copy`,
      { id },
      {
        headers: {
          rltoken: this.getToken()
        }
      }
    );
  }

  /**
   * 返回对应mission的监控url
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  getRLMonitorUrl(id: string) {
    return this.httpClient.get<string>(`${BE_URL}/rl/config/monitor-url/${id}`, {
      headers: {
        rltoken: this.getToken()
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
    return this.httpClient.get<string>(`${BE_URL}/rl/config/result-url/${id}`, {
      headers: {
        rltoken: this.getToken()
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
    return this.httpClient.get<MissionData>(`${BE_URL}/rl/config/get-mission-data/${id}`, {
      headers: {
        rltoken: this.getToken()
      }
    });
  }

  /**
   * 创建RL任务
   *
   * @param {IRLConfig} cvConfig
   * @return {*}
   * @memberof ModelConfigService
   */
  createRLMission(cvConfig: IRLConfig & { name: string }) {
    return this.httpClient.post<IMission<IRLConfig>>(`${BE_URL}/rl/config`, cvConfig, { headers: { rltoken: this.getToken() } });
  }

  /**
   * 更新任务
   *
   * @param {IRLConfig} cvConfig
   * @return {*}
   * @memberof ModelConfigService
   */
  updateRLMission(id: string, cvConfig: IRLConfig & { name: string }) {
    return this.httpClient.put<IMission<IRLConfig>>(`${BE_URL}/rl/config/${id}`, cvConfig, {
      headers: { rltoken: this.getToken() }
    });
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
      `${BE_URL}/rl/config/active-mission`,
      {
        id
      },
      { headers: { rltoken: this.getToken() } }
    );
  }

  /**
   * 下载生成模型
   *
   * @param {string} id mission id
   * @return {*}
   * @memberof ModelConfigService
   */
  downloadRLTargetModels(id: string) {
    return this.httpClient.get(`${BE_URL}/rl/config/download-models/${id}`, {
      responseType: 'blob',
      headers: {
        rltoken: this.getToken()
      }
    });
  }
}
