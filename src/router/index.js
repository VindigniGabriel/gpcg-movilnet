import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import Auth from '@/views/Auth.vue'
import Office from '@/views/Office.vue'
import HomeOffice from '@/components/office/Home.vue'
import HomeRegister from '@/components/office/registers/Home.vue'
import HomeRequests from '@/components/office/requests/Home.vue'
import History from '@/components/office/history/Home.vue'
import CustomerSupport from '@/components/office/customerSupport/Home.vue'
import Quote from '@/components/office/quote/Home.vue'
import QueueM from '@/components/office/queueManager/Home.vue'
import Statistics from '@/components/office/statistics/Home.vue'
import Gpcg from '@/views/Gpcg.vue'
import HomeGpcg from '@/components/gpcg/Home.vue'
import Monitor from '@/components/gpcg/Monitor.vue'
import Offices from '@/components/gpcg/admin/Offices.vue'
import Managements from '@/components/gpcg/admin/Managements.vue'
import Directions from '@/components/gpcg/admin/Directions.vue'
import Services from '@/components/gpcg/admin/Services.vue'
import Requests from '@/components/gpcg/admin/Requests.vue'
import UsersAdmin from '@/components/gpcg/admin/UsersAdmin.vue'

import { auth } from '@/firebase'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Auth
    },
    {
      path: '/office/:id',
      component: Office,
      children: [
        {
          path: '',
          name: 'office',
          component: HomeOffice,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'register',
          name: 'register',
          component: HomeRegister,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'requests',
          name: 'requests',
          component: HomeRequests,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'queueM',
          name: 'queueM',
          component: QueueM,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'history',
          name: 'history',
          component: History,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'customerSupport',
          name: 'customerSupport',
          component: CustomerSupport,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'quote',
          name: 'quote',
          component: Quote,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: Statistics,
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/gpcg/:id',
      component: Gpcg,
      children: [
        {
          path: '',
          name: 'gpcg',
          component: HomeGpcg,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'monitor',
          name: 'monitor',
          component: Monitor,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'offices',
          name: 'offices-settings',
          component: Offices,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'managements',
          name: 'managements-settings',
          component: Managements,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'directions',
          name: 'directions-settings',
          component: Directions,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'services',
          name: 'services-settings',
          component: Services,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'requests',
          name: 'requests-settings',
          component: Requests,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'usersAdmin',
          name: 'usersAdmin',
          component: UsersAdmin,
          meta: {
            requiresAuth: true
          },
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.currentUser) {
      next({
        name: 'home',
      })
    } else {
      next()
    }
  } else {
    next()
  }
})


export default router