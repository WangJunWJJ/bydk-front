import { MockRequest } from '@delon/mock';
import { CVAlgorithmEnum, ICVConfig, IMission, IRLConfig, MissionStatusEnum, RLAlgorithmEnum } from 'src/app/core/service/project/core';
import { nonceStr } from 'src/app/shared/utils/utils';

const cvList: IMission<ICVConfig>[] = [];
const rlList: IMission<IRLConfig>[] = [];

// 假设token为8位小写字母和数字混合组成
const mockTokens = ['abcabc12', 'aaaaaa12'];

/**
 * 获取数组arr中的随机一个元素
 *
 * @template T
 * @param {Array<T>} arr
 */
function getRandomItem<T>(arr: Array<T>): T {
  const len = arr.length;
  const index = Math.floor(Math.random() * len); // [0,len)
  return arr[index];
}

function generateData(len: number = 20) {
  const cvAlgorithms = Object.values(CVAlgorithmEnum);
  const rlAlgorithms = Object.values(RLAlgorithmEnum);
  const missionStatusArr = Object.values(MissionStatusEnum);
  const booleanArr = [true, false];

  // 生成cv数据
  for (let i = 0; i < len; i++) {
    const path = `home/administrator/${nonceStr(6)}`;
    const time = new Date().getTime();
    cvList.push({
      id: nonceStr(16), // 生成随机16位id
      token: getRandomItem(mockTokens),
      path,
      status: getRandomItem(missionStatusArr),
      name: `cv任务${i + 1}`,
      created: time,
      updated: time,

      config: {
        path, //	配置文件存储路径(工程路径之下)
        model: getRandomItem(cvAlgorithms), //	算法类型（有限种类中选择）
        clean_train_data_dir: nonceStr(5), //	路径信息
        clean_test_data_dir: nonceStr(5), //	路径信息
        adv_train_data_dir: nonceStr(5), //	路径信息
        adv_test_data_dir: nonceStr(5), //	路径信息
        label_dir: nonceStr(5), //	路径信息
        patch_dir: nonceStr(5), //	路径信息
        orig_model_dir: nonceStr(5), //	路径信息
        target_mode_dir: nonceStr(5), //	路径信息
        weather_augmentations: nonceStr(5), //	路径信息
        config_opts_dir: nonceStr(5), //	算法配置信息
        else_config_info: {} // 用户自定义配置信息（扩展）
      }
    });
  }

  // 生成rl数据
  for (let i = 0; i < len; i++) {
    const path = `home/administrator/${nonceStr(6)}`;
    const time = new Date().getTime();
    rlList.push({
      id: nonceStr(16), // 生成随机16位id
      token: getRandomItem(mockTokens),
      path,
      name: `rl任务${i + 1}`,
      status: getRandomItem(missionStatusArr),
      created: time,
      updated: time,

      config: {
        path, //	配置文件存储路径(工程路径之下)
        algorithm: getRandomItem(rlAlgorithms), //	算法类型（有限种类中选择）
        algorithm_type: getRandomItem(booleanArr),
        server_num: 1, // 整型
        init_step_count: 2, // 整型
        samples_per_insert: 1.0, // float
        memory_size: 16, // 整型
        collection_env_num: 2, // 整型
        learning_rate: 2.0, // float
        batch_size: 3, // 整型
        max_episode_length: 200, // 整型
        worker_num: 10, // 整型
        env_num: 5, // 整型
        render: getRandomItem(booleanArr) //	是否渲染
      }
    });
  }
}

generateData(30);

/**
 * 根据token 和 status进行数据筛选 后端实现应该直接用筛选器来操作
 *
 * @param {({ type: 'cv' | 'rl'; token: string; status?: MissionStatusEnum })} { token, type, status }
 * @return {*}  {({
 *   total: number;
 *   data: IMission<ICVConfig | IRLConfig>[];
 * })}
 */
function getList({ token, type, status, path }: { type: 'cv' | 'rl'; token: string; status?: MissionStatusEnum; path?: string }): {
  total: number;
  data: IMission<ICVConfig | IRLConfig>[];
} {
  if (type === 'cv') {
    const ret = cvList.filter(item => {
      // 如果筛选条件有 进行筛选 没有（==null）则跳过
      return item.token === token && (status == null || item.status === status) && (path == null || item.path === path);
    });
    return {
      total: ret.length,
      data: ret
    };
  } else {
    const ret = rlList.filter(item => {
      // 如果筛选条件有 进行筛选 没有（==null）则跳过
      return item.token === token && (status == null || item.status === status) && (path == null || item.path === path);
    });
    return {
      total: ret.length,
      data: ret
    };
  }
}

/**
 * 获取一个元素 通过id和path进行筛选
 *
 * @param {({
 *   token: string;
 *   type: 'cv' | 'rl';
 *   id?: string;
 *   path?: string;
 * })} {
 *   token,
 *   type,
 *   id,
 *   path
 * }
 * @return {*}  {(IMission<ICVConfig | IRLConfig>)}
 */
function getOne({ token, type, id }: { token: string; type: 'cv' | 'rl'; id?: string }): IMission<ICVConfig | IRLConfig> {
  if (!id) {
    throw new Error(`未输入id`);
  }

  if (type === 'cv') {
    const target = cvList.find(item => {
      return item.token === token && item.id === id;
    });
    if (target == null) {
      throw new Error(`未找到${id}对应任务`);
    }
    return target;
  } else {
    const target = rlList.find(item => {
      return item.token === token && item.id === id;
    });
    if (target == null) {
      throw new Error(`未找到${id}对应任务`);
    }
    return target;
  }
}

