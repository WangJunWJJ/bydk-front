import { CVTaskTypeEnum, CVTypeEnum, MissionTypeEnum, RLModelEnum } from './enum';
import { CVAlgorithmEnum, ImportDataTypeEnum, MissionStatusEnum, RLAlgorithmEnum } from '.';

/**
 * 用户自定义配置信息（扩展）
 *
 * @interface IYamlFile
 */
interface IYamlFile {
  [key: string]: any;
}

/**
 * CV参数配置
 *
 * @export
 * @interface ICVConfig
 */
export interface ICVConfig {
  // 必填
  task_name: string; // 任务名
  cv_type: CVTypeEnum; // 视觉任务分类
  task_type: CVTaskTypeEnum; // 训练任务类型
  algorithm_type?: CVAlgorithmEnum; // 对抗样本生成算法
  config_path: string; // 配置文件路径
  log_path: string; // 任务训练日志路径

  target_model_path?: string; // 训练模型保存路径
  train_data_path?: string; // 训练样本存放路径
  test_data_path?: string; // 测试样本存放路径
  original_data_path?: string; // 原始对抗样本路径
  adv_data_path?: string; // 生成对抗样本路径
  patch_dir?: string; // 目标检测贴图路径
  original_model_path?: string; // 原始智能感知模型路径
  advGAN_path?: string; // advGAN模型路径
  weather_augmentations?: boolean; //	是否加入天气干扰
  other_config?: string; // 自定义配置
}

/**
 * RL参数配置
 *
 * @export
 * @interface IRLConfig
 */
export interface IRLConfig {
  task_name: string; // 任务名
  config_path: string; // 配置文件路径
  model_path: string; // 模型保存路径
  log_path: string; // 训练日志路径
  collection_node_num: number; // 采集节点数量
  node_collection_num: number; // 单节点并行采集环境数量
  evaluation_num: number; // 评估环境数量
  store_node_num: number; // 存储节点数量
  decision_algorithm?: RLAlgorithmEnum; // 决策算法
  model_type?: RLModelEnum; // 网络类型
  other_config?: string; // 用户自定义配置信息（扩展）
}

/**
 * 任务信息entity
 *
 * @export
 * @interface IMission
 * @template T
 */
export interface IMission<T extends ICVConfig | IRLConfig> {
  id: string; // 任务id 用于标识任务
  name: string; // 任务名
  token: string; // 任务token 用于根据token的索引
  created: number; // 创建时间
  updated: number; // 更新时间

  monitorUrl?: string; // 用于监控地址的url
  resultUrl?: string; // 用于结果地址的url

  path: string; // 对应path位置 用于索引
  status: MissionStatusEnum; // 任务是否正在执行

  type: MissionTypeEnum;

  import_data?: ImportData[]; // 上传的数据集

  config: T; // 对应的config信息
}

/**
 * 上传数据entity
 * 包含数据集，模型
 *
 * @export
 * @interface IMission
 * @template T
 */
export interface ImportData {
  id: string;
  token: string; // token用于查询是谁的模型
  missionId: string; // 外键
  created: number; // 创建时间
  filename: string; // 文件名
  type: ImportDataTypeEnum; // 上传文件类型
  url: string; // 文件路径
}

/**
 * pycluster的返回数据
 *
 * @interface PyClusterResponse
 */
export interface PyClusterResponse {
  // client_list: any[];
  cluster_abstraction: ISlaveData;
  slave_list: ISlaveData[];
}

/**
 * 返回的系统监控数据
 *
 * @export
 * @interface ISlaveData
 */
export interface ISlaveData {
  cpu_count: number;
  cpu_workload: number[];
  ip?: string;
  memory_size: number;
  memory_usage: number[];
}

/**
 * 任务实时数据
 *
 * @export
 * @interface MissionData
 */
export interface MissionData {
  insert_total: number;
  sample_total: number;
  ave_insert_speed: number;
  ave_sample_speed: number;
  cur_insert_speed: number;
  cur_sample_speed: number;
  insert_block_time: number;
  sample_block_time: number;
  memory_usage: number;
  time: number;
}
