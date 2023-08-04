import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControlDirective, NgForm } from '@angular/forms';
import { SEComponent } from '@delon/abc/se';
import { STChange, STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import Decimal from 'decimal.js';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { BehaviorSubject, Subject, switchMap, takeUntil } from 'rxjs';
import { ModelConfigService } from 'src/app/core/service';
import { BE_URL } from 'src/app/core/service/constant';
import { ImportData, ImportDataTypeEnum, MissionTypeEnum } from 'src/app/core/service/project/core';
import { ImportDataService } from 'src/app/core/service/project/import-data.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-model-comp-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})
export class ModelCompUploadComponent implements OnInit {
  record!: {
    id: string | null; // 不一定会出现
    type: ImportDataTypeEnum;
    missionType: MissionTypeEnum;
  };
  fileTypes = '';

  componentDestroyed$: Subject<void> = new Subject();

  @ViewChild('st') st!: STComponent;

  // 当前显示的文件列表
  currFiles: ImportData[] = [];

  // 搜索条件
  searchStream$ = new BehaviorSubject({
    keyword: ''
  });
  isFileLoading = true;

  // 表格
  page: STPage = {
    front: true,
    show: true,
    showSize: true
  };
  pageConfig = {
    pi: 1,
    ps: 10,
    total: 0
  };

  columns: STColumn[] = [
    // {
    //   title: '',
    //   index: 'id',
    //   type: 'checkbox'
    // },
    {
      title: '文件名',
      index: 'filename'
    },
    {
      title: '文件路径',
      index: 'url'
    },
    // {
    //   title: '文件大小',
    //   format: (record: ImportData) => {
    //     // 计算文件大小
    //     let size = record.size;

    //     if (size < 1024) {
    //       return `${size}B`;
    //     }

    //     size = new Decimal(size).div(1024).toDP(2).toNumber();
    //     if (size < 1024) {
    //       return `${size}KB`;
    //     }

    //     size = new Decimal(size).div(1024).toDP(2).toNumber();
    //     // GB级别数据不允许上传
    //     return `${size}MB`;
    //   }
    // },
    {
      title: '上传时间',
      index: 'created',
      type: 'date',
      dateFormat: 'yyyy-MM-dd HH:mm:ss'
    },
    {
      title: '操作',
      buttons: [
        {
          text: '下载',
          click: (record: ImportData) => {
            this.downloadFile(record);
          }
        },
        {
          text: '复制路径',
          click: (record: ImportData) => {
            this.clipboard.copy(record.url);
            this.msgSrv.success('复制成功');
          }
        },
        {
          text: '删除',
          className: 'text-error',
          click: (record: ImportData) => {
            this.modalSrv.confirm({
              nzTitle: '删除确认',
              nzContent: `删除后无法恢复，是否删除选定文件${record.filename}？`,
              nzOkText: '确认',
              nzOkType: 'primary',
              nzOkDanger: true,
              nzOnOk: () => {
                this.importDataService.deleteImportData(record.id).subscribe(() => {
                  this.msgSrv.success('删除成功');

                  // 删除当前选项 重新加载 但是这里不做请求
                  this.currFiles = this.currFiles.filter(file => file.id !== record.id);
                });
              },

              nzCancelText: '取消',
              nzOnCancel: () => {}
            });
          }
        }
      ]
    }
  ];

  // 新建目录模态框
  isBtnDisabled = false;

  // 上传模态框
  action = (file: NzUploadFile) => {
    return `${BE_URL}/import-data/upload?import_type=${this.record.type}&token=${this.modelConfigService.getToken()}&mission_type=${
      this.record.missionType
    }`;
  };
  uploadModalConfig = {
    isOpen: false,
    type: ImportDataTypeEnum.DATASETS
  };
  uploadModalFormData: {
    id: string | null;
    fileList: NzUploadFile[];
  } = {
    id: null,
    fileList: []
  };
  showUploadList = {
    showPreviewIcon: false,
    showRemoveIcon: false,
    showDownloadIcon: false
  };

  // 判断所有的文件都完成上传
  get uploadValid() {
    return (
      this.uploadModalFormData.fileList &&
      this.uploadModalFormData.fileList.length > 0 &&
      this.uploadModalFormData.fileList.every(file => file.status === 'done')
    );
  }

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private clipboard: Clipboard,
    private modalSrv: NzModalService,
    private modalRef: NzModalRef,
    private modelConfigService: ModelConfigService,
    private importDataService: ImportDataService
  ) {}

  ngOnInit(): void {
    this.fileTypes = this.record.type === ImportDataTypeEnum.DATASETS ? '.csv,.txt,.zip,.tar.gz' : '.pth,.zip,.tar.gz';

    this.loadData();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }

  downloadFile(record: ImportData) {
    // 下载功能
    this.importDataService.downloadFile(record.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // load数据
  loadData() {
    this.searchStream$
      .pipe(
        takeUntil(this.componentDestroyed$),
        switchMap(searchConfig => {
          this.isFileLoading = true;

          return this.importDataService.getImportDataList({
            token: this.modelConfigService.getToken(),
            missionType: this.record.missionType,
            type: this.record.type,
            keyword: searchConfig.keyword
          });
        })
      )
      .subscribe(({ data, total }) => {
        this.pageConfig.total = total;
        this.currFiles = data;
        this.isFileLoading = false;
      });
  }

  search() {
    this.pageConfig.pi = 1;
    this.searchStream$.next({
      ...this.searchStream$.value
    });
  }
  searchReset() {
    this.st.clearSort();

    this.pageConfig.pi = 1;

    this.searchStream$.next({
      keyword: ''
    });
  }

  ngModelChange(type: 'keyword' | 'upload', e: any) {
    switch (type) {
      case 'keyword':
        // 搜索
        this.searchStream$.next({
          ...this.searchStream$.value,
          keyword: e as string
        });
        break;

      case 'upload':
        const uploadParams = e as NzUploadChangeParam;
        const { file, fileList } = uploadParams;

        const status = file.status;
        if (status !== 'uploading') {
          console.log(file, fileList);
        }
        if (status === 'done') {
          this.msgSrv.success(`${file.name} 上传成功`);
          // 重新加载数据
          this.searchStream$.next({ ...this.searchStream$.value });
          this.cancelUploadModal();
        } else if (status === 'error') {
          this.msgSrv.error(`${file.name} 上传失败，请重新尝试`);
        }
        break;

      default:
        break;
    }
  }

  change(e: STChange) {
    switch (e.type) {
      case 'pi':
        this.pageConfig.pi = e.pi;
        break;
      case 'ps':
        this.pageConfig.ps = e.ps;
        break;
        // case 'checkbox':
        //   this.checkList = e.checkbox as ImportData[];

        break;

      default:
        break;
    }
  }

  // 上传文件
  uploadFile() {
    this.uploadModalFormData = {
      id: this.record.id,
      fileList: []
    };
    this.uploadModalConfig = {
      isOpen: true,
      type: this.record.type
    };
  }

  // 处理上传数据
  transformFile = (file: NzUploadFile): NzUploadFile => {
    console.log(file);
    file['importType'] = this.record.type;
    file['missionId'] = this.record.id;
    file['token'] = this.modelConfigService.getToken();
    return file;
  };

  // beforeUpload = (file: NzUploadFile): FormData => {
  //   const formData = new FormData();
  //   formData.append('file', file as any);
  //   formData.append('missionId', this.record.id);
  //   formData.append('importType', this.record.type);
  //   return formData;
  // };

  cancelUploadModal() {
    this.uploadModalConfig.isOpen = false;
  }

  close(): void {
    this.modalRef.destroy();
  }
}
