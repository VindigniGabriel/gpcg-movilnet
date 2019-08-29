import { db } from "@/firebase";
import store from '@/store'
import moment from 'moment'

export default {
    getRequestsOptions() {
        db.collection('optionsRequests')
            .onSnapshot(snapshot => {
                let requests = []
                snapshot.forEach(request => {
                    requests.push(Object.assign(request.data(), { id: request.id }))
                });
                store.commit('setRequestsOptions', requests)
            }, error => {
                console.error(error)
            })
    },

    getServicesOptions() {
        db.collection('services')
            .onSnapshot(snapshot => {
                let services = []
                snapshot.forEach(service => {
                    services.push(Object.assign(service.data(), { id: service.id }))
                });
                store.commit('setServicesOptions', services)
            }, error => {
                console.error(error)
            })

    },

    async getTechnologiesOptions() {
        try {
            let t = []
            let technologies = await db.collection("typeLine").get();
            technologies.forEach(technologie => {
                t.push(technologie.data());
            });
            store.commit('setTechnologiesOptions', t)
        } catch (error) {
            console.error(error)
        }
    },

    async getStatusOptions(){
        try {
            let s = []
            let status = await db.collection("optionsStatus").get();
            status.forEach(st => {
                s.push(Object.assign({id: st.id},st.data()));
            });
            store.commit('setStatusOptions', s)
        } catch (error) {
            console.error(error)
        }
    },

    getAplicationsStatus(locationId) {
        db.collection('statusAplicationsOffices').doc(locationId).onSnapshot(snapshot => {
            let aplications = []
            let updated = moment().format("YYYY-MM-DD HH:mm:ss");
            if (snapshot.exists) {
                aplications = snapshot.data()

                store.commit('setAplicationsStatus', aplications)

            } else {
                try {
                    aplications = [
                        { name: 'Sinapsis', active: true },
                        { name: 'RTB', active: true },
                        { name: 'Xpert/CSM', active: true },
                        { name: 'Xpert/PtoVenta', active: true },
                    ]
                    let agregate = db.collection('statusAplicationsOffices').doc(locationId).set({
                        aplications,
                        updated
                    })

                    store.commit('setAplicationsStatus', aplications)

                } catch (error) {
                    console.error(error)
                }
            }

        })
    },

    async updatedAplicationsStatus(){
        let locationId = store.state.user.user.locationId
        let aplications = store.state.options.aplicationsStatus.aplications
        let updated = moment().format("YYYY-MM-DD HH:mm:ss");
        try {
            let update = await db.collection('statusAplicationsOffices').doc(locationId).set({
                aplications,
                updated
            })
        } catch (error) {
            console.error(error)
        }
    }
}