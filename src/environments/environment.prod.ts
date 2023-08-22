import { DelonMockModule } from '@delon/mock';
import { Environment } from '@delon/theme';

import * as MOCKDATA from '../../_mock';

export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  // 后端地址
  BE_URL: 'http://127.0.0.1:3000',
  MONITOR_URL: 'http://127.0.0.1:8080',
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;
