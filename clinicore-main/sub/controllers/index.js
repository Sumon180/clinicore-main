const { createContact } = require("./contact");
const { createAppointment, updateAppointment, deleteAppointment } = require("./appointment");
const { UpdateAppointmentOnCC, CreateAppointmentOnCC } = require("./ghlAppointment");
const { updateInvoiceDetails, updatePaymentDetails } = require("./payment");

module.exports = async (msg) => {
    const msgData = JSON.parse(msg.content);
    // console.log(msgData, 'msgData');
    if (msgData.CCEvent) {
        const ccEvent = msgData.CCEvent;
        if (ccEvent.createEvent) {
            entityWasCreated(ccEvent.createEvent);
        } else if (ccEvent.updateEvent) {
            entityWasUpdated(ccEvent.updateEvent);
        } else if (ccEvent.deleteEvent) {
            entityWasDeleted(ccEvent.deleteEvent);
        }
    } else if (msgData.WHEvent) {
        const whEvent = msgData.WHEvent;
        if (whEvent.updateAppointment) {
            appointmentWasUpdated(whEvent.updateAppointment);
        } else if (whEvent.createAppointment) {
            appointmentWasCreated(whEvent.createAppointment);
        }
    }
};

const entityWasCreated = async (data) => {
    try {
        if (data.type == 'patient') {
            await createContact(data.payload);
        } else if (data.type == 'appointment') {
            await createAppointment(data.payload);
        } else if (data.type == 'invoice') {
            await updateInvoiceDetails(data);
        } else if (data.type == 'payment') {
            setTimeout(async () => {
                await updatePaymentDetails(data)
            }, 2500);
        }
    } catch (err) {
        console.log('Error: In Create Entity', err);
    }
};

const entityWasUpdated = async (data) => {
    // console.log(data, 'dataaa');
    try {
        if (data.type == 'appointment') {
            await updateAppointment(data.payload);
        }
    } catch (err) {
        console.log('Error: In Update Entity', err);
    }
};

const appointmentWasUpdated = async (data) => {
    try {
        if (data) {
            await UpdateAppointmentOnCC(data);
        }
    } catch (err) {
        console.log('Error: In Update appointment on CC side', err);
    }
};

const appointmentWasCreated = async (data) => {
    try {
        await CreateAppointmentOnCC(data);
    } catch (err) {
        console.log('Error: In Create appointment on CC side', err);
    }
}

const entityWasDeleted = async (data) => {
    try {
        if (data.type == 'appointment') {
            await deleteAppointment(data);
        }
    } catch (err) {
        console.log('Error: In Update Entity', err);
    }
};

// createContact({
//     "id": 2112212,
//     "createdAt": "2022-12-07T12:11:42.000Z",
//     "updatedAt": "2022-12-07T12:11:42.000Z",
//     "createdBy": 5003,
//     "updatedBy": 5003,
//     "firstName": "ihbkijm",
//     "lastName": "dsgfdgsd",
//     "dob": "1990-12-12T00:00:00.000Z",
//     "ssn": "22112222",
//     "flashMessage": "",
//     "active": true,
//     "phoneMobile": "99898989",
//     "email": "knejwkenw@dwfef.com",
//     "title": null,
//     "titleSuffix": null,
//     "healthInsurance": null,
//     "gender": "männlich",
//     "addresses": [
//         {
//             "id": 871,
//             "label": null,
//             "name": null,
//             "street": "eewwewe",
//             "streetNumber": "222",
//             "postalCode": "232323",
//             "city": "NOIDA",
//             "country": "DE",
//             "primary": 1
//         }
//     ],
//     "categories": [
//         11,
//         10
//     ],
//     "customFields": [
//         5357,
//         5358,
//         5359,
//         5360,
//         5361,
//         5362
//     ],
//     "invoices": [],
//     "payments": [],
//     "files": [],
//     "history": [],
//     "appointments": [],
//     "messages": [],
//     "medications": [],
//     "qrUrl": "https://api-ccdemo.clinicore.eu/v1/qr/100/713.png",
//     "avatarUrl": null
// });

// createAppointment({
//     "id": 7529,
//     "startsAt": "2022-11-28T07:30:00.000Z",
//     "endsAt": "2022-11-28T09:00:00.000Z",
//     "arrivedAt": null,
//     "processedAt": null,
//     "treatmentStartedAt": null,
//     "allDay": 1,
//     "slot": false,
//     "subject": "",
//     "title": "<strong>assange, julian</strong>: [Dr. Mustermann] Test - Operationsraum - US",
//     "firstOfPatient": true,
//     "onPatientBirthday": false,
//     "patientFollowUpAt": null,
//     "description": "",
//     "color": "#dc4a4a",
//     "patients": [
//         447
//     ],
//     "people": [
//         5001
//     ],
//     "resources": [
//         4
//     ],
//     "categories": [
//         8
//     ],
//     "location": null,
//     "services": [
//         7
//     ],
//     "series": null,
//     "canceledWhy": null,
//     "createdAt": "2022-11-28T07:25:20.000Z",
//     "updatedAt": "2022-11-28T07:25:21.000Z",
//     "canceledAt": null,
//     "createdBy": 5003,
//     "updatedBy": 5003,
//     "canceledBy": null,
//     "reminderAt": null,
//     "reminderStatus": "no-reminder",
//     "reminderSentAt": null,
//     "deletedAt": null
// });
