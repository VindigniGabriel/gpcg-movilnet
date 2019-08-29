import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify';
import '@babel/polyfill'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { auth } from './firebase';
import VueAlertify from 'vue-alertify'
import VueTheMask from 'vue-the-mask'

Vue.config.productionTip = false

Vue.use(VueTheMask)

Vue.use(VueAlertify, {
  moveBounded: true,
  notifier: {
    // auto-dismiss wait time (in seconds)
    delay: 5,
    // default position
    position: 'bottom-center',
    // adds a close button to notifier messages
    closeButton: false,
  },
  glossary: {
    title: 'GPCG',
    ok: 'Continuar',
    cancel: 'Cancelar',
  }
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  created() {
    auth.onAuthStateChanged(user => {
      if (user) {
        store.dispatch('signIn', user)
      } else {
        router.push({ name: 'login' })
      }
    })
  }
}).$mount('#app')
