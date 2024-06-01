/**
 * 任务类型
 *
 * @export
 * @enum {number}
 */
export enum MissionTypeEnum {
  CV = 'cv',
  RL = 'rl'
}

/**
 * RL算法
 *
 * @export
 * @enum {number}
 */
export enum RLAlgorithmEnum {
  DQN = 'DQN',
  PPO = 'PPO',
  A2C = 'A2C',
  MADDPG = 'MADDPG',
  QMIX = 'QMIX',
  DAC = 'DAC'
}

/**
 * 网络类型
 *
 * @export
 * @enum {number}
 */
export enum RLModelEnum {
  DNN = 'DNN',
  RNN = 'RNN'
}

/**
 * CV算法
 *
 * @export
 * @enum {number}
 */
export enum CVAlgorithmEnum {
  FGSM = 'FGSM',
  IFGSM = 'IFGSM',
  MIFGSM = 'MIFGSM',
  advGAN = 'advGAN',
  Patch = 'Patch'
}

/**
 * 视觉任务分类
 *
 * @export
 * @enum {number}
 */
export enum CVTypeEnum {
  classification = 'classification', // 目标分类
  detection = 'detection' // 目标检测
}

/**
 * 训练任务类型
 *
 * @export
 * @enum {number}
 */
export enum CVTaskTypeEnum {
  train = 'train', // 模型生成
  sample = 'sample', // 样本生成
  adv_train = 'adv_train' // 对抗训练
}

/**
 * 任务状态
 *
 * @export
 * @enum {number}
 */
export enum MissionStatusEnum {
  Init = 'init', // 初始化 提交了任务config 还没有执行
  Active = 'active', // 对提交的任务点击了执行任务
  End = 'end', // 任务已终止
  Done = 'done' // 任务已结束
}

/**
 * cluster的日志类型
 *
 * @export
 * @enum {number}
 */
export enum ClusterLogTypeEnum {
  All = 'all',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Debug = 'debug'
}

/**
 * 任务上传文件类型
 *
 * @export
 * @enum {number}
 */
export enum ImportDataTypeEnum {
  DATASETS = 'datasets', // 数据集
  MODELS = 'models' // 预训练模型
}
