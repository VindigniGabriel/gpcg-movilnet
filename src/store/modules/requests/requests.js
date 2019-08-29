import requests from '@/api/requests'
import moment from 'moment'

const state = {
    requests: [],
    updatedRequest: {},
    queueRequest: null
}

const mutations = {
    setRequests: (state, payload) => {
        console.log('cambioRequestLocal')
        state.requests = payload
    },

    setQueueRequest: (state, payload) => {
        state.queueRequest = payload
    },
}

const actions = {
    getRequestsOffice({ context }, payload) {
        requests.getRequestsOffice(payload)
    },

    getRequestsGpcg() {
        requests.getRequestsGpcg()
    },

    updatedRequestQuote({ context }, payload) {
        requests.updatedRequestQuote(payload)
    },

    updateRequestsQuoteNotProcessed() {
        requests.updateRequestsQuoteNotProcessed()
    },

    assignQuotesRequests({ context }, payload) {
        requests.assignQuotesRequests(payload)
    },

    nextClient({ context }, payload) {
        requests.apiNextClient(payload)
    },

    closeClient(context) {
        requests.apiCloseClient(context.state.queueRequest)
    },

    solutionRequest(context , payload) {
        let request = {
            request: context.state.queueRequest,
            statusId: payload.id,
            ta: payload.ta
        }
        requests.apiSolutionRequest(request)
    },

    listenersQueueM(context) {
        let userId = context.rootState.user.user.uid
        requests.apiListenersQueueM(userId)
    },

    setUpdatedStatus(context, payload){
        requests.apiUpdatedStatus(payload)
    },

    setUpdatedRequests(context, payload) {
        let options = context.rootState.options
        this.udadtedRequest = {};
        let requests = [];
        let requestsOnHold = [];
        let labels = [];
        let confirmedCount = [];
        let pendingCount = [];
        let processedCount = [];
        let onHoldCount = [];
        let date = null
        if (payload.date) {
            date = payload.date;
        } else {
            date = moment().format("DD/MM/YYYY");
        }

        let enabledAplications = options.aplicationsStatus.aplications
            .filter(a => a.active === true)
            .map(r => r.name);
        if (payload.attentionType === 0) {
            options.requestsOptions
                .filter(r => r.face === true)
                .forEach(request => {
                    let confirmed = context.state.requests.filter(
                        r =>
                            r.status === "con Cita confirmada" &&
                            r.request === request.name &&
                            r.quote === date
                    );

                    let pending = context.state.requests.filter(
                        r =>
                            r.status === "Pendiente" &&
                            r.request === request.name
                    );

                    let processed = context.state.requests.filter(
                        r =>
                            r.status != "con Cita confirmada" &&
                            r.status != "con Cita por confirmar" &&
                            r.status != "Pendiente" &&
                            r.request === request.name &&
                            r.quote === date
                    );

                    let onHold = context.state.requests.filter(
                        r =>
                            r.status === "con Cita por confirmar" &&
                            r.request === request.name &&
                            r.quote === date
                    );

                    labels.push(request.name);
                    confirmedCount.push(confirmed.length);
                    pendingCount.push(pending.length);
                    processedCount.push(processed.length);
                    onHoldCount.push(onHold.length);

                    if (confirmed.length > 0) {
                        confirmed.forEach(r => {
                            request.technologies
                                .filter(rq => rq.name === r.technologie)
                                .forEach(a => {
                                    //Verificar tamano de los aplicativos necesarios contra aplicativos disponible
                                    let size = a.aplications.filter(value =>
                                        enabledAplications.includes(value)
                                    );
                                    //Verificar sin el tamano encontrado es el mismo
                                    if (size.length === a.aplications.length) {
                                        requests.push(r);
                                    }
                                });
                        });
                    }

                    if (processed.length > 0) {
                        processed.forEach(r => {
                            request.technologies
                                .filter(rq => rq.name === r.technologie)
                                .forEach(a => {
                                    //Verificar tamano de los aplicativos necesarios contra aplicativos disponible
                                    let size = a.aplications.filter(value =>
                                        enabledAplications.includes(value)
                                    );
                                    //Verificar sin el tamano encontrado es el mismo
                                    if (size.length === a.aplications.length) {
                                        requests.push(r);
                                    }
                                });
                        });
                    }

                    if (onHold.length > 0) {
                        onHold.forEach(r => {
                            request.technologies
                                .filter(rq => rq.name === r.technologie)
                                .forEach(a => {
                                    //Verificar tamano de los aplicativos necesarios contra aplicativos disponible
                                    let size = a.aplications.filter(value =>
                                        enabledAplications.includes(value)
                                    );
                                    //Verificar sin el tamano encontrado es el mismo
                                    if (size.length === a.aplications.length) {
                                        requestsOnHold.push(r);
                                    }
                                });
                        });
                    }
                });

            this.updatedRequest = {
                requests,
                labels,
                processedCount,
                pendingCount,
                onHoldCount,
                requestsOnHold,
                confirmedCount
            }

            return this.updatedRequest
        } else {
            options.requestsOptions
                .filter(r => r.face === false)
                .forEach(request => {
                    let pending = context.state.requests.filter(
                        r => r.status === "Pendiente" && r.request === request.name
                    );
                    let processed = context.state.requests.filter(
                        r =>
                            r.status != "Pendiente" &&
                            r.request === request.name &&
                            r.close === date
                    );

                    labels.push(request.name);
                    pendingCount.push(pending.length);
                    processedCount.push(processed.length);

                    if (pending.length > 0) {
                        pending.forEach(r => {
                            request.technologies
                                .filter(rq => rq.name === r.technologie)
                                .forEach(a => {
                                    //Verificar tamano de los aplicativos necesarios contra aplicativos disponible
                                    let size = a.aplications.filter(value =>
                                        enabledAplications.includes(value)
                                    );
                                    //Verificar sin el tamano encontrado es el mismo
                                    if (size.length === a.aplications.length) {
                                        requests.push(r);
                                    }
                                });
                        });
                    }

                    if (processed.length > 0) {
                        processed.forEach(r => {
                            request.technologies
                                .filter(rq => rq.name === r.technologie)
                                .forEach(a => {
                                    //Verificar tamano de los aplicativos necesarios contra aplicativos disponible
                                    let size = a.aplications.filter(value =>
                                        enabledAplications.includes(value)
                                    );
                                    //Verificar sin el tamano encontrado es el mismo
                                    if (size.length === a.aplications.length) {
                                        requests.push(r);
                                    }
                                });
                        });
                    }
                });

            this.updatedRequest = {
                requests,
                labels,
                processedCount,
                pendingCount
            }

            return this.updatedRequest
        }
    },
}

const getters = {
    getRequestsLocation: state => state.requests,
    getUpdatedRequest: state => state.updatedRequest,
    getQueueRequest: state => state.queueRequest
}

export default {
    state,
    mutations,
    actions,
    getters
}