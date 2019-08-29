import { db } from '@/firebase'
import store from '@/store'
import moment from 'moment'

export default {
    async getRequestsOffice(uid) {

        db.collection('clientsRequests').where('officeId', '==', uid).onSnapshot(snapshot => {
            let requests = []
            snapshot.forEach(async request => {
                let client = await db
                    .collection("clientsRegisters")
                    .doc(request.data().clientId)
                    .get();
                requests.push(
                    Object.assign({
                        id: request.id,
                        name: client.data().name,
                        clientId: client.data().clientId,
                        contact1: client.data().contact1,
                        contact2: client.data().contact2
                    }, request.data())
                );
            })
            store.commit('setRequests', requests)
        }, error => {
            console.error(error)
        })

    },

    getRequestsGpcg(uid) {
        db.collection('clientsRequests').onSnapshot(snapshot => {
            let requests = []
            snapshot.forEach(async request => {
                let client = await db
                    .collection("clientsRegisters")
                    .doc(request.data().clientId)
                    .get();
                requests.push(
                    Object.assign({
                        id: request.id,
                        name: client.data().name,
                        clientId: client.data().clientId,
                        contact1: client.data().contact1,
                        contact2: client.data().contact2
                    }, request.data())
                );
            })
            store.commit('setRequests', requests)
        }, error => {
            console.error(error)
        })
    },

    async updatedRequestQuote(request) {
        try {

            if (request.oldQuote != request.quote) {
                let officeId = await store.state.user.user.locationId;
                let o = await db.collection('locations').doc(officeId).get()
                let office = o.data().name
                let updated = moment().format("YYYY-MM-DD HH:mm:ss");
                let author = store.state.user.user.name;
                let observations = request.observations

                observations.push({
                    author,
                    content: `Se cambia fecha de la cita "${request.oldQuote}" a "${request.quote}" en ${office}`,
                    date: updated
                })
                let up = await db.collection('clientsRequests').doc(request.id).update({
                    quote: request.quote,
                    status: 'con Cita confirmada',
                    observations,
                    updated
                })

                store.commit("setSnackbar", {
                    active: true,
                    text: `Se ha cambiado fecha de la cita al requerimiento "${request.ticket}"`,
                    color: "success"
                });
            } else {
                store.commit("setSnackbar", {
                    active: true,
                    text: `Debe seleccionar una fecha distinta a la actual.`,
                    color: "info"
                });
            }

        } catch (error) {
            console.log(error)

            store.commit("setSnackbar", {
                active: true,
                text: `Error!. Cambio de fecha de la cita al requerimiento "${request.ticket}" no puede ser procesado.`,
                color: "error"
            });
        }
    },


    async updateRequestsQuoteNotProcessed() {
        try {
            let date = moment().format('DD/MM/YYYY')

            let requests = await db.collection('clientsRequests')
                .where('quote', '<', date)
                .where('close', '==', null)
                .get()


            requests.forEach(r => {
                let observations = r.data().observations

                observations.push({
                    author: 'GPCG',
                    content: `El requerimiento no fue atendido en la fecha asignada, se actualiza a estado "Pendiente"`,
                    date: moment().format("YYYY-MM-DD HH:mm:ss")
                })

                db.collection('clientsRequests')
                    .doc(r.id)
                    .update({
                        close: null,
                        quote: null,
                        status: 'Pendiente',
                        observations
                    })
            })

        } catch (error) {
            console.log(error)
        }
    },

    async assignQuotesRequests(quotesRequests) {
        let date = moment().format("YYYY-MM-DD HH:mm:ss")
        let officeId = await store.state.user.user.locationId;
        let o = await db.collection('locations').doc(officeId).get()
        let office = o.data().name
        let quote = quotesRequests.date
        try {

            quotesRequests.quotes.forEach(async r => {
                let author = store.state.user.user.name;
                let observations = r.observations
                observations.push({
                    author,
                    content: `Se asigna cita para ${quote} en ${office}`,
                    date
                })

                let requests = await db.collection('clientsRequests').doc(r.id).update({
                    quote,
                    updated: date,
                    observations,
                    status: "con Cita por confirmar"
                })

            });

            store.commit("setSnackbar", {
                active: true,
                text: `Asignación de citas completado. Recuerde confirmar fecha de cita con los usuarios.`,
                color: "success"
            });

        } catch (error) {
            console.error(error)

            store.commit("setSnackbar", {
                active: true,
                text: `Error!. Asignación de citas no puede ser procesado.`,
                color: "error"
            });
        }
    },

    apiListenersQueueM(userId) {
        db.collection('clientsRequests')
            .where('block', '==', userId)
            .where('status', '==', 'en proceso...')
            .onSnapshot(async snapshot => {
                let getQueueRequest = null
                snapshot.forEach(async doc => {

                    let client = await db.collection("clientsRegisters").doc(doc.data().clientId).get();

                    getQueueRequest = Object.assign({
                        id: doc.id,
                        name: client.data().name,
                        clientId: client.data().clientId,
                        contact1: client.data().contact1,
                        contact2: client.data().contact2
                    }, doc.data())

                    store.commit("setQueueRequest", getQueueRequest)

                });
            })
    },

    async apiNextClient(payload) {
        try {
            let updated = moment().format("YYYY-MM-DD HH:mm:ss")
            let userId = await store.state.user.user.uid
            let block = await db.collection('clientsRequests').doc(payload).update({
                block: userId,
                status: 'en proceso...',
                updated
            })

        } catch (error) {
            console.log(error)
        }
    },

    async apiCloseClient(payload) {
        if (payload) {
            try {
                let face = await store.state.options.requestsOptions.filter(r => r.name === payload.request).map(r => r.face).toString()
                let status = 'Pendiente'
                if (face === 'true') {
                    status = 'con Cita confirmada'
                }

                let block = await db.collection('clientsRequests').doc(payload.id).update({
                    block: null,
                    status
                })

                store.commit("setQueueRequest", null)

            } catch (error) {
                console.log(error)
            }
        }

    },

    async apiSolutionRequest(request) {
        try {
            let content = await db.collection('optionsStatus').doc(request.statusId).get()

            let author = store.state.user.user.name;
            let observations = request.request.observations
            let date = moment().format("YYYY-MM-DD HH:mm:ss")
            let close = moment().format('DD/MM/YYYY')
            let officeId = await store.state.user.user.locationId;
            let o = await db.collection('locations').doc(officeId).get()
            let office = o.data().name
            observations.push({
                author,
                content: `${content.data().description}. Atendido por ${office}`,
                date
            })

            let update = await db.collection('clientsRequests').doc(request.request.id).update({
                observations,
                updated: date,
                status: content.data().name,
                close,
                ta: request.ta
            })

            store.commit("setQueueRequest", null)

            store.commit("setSnackbar", {
                active: true,
                text: `${request.request.ticket}. ${content.data().description}.`,
                color: "success"
            });
        } catch (error) {
            store.commit("setSnackbar", {
                active: true,
                text: `Error. No pudo ser procesado el cambio de estatus.`,
                color: "error"
            });
            console.log(error)
        }
    },

    async apiUpdatedStatus(req) {
        try {
            let author = store.state.user.user.name;
            let observations = req.observations
            let date = moment().format("YYYY-MM-DD HH:mm:ss")
            let officeId = await store.state.user.user.locationId;
            let o = await db.collection('locations').doc(officeId).get()
            let office = o.data().name

            observations.push({
                author,
                content: `Requerimiento ${req.status}. ${office}`,
                date
            })

            let update = db.collection('clientsRequests').doc(req.id).update({
                observations,
                updated: date,
                status: req.status,
                close: null
            })

            store.commit("setSnackbar", {
                active: true,
                text: `Requerimiento ${req.ticket} ha cambiado a estatus "${req.status}".`,
                color: "success"
            });

        } catch (error) {
            store.commit("setSnackbar", {
                active: true,
                text: `Error!. Falló en el proceso de actualización.`,
                color: "error"
            });
            console.log(error)
        }

    }
}
