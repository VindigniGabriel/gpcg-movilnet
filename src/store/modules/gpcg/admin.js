class Service {
    constructor() {
        this.id = null,
            this.technologie = null,
            this.status = null,
            this.name
    }
}

const state = {
    service: new Service,
    edit: false,
    dialogService: false,
    requestSetting: null,
    dialogRequestSetting: false
}

const mutations = {
    setService: (state, payload) => {
        if (payload) {
            state.service = payload.data
            state.edit = payload.edit
            state.dialogService = true

        } else {
            state.dialogService = false
            state.service = new Service
        }
    },

    setRequestDialog: (state, payload) => {
        state.edit = payload.edit
        if (payload.data) {
            state.requestSetting = payload.data
            state.dialogRequestSetting = payload.open
        } else {
            state.requestSetting = null
            state.dialogRequestSetting = payload.open
        }
    }

}

const getters = {
    dialogService: state => state.dialogService,
    service: state => state.service,
    edit: state => state.edit,
    requestSetting: state => state.requestSetting,
    dialogRequestSetting: state => state.dialogRequestSetting
}

export default {
    state,
    mutations,
    getters
}