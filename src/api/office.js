import { db } from "@/firebase";
import store from '@/store'

export default {
    apiGetUsersOffice(officeId) {
        let users = []
        let queueManager = null
        let requests = []
        db.collection('usersApp')
            .where('locationId', '==', officeId)
            .where('admin', '==', false)
            .where('active', '==', true)
            .onSnapshot(snapshot => {
                users = []
                if (!snapshot.empty) {
                    snapshot.forEach(user => {
                        users = []
                        users.push(Object.assign({ id: user.id }, user.data()))
                        db.collection('clientsRequests')
                            .where('block', '==', user.id)
                            .onSnapshot(rq => {
                                requests = []
                                rq.forEach(request => {
                                    requests.push(request.data())
                                })
                                queueManager = {
                                    requests,
                                    users
                                }
                                store.commit("setQueueManager", queueManager)
                            })
                    });
                } else {
                    store.commit("setQueueManager", users)
                }
            })
    }
}