import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@/assets/styles/main.css'
import '@/assets/styles/animations.css'
import 'vue3-toastify/dist/index.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@/assets/icons'
import Vue3Toastify, {toast} from 'vue3-toastify'

import App from './App.vue'
import router from './router'

import { useAuthStore } from '@/stores/auth';
import type { ApiError } from './types';


async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  
  const auth = useAuthStore();

  await auth.fetchCurrentUser();

  // 全域註冊路由
  app.use(router);

  // 全域註冊 Vue3Toastify
  app.use(Vue3Toastify, {
    autoClose: 2500,
    position: 'top-right',
    theme: 'light',
    newestOnTop: false,
  })

  // 全域註冊 FontAwesomeIcon 組件
  app.component('FontAwesomeIcon', FontAwesomeIcon);


  // Vue 全域錯誤處理
  app.config.errorHandler = (err, instance, info) => {

    console.error('[Vue Error]', err)
    
    if (import.meta.env.DEV) {
      console.error('[Info]', info)
      console.error('[Instance]', instance)
    }

    // ApiError 統一處理
    if (typeof err === 'object' && err !== null && 'type' in err &&
      'message' in err) {
      const apiError = err as ApiError

      // CLIENT_ERROR = 開發錯誤
      if (apiError.type === 'CLIENT_ERROR') {
        // 只在 DEV 顯示
        if (import.meta.env.DEV) {
          console.warn(
            '[CLIENT ERROR]',
            {
              message: apiError.message,
              debugMessage: apiError.debugMessage,
              code: apiError.code,
            }
          )
        }
        return
      }


      toast.error(apiError.message)
      return
    }

    // 未知錯誤
    toast.error('系統發生錯誤，請稍後再試')
  }
  
  app.mount('#app')
}

bootstrap();