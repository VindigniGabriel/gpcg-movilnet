import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import client from './modules/client'
import alerts from './modules/alerts'
import admin from './modules/gpcg/admin'
import options from './modules/options/options'
import requests from './modules/requests/requests'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    client,
    alerts,
    admin,
    options,
    requests
  },
  state: {

  },
  mutations: {

  },
  actions: {
    
  }
})
