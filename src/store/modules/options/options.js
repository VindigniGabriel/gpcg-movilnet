import { db } from '@/firebase'
import options from '@/api/options'

const state = {
    technologiesOptions: null,
    requestsOptions: [],
    servicesOptions: [],
    aplicationsStatus: null,
    statusOptions: [],
    technologies: null
}

const mutations = {
    setTechnologies(state, payload) {
        state.technologies = payload
    },
    setTechnologiesOptions(state, payload) {
        state.technologiesOptions = payload
    },
    setRequestsOptions(state, payload) {
        state.requestsOptions = payload
    },

    setServicesOptions(state, payload) {
        state.servicesOptions = payload
    },

    setStatusOptions(state, payload) {
        state.statusOptions = payload
    },

    setAplicationsStatus(state, payload) {
        state.aplicationsStatus = payload
    }
}

const actions = {
    async getTechnologies() {
        options.getTechnologies()
    },

    async getTechnologiesOptions() {
        options.getTechnologiesOptions()
    },

    getRequestsOptions() {
        options.getRequestsOptions()
    },

    getServicesOptions() {
        options.getServicesOptions()
    },

    getAplicationsStatus(context, payload) {
        options.getAplicationsStatus(payload)
    },

    getStatusOptions() {
        options.getStatusOptions()
    },

    updatedAplicationsStatus() {
        options.updatedAplicationsStatus()
    }

}

const getters = {
    getTechnologiesOptions: state => state.technologiesOptions,
    getRequestsOptions: state => state.requestsOptions,
    getServicesOptions: state => state.servicesOptions,
    getAplicationsStatus: state => state.aplicationsStatus,
    getStatusOptions: state => state.statusOptions,
    getTechnologies: state => state.technologies
}

export default {
    state,
    mutations,
    actions,
    getters
}