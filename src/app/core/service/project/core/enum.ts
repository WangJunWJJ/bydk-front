/**
 * RL算法
 *
 * @export
 * @enum {number}
 */
export enum RLAlgorithmEnum {
  dqn = 'dqn',
  ppo = 'ppo',
  a2c = 'a2c',
  maddpg = 'maddpg',
  qmix = 'qmix',
  dac = 'dac'
}

/**
 * CV算法
 *
 * @export
 * @enum {number}
 */
export enum CVAlgorithmEnum {
  fgsm = 'fgsm',
  ifgsm = 'ifgsm',
  mifgsm = 'mifgsm',
  advgan = 'advgan',
  patch = 'patch'
}

/**
 * RL config中的mode 三选一
 *
 * @export
 * @enum {number}
 */
export enum RLModeEnum {
  deploy = 'deploy',
  ser = 'ser',
  dev = 'dev'
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
  Done = 'done' // 任务已结束
}