export const MODEL_CONFIGS = {
  '/cv/config': (
    req: MockRequest
  ): {
    total: number;
    data: IMission<ICVConfig>[];
  } => {
    const token: string = req.headers.token;
    const params: { status?: MissionStatusEnum } = req.queryString;
    console.log({ token, params });

    return getList({ type: 'cv', token, ...params }) as {
      total: number;
      data: IMission<ICVConfig>[];
    };
  },
  '/cv/config/:id': (req: MockRequest): IMission<ICVConfig> => {
    const token: string = req.headers.token;
    return getOne({ type: 'cv', token, id: req.params.id }) as IMission<ICVConfig>;
  },
  '/cv/config/copy/:id': (req: MockRequest): IMission<ICVConfig> => {
    const token: string = req.headers.token;
    // 找到原始任务
    const originMission = getOne({ type: 'cv', token, id: req.params.id }) as IMission<ICVConfig>;

    // 创建新任务
    const time = new Date().getTime();
    const newMission: IMission<ICVConfig> = {
      ...originMission,
      id: nonceStr(16), // 生成随机16位id,
      name: `${originMission.name}-副本`,
      token: token,
      status: MissionStatusEnum.Init,
      created: time,
      updated: time
    };
    cvList.push(newMission);
    return newMission;
  },
  '/cv/config/monitor-url/:id': (req: MockRequest): string => {
    // TODO 更新url获取
    return 'http://localhost:8080/';
  },
  '/cv/config/result-url/:id': (req: MockRequest): string => {
    // TODO 更新url获取
    return 'http://localhost:6006/';
  },
  'POST /cv/config/active-mission': (req: MockRequest): IMission<ICVConfig> => {
    const token: string = req.headers.token;
    const targetMission = getOne({ type: 'cv', token, id: req.body.id });

    // 设置任务状态为执行状态
    // TODO 开始执行任务的逻辑
    targetMission.status = MissionStatusEnum.Active;
    targetMission.updated = new Date().getTime();
    return targetMission as IMission<ICVConfig>;
  },
  // 正常应该以create方法构建
  'POST /cv/config/create': (req: MockRequest): IMission<ICVConfig> => {
    const token: string = req.headers.token;
    const dto = req.body.config as ICVConfig & { name: string };
    const time = new Date().getTime();
    const mission: IMission<ICVConfig> = {
      id: nonceStr(16), // 生成随机16位id
      name: dto.name,
      token: token,
      path: dto.path,
      status: MissionStatusEnum.Init,
      created: time,
      updated: time,
      config: dto
    };
    cvList.push(mission);
    return mission;
  },
  '/rl/config': (
    req: MockRequest
  ): {
    total: number;
    data: IMission<IRLConfig>[];
  } => {
    const token: string = req.headers.token;
    const params: { status?: MissionStatusEnum } = req.queryString;
    console.log({ token, params });

    return getList({ type: 'rl', token, ...params }) as {
      total: number;
      data: IMission<IRLConfig>[];
    };
  },
  '/rl/config/:id': (req: MockRequest): IMission<IRLConfig> => {
    const token: string = req.headers.token;
    return getOne({ type: 'rl', token, id: req.params.id }) as IMission<IRLConfig>;
  },
  '/rl/config/copy/:id': (req: MockRequest): IMission<IRLConfig> => {
    const token: string = req.headers.token;
    // 找到原始任务
    const originMission = getOne({ type: 'rl', token, id: req.params.id }) as IMission<IRLConfig>;

    // 创建新任务
    const time = new Date().getTime();
    const newMission: IMission<IRLConfig> = {
      ...originMission,
      id: nonceStr(16), // 生成随机16位id,
      name: `${originMission.name}-副本`,
      token: token,
      status: MissionStatusEnum.Init,
      created: time,
      updated: time
    };
    rlList.push(newMission);
    return newMission;
  },
  '/rl/config/monitor-url/:id': (req: MockRequest): string => {
    return 'http://localhost:8080/';
  },
  '/rl/config/result-url/:id': (req: MockRequest): string => {
    return 'http://localhost:6006/';
  },
  'POST /rl/config/active-mission': (req: MockRequest): IMission<IRLConfig> => {
    const token: string = req.headers.token;
    const targetMission = getOne({ type: 'rl', token, id: req.body.id });

    // 设置任务状态为执行状态
    // TODO 开始执行任务的逻辑
    targetMission.status = MissionStatusEnum.Active;
    targetMission.updated = new Date().getTime();
    return targetMission as IMission<IRLConfig>;
  },
  // 正常应该以create方法构建
  'POST /rl/config/create': (req: MockRequest): IMission<IRLConfig> => {
    const token: string = req.headers.token;
    const dto = req.body.config as IRLConfig & { name: string };
    const time = new Date().getTime();
    // TODO 在创建的同时应该执行数据写入操作 将任务的config写到指定的数据位置
    const mission: IMission<IRLConfig> = {
      id: nonceStr(16), // 生成随机16位id
      token: token,
      name: dto.name,
      path: dto.path,
      status: MissionStatusEnum.Init,
      created: time,
      updated: time,
      config: dto
    };
    rlList.push(mission);
    return mission;
  }
};
