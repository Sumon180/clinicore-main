module.exports = {
    PORT: 8088,
    API: "/bridge",
    queueName: "cchlBridge-prod",
    connURL: 'amqp://localhost',
    socketURL: 'wss://dermacare.mobimed.at',
    accessToken:'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZWRmYzAwMTEwNTcyYjVhNDUwZjcwM2UwMWY1NjlmOGJlZGQ3MTVkMmQ1ZDBkMDMxOTIzOTE2MzcyYjk0MTJkODE2ODdjMDUxYThhZjA2ZmYiLCJpYXQiOjE2Njg2NTQ1NDcuOTY2MTIxLCJuYmYiOjE2Njg2NTQ1NDcuOTY2MTI1LCJleHAiOjE5ODQyNzM3MjUuMjQ4OTM5LCJzdWIiOiI1MTEwIiwic2NvcGVzIjpbXX0.BC8UImSqNutNCI_B2VsyO9IXPk1I_s19wqCM6OxnajGTNoSkXtq2YSdvpaTbwO2eiskENvOQ_dATaJfYbAYTTNccbxFMrfnkx39AMt76gyeT4wsrhBHYz-3lfIPjdd5AcNJ4-OUBTfaJFYy2h-1z3MbXnUF43FIbpEs7il2A-yEIcA5WkaCFh33ODSogP_h16UIoYFQ6E_EJsoPT9KpqL5iNeVL_K2AL6L0qBpnCFFrhmBXFMwcZvJI5WcERhlijYLVPKEsklKuSsgv74sLIPMLUr2BgmSVF2b1LE-7wpanYVRz8Dsb46K-SWCTcYZK4Ih729sX8NMSVZrQr93SaVgnzWSt_2EE_vEFtlPVHiNEVF9xDQY1rYKulRPRCGdxQfCQc162TCikPIxZuxUnMl6NCNkeoUXaAHCMp0oSLgxQAKmYEVLbbVeVMppk3NdcJD9BoWYQWZDZFclMxIHeHQd7r55OT17WfXOM4ZriPd2s6GP3yrFWc2nG8xrRDTUyS4icFPcBF6V3Act37k3roDmP9R5n4H7GE53MWbQ-7n1OQ5FydyPo5-rZfqRAqvEok8uu6t2tUISCN0UZDBTN98yUvkUPi9V39hshLtjLVqfsMbHymf1TZddnlIPR0yWEglzF_UORuFQaeMa_i8vgcvbukEXOTp2Yfi5CmNXaDYQ0',
    webhookCORS: {
        origin: "*",
        methods: "POST",
        preflightContinue: false,
        optionsSuccessStatus: 204
    }
};