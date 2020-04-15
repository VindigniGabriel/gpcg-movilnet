import { db } from '@/firebase'
import router from '@/router'
import client from '@/api/client'

class Client {
    constructor() {
        this.name = null,
            this.identify = '',
            this.contact1 = '',
            this.contact2 = ''
    }
}

const state = {
    client: new Client,
    clientRequests: [],
    clientRegister: false,
    dialogNewRequest: false,
    loadingRequests: false
}

const mutations = {
    setClient: (state, payload = null) => {
        state.client = new Client
        if (payload) {
            state.client.name = payload.name,
                state.client.identify = payload.identify,
                state.client.contact1 = payload.contact1,
                state.client.contact2 = payload.contact2
        }
    },
    setClientRequests: (state, payload) => {
        state.clientRequests = payload
    },
    setClientRegister: (state, payload) => {
        state.clientRegister = payload
    },
    setDialogNewRequest: (state, payload) => {
        state.dialogNewRequest = payload
    },
    setLoadingRequests: (state, payload) => {
        state.loadingRequests = payload
    },
}

const actions = {
    async searchClient({ commit }, payload) {
        commit('setClient')
        client.getRequest(payload)
        try {
            let client = await db.collection('clientsRegisters').doc(payload).get()
            if (client.exists) {
                commit('setClient', client.data())
                commit('setClientRegister', true)
                commit('setSnackbar', {
                    active: true,
                    text: 'El cliente se encuentra registrado.',
                    color: 'primary'
                })
                console.log('Cliente registrado')
            } else {
                commit('setClientRegister', false)
                commit('setClient', {
                    name: null,
                    identify: payload,
                    contact1: '',
                    contact2: ''
                })
                commit('setSnackbar', {
                    active: true,
                    text: 'El cliente no se encuentra registrado.',
                    color: 'info'
                })
                console.log('Cliente no registrado')
            }

        } catch (error) {
            console.log(error)
        }

        router.push({ name: 'requests' })
    },

    async agregateClient(context) {
        let agregate = await client.agregateClient(context.state.client)
        return agregate
    },

}

const getters = {
    getClient: state => state.client,
    getClientRequests: state => state.clientRequests,
    getAddRequest: state => state.clientRegister,
    getDialogNewRequest: state => state.dialogNewRequest,
    getLoadingRequests: state => state.loadingRequests
}


export default {
    state,
    mutations,
    actions,
    getters
}