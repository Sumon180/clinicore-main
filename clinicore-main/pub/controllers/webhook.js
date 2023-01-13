const { publishToQueue } = require("../util/queue");

const handleWebhook = async (req, res) => {
    try {
        if (req.params.task == 'create') {
            console.log("GHL Appointment Create", req.body);
            console.log("GHL Appointment Create", JSON.stringify(req.body));
            publishToQueue({ WHEvent: { createAppointment: req.body } });
        } else if (req.params.task == 'update') {
            console.log("GHL Appointment Update", req.body);
            console.log("GHL Appointment Update", JSON.stringify(req.body));
            publishToQueue({ WHEvent: { updateAppointment: req.body } });
        }
        res.status(200).send({});
    } catch (err) {
        console.log(err, 'err');
        res.status(500).send({});
    }
};

module.exports = {
    handleWebhook
};
