import { api } from './apiClient';
import { setupRefreshInterceptor } from '@/api/core/interceptors/refresh';
import { setupErrorInterceptor } from '@/api/core/interceptors/error';

setupRefreshInterceptor(api);
setupErrorInterceptor(api);

export default api;
