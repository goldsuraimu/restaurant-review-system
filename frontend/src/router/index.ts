import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import { isValidUUID } from '@/utils/validator'

import {
  USER_ROLES,
  type UserRole,
} from '@/types/user'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /* ========= 基本 ========= */
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/',
      meta: { guestOnly: true },
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { 
          path: 'login', 
          name: 'Login',
          component: () => import('@/views/auth/LoginView.vue') 
        },
        { 
          path: 'register', 
          name: 'Register', 
          component: () => import('@/views/auth/RegisterView.vue') 
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/FrontLayout.vue'),
      children: [
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/auth/HomeView.vue')
        },

        /* ========= 使用者 ========= */
        {
          path: 'user-profile',
          name: 'UserProfile',
          meta: { requiresAuth: true },
          component: () => import('@/views/user/UserProfileView.vue')
        },
        {
          path: 'edit-profile',
          name: 'EditProfile',
          meta: { requiresAuth: true },
          component: () => import('@/views/user/EditProfileView.vue')
        },

        {
          path: 'become-owner',

          name: 'BecomeOwner',

          meta: {
            requiresAuth: true
          },

          component: () =>
            import('@/views/user/BecomeOwnerView.vue')
        },

        /* ========= 前台：餐廳 ========= */
        {
          path: 'restaurants/:uuid',
          name: 'RestaurantDetail',
          component: () => import('@/views/public/restaurant/RestaurantDetailView.vue'),
          beforeEnter: (to) => {
            const raw = to.params.uuid;

            if (!isValidUUID(raw)) {
              return { name: 'notFound' }; 
            }
          },
        }
      ]
    },

    /* ========= 後台：店主 ========= */
    {
      path: '/owner',
      meta: {
        requiresAuth: true,

        role: USER_ROLES.OWNER,
      },

      component: () => import('@/layouts/OwnerLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'OwnerDashboard',
          component: () => import('@/views/owner/OwnerDashboardView.vue'),
        },
        {
          path: 'restaurants/rating',
          name: 'OwnerRestaurantRatingList',
          component: () => import('@/views/owner/OwnerRestaurantRatingList.vue'),
        },
        {
          path: 'reviews',
          name: 'OwnerAllReviews',
          component: () => import('@/views/owner/OwnerAllReviewsView.vue'),
        },
        {
          path: 'restaurants',
          name: 'OwnerRestaurants',
          component: () => import('@/views/owner/OwnerRestaurantsView.vue'),
        },
        {
          path: 'restaurants/:uuid/reviews',
          name: 'ManageReviews',
          component: () =>
            import('@/views/owner/OwnerRestaurantReviewsView.vue'),
          beforeEnter: (to) => {
            const raw = to.params.uuid;

            if (!isValidUUID(raw)) {
              return { name: 'notFound' };
            }
          },
        },
        {
          path: 'restaurants/create',
          name: 'OwnerRestaurantCreate',
          component: () => import('@/views/owner/CreateRestaurantView.vue'),
        },
        {
          path: 'restaurants/:uuid/edit',
          name: 'OwnerRestaurantEdit',
          component: () => import('@/views/owner/EditRestaurantView.vue'),
          beforeEnter: (to) => {
            const raw = to.params.uuid;

            if (!isValidUUID(raw)) {
              return { name: 'notFound' };
            }
          },
          props: true,
        },
      ],
    },

    /* ========= 後台：管理員 ========= */
    {
      path: '/admin',
      meta: {
        requiresAuth: true,

        role: USER_ROLES.ADMIN,
      },

      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'restaurants/review',
          name: 'AdminRestaurantReview',
          component: () => import('@/views/admin/AdminRestaurantReviewView.vue'),
        },
        {
          path: 'restaurants/review/:uuid',
          name: 'AdminRestaurantReviewDetail',
          component: () => import('@/views/admin/AdminRestaurantReviewDetailView.vue'),
          beforeEnter: (to) => {
            const raw = to.params.uuid;

            if (!isValidUUID(raw)) {
              return { name: 'notFound' };
            }
          },
          props: true,
        },
      ],
    },
    {
      path: '/:catchAll(.*)*',
      name: 'notFound',
      component: () => import('@/views/public/NotFoundView.vue')
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  const isLoggedIn = auth.isAuthenticated;
  const userRole = auth.authUser?.role;
  
  // 處理路由權限

  // 訪客專用頁面，已登入則導回上一頁或首頁
  if (isLoggedIn && to.meta.guestOnly) {
    next(from.name ? from.fullPath : '/home')
  }
  
  // 需要登入但未登入
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 需要特定角色權限

  // 店主或管理員
  const requiredRole =
    to.meta.role as
    | UserRole
    | undefined

  if (requiredRole) {

    if (userRole !== requiredRole) {
      return next({
        name: 'Home',
      })
    }
  }

  next();
})


export default router
