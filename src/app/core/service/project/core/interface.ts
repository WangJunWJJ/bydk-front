import { CVAlgorithmEnum, MissionStatusEnum, RLAlgorithmEnum, RLModeEnum } from '.';

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
  path: string; //	配置文件存储路径(工程路径之下)
  model: CVAlgorithmEnum; //	算法类型（有限种类中选择）
  clean_train_data_dir: string; //	路径信息
  clean_test_data_dir: string; //	路径信息
  adv_train_data_dir: string; //	路径信息
  adv_test_data_dir: string; //	路径信息
  label_dir: string; //	路径信息
  patch_dir: string; //	路径信息
  orig_model_dir: string; //	路径信息
  target_mode_dir: string; //	路径信息
  weather_augmentations: string; //	路径信息
  config_opts_dir: string; //	算法配置信息
  else_config_info: IYamlFile; // 用户自定义配置信息（扩展）
}

/**
 * RL参数配置
 *
 * @export
 * @interface IRLConfig
 */
export interface IRLConfig {
  path: string; //	配置文件存储路径(工程路径之下)
  algorithm: RLAlgorithmEnum; //	算法类型(六种RL算法中选择)
  algorithm_type: boolean; //	是否on-policy
  mode?: RLModeEnum; //	deploy/ser/dev 三选一，
  server_num: number; // 整型
  collection_env_num: number; // 整型
  max_episode_length: number; // 整型
  worker_num: number; // 整型
  env_num: number; // 整型
  batch_size: number; // 整型
  memory_size?: number; // 整型
  init_step_count?: number; // 整型
  samples_per_insert: number; // float
  learning_rate: number; // float
  render: boolean; //	是否渲染
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
  url?: string; // 用于监控地址的url

  path: string; // 对应path位置 用于索引
  status: MissionStatusEnum; // 任务是否正在执行
  config: T; // 对应的config信息
}
