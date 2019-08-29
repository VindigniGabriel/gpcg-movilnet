class Snackbar {
    constructor() {
        this.active = false,
            this.text = null,
            this.color = null
    }
}

const state = {
    snackbar: new Snackbar
}

const mutations = {
    setSnackbar: (state, payload = null) => {
        state.snackbar = new Snackbar
        if (payload) {
            state.snackbar.active = payload.active
            state.snackbar.text = payload.text
            state.snackbar.color = payload.color
        }
    }
}

const getters = {
    getSnackbar: state => state.snackbar
}

export default {
    state,
    mutations,
    getters
}