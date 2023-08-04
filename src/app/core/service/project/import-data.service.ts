import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICVConfig, IMission, IRLConfig, ImportData, ImportDataTypeEnum, MissionData, MissionStatusEnum, MissionTypeEnum } from './core';
import { BE_URL } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {
  constructor(private httpClient: HttpClient, private msgSrv: NzMessageService) {}

  /**
   * 获取上传数据信息
   *
   * @param {{ missionId: string; type: ImportDataTypeEnum }} conditions
   * @return {*}
   * @memberof ImportDataService
   */
  getImportDataList(conditions: { missionType: MissionTypeEnum; token: string; type: ImportDataTypeEnum; keyword: string }) {
    return this.httpClient.get<{
      total: number;
      data: ImportData[];
    }>(`${BE_URL}/import-data`, {
      params: conditions
    });
  }

  /**
   * 删除importData
   *
   * @param {string} id
   * @return {*}
   * @memberof ModelConfigService
   */
  deleteImportData(id: string) {
    return this.httpClient.delete<{ msg: string }>(`${BE_URL}/import-data/${id}`);
  }

  // 上传文件
  uploadFile(file: any, missionId: string, filename?: string) {
    const formData = new FormData();
    formData.append('missionId', missionId);
    if (filename) {
      formData.append('file', file, filename);
    } else {
      formData.append('file', file);
    }

    return this.httpClient.post<{
      filename: string;
      resource_id: string;
    }>(`${BE_URL}/import-data/upload`, formData, {
      params: {
        _allow_anonymous: 'true'
      }
    });
  }
  /**
   * 传入importData id 返回下载数据
   *
   * @param {string} id
   * @return {*}
   * @memberof ImportDataService
   */
  downloadFile(id: string) {
    return this.httpClient.get(`${BE_URL}/import-data/download/${id}`, {
      // observe: 'response',
      responseType: 'blob'
    });
  }
}
