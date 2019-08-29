import { db } from "@/firebase";
import store from '@/store'
export default {
    async agregateClient(payload) {
        let client = Object.assign({}, payload)
        try {
            let agregate = await db.collection('clientsRegisters').doc(client.identify).set(client)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },
    getRequest(identify) {
        db.collection('clientsRequests')
            .where('clientId', '==', identify)
            .onSnapshot(snapshot => {
                store.commit('setLoadingRequests', true)
                let requests = []
                snapshot.forEach(async change => {
                    let o = await db.collection('locations').doc(change.data().officeId).get()
                    let office = o.data().name
                    requests.push(Object.assign({ office }, change.data()))
                })
                store.commit('setClientRequests', requests)
                store.commit('setLoadingRequests', false)
            }, error => {
                console.log(error)
            })
    }
}