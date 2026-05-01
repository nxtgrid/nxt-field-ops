import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },

  {
    path: '/meters',
    name: 'meters',
    component: () => import('@/views/Meters/MetersView.vue'),
  },

  {
    path: '/meters/select-customer',
    name: 'meters-select-customer',
    component: () => import('@/views/Meters/SelectCustomerView.vue'),
  },

  {
    path: '/meters/assign',
    component: () => import('@/views/Meters/assign/AssignView.vue'),
    children: [
      { path: '', redirect: 'general' },
      {
        path: 'meter-number',
        name: 'meters-assign-meter-number',
        meta: { step: 1 },
        component: () => import('@/views/Meters/assign/MeterNumber.vue'),
      },
      {
        path: 'meter-number-reversed',
        name: 'meters-assign-meter-number-reversed',
        meta: { step: 2 },
        component: () => import('@/views/Meters/assign/MeterNumberReversed.vue'),
      },
      {
        path: 'meter-details',
        name: 'meters-assign-meter-details',
        meta: { step: 3 },
        component: () => import('@/views/Meters/assign/MeterDetails.vue'),
      },
    ],
  },

  {
    path: '/poles',
    name: 'poles',
    component: () => import('@/views/Poles/PolesView.vue'),
  },

  {
    path: '/poles/tag',
    name: 'poles--tag',
    component: () => import('@/views/Poles/PoleTagView.vue'),
  },

  // Auth
  {
    path: '/account/forgot-password',
    name: 'account--forgot-password',
    meta: { public: true },
    component: () => import('@/views/Account/ForgotPasswordView.vue'),
  },

  {
    path: '/account/verify',
    name: 'account--verify',
    meta: { public: true, isReset: false },
    component: () => import('@/views/Account/SetPasswordView.vue'),
  },

  {
    path: '/account/reset-password',
    name: 'account--reset-password',
    meta: { public: true, isReset: true },
    component: () => import('@/views/Account/SetPasswordView.vue'),
  },

  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
