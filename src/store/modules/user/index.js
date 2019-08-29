import { db, auth } from '@/firebase'
import router from '@/router'
import office from '@/api/office'

class User {
    constructor() {
        this.uid = null,
            this.name = null,
            this.locationId = null,
            this.route = null,
            this.locationName = null,
            this.locationCode = null
    }
}

const state = {
    queueManager: [],
    user: new User(),
    menuItemsFirst: [
        { icon: 'person_add', text: 'Registro de usuarios', url: 'register', locationType: 'office' },
        { icon: 'transfer_within_a_station', text: 'Gestión de cola', url: 'queueM', locationType: 'office' },
        { icon: 'contacts', text: 'Atención diaria', url: 'customerSupport', locationType: 'office' },
        { icon: 'list', text: 'Historial de la OC', url: 'history', locationType: 'office' },
        { icon: 'calendar_today', text: 'Gestión de citas', url: 'quote', locationType: 'office' },
        { icon: 'bar_chart', text: 'Estadísticas', url: 'statistics', locationType: 'office' },
        { icon: 'folder_open', text: 'Oficinas', url: 'offices-settings', locationType: 'gpcg' },
        { icon: 'folder_open', text: 'Gerencias', url: 'managements-settings', locationType: 'gpcg' },
        { icon: 'folder_open', text: 'Direcciones', url: 'directions-settings', locationType: 'gpcg' },
    ],
    menuItemsSecond: [
        { icon: 'phone_android', text: 'Planes', url: 'services-settings', locationType: 'gpcg' },
        { icon: 'assignment', text: 'Requerimientos', url: 'requests-settings', locationType: 'gpcg' }
    ],
    menuItemsThird: [
        { icon: 'people', text: 'Usuarios', url: 'usersAdmin', locationType: 'gpcg' }
    ],
    menuFilter: null
}

const mutations = {
    setUser(state, payload = null) {
        state.user = new User()
        if (payload) {
            state.user.uid = payload.uid
            state.user.name = payload.name
            state.user.locationId = payload.locationId
            state.user.route = payload.route
            state.user.locationCode = payload.locationCode
            state.user.locationName = payload.locationName
            state.menuFilter = payload.route
            router.push({ name: payload.route, params: { id: payload.uid } })
        }
    },
    setQueueManager(state, payload) {
        state.queueManager = payload
    }
}

const actions = {
    async signIn(context, payload) {
        let doc = await db
            .collection("usersApp")
            .doc(payload.uid)
            .get();

        if (doc.exists) {
            let user = doc.data();
            let location = await db.collection('locations').doc(user.locationId).get()
            switch (location.data().locationType) {
                case 'office':
                    context.dispatch('getRequestsOffice', location.id)
                    context.dispatch('getAplicationsStatus', location.id)
                    break;
                case 'gpcg':
                    context.dispatch('getRequestsGpcg')
                    break;

                default:
                    break;
            }
            context.dispatch('getTechnologiesOptions')
            context.dispatch('getRequestsOptions')
            context.dispatch('getServicesOptions')
            context.dispatch('getStatusOptions')
            office.apiGetUsersOffice(location.id)
            context.commit('setUser', Object.assign({ uid: doc.id, name: payload.displayName, locationName: location.data().name, locationCode: location.data().code, route: location.data().locationType }, user))
        }

    }
}

const getters = {
    getUser: state => state.user,
    getMenuFilterFirst: state => state.menuItemsFirst.filter(m => m.locationType === state.menuFilter),
    getMenuFilterSecond: state => state.menuItemsSecond.filter(m => m.locationType === state.menuFilter),
    getMenuFilterThird: state => state.menuItemsThird,
    getQueueManager: state => state.queueManager
}

export default {
    state,
    mutations,
    getters,
    actions
}