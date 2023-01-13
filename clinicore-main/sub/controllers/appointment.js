const { getResources, getAppointmentCategories, getServices, getPeople, getPatient } = require('../externalAPI/clinicCore');
const { createAppointmentToGhl, updateAppointmentToGhl, fetchCalendar, deleteAppointmentToGhl, createNote, addTags } = require('../externalAPI/goHighLevel');
const { updateContact, createContact } = require('./contact');
const { convertTimeFormatToGHL, reduceCustomFieldValue } = require('../util/helpers');
const bridgeModel = require("../model/bridgeEntity");


const fetchAppointmentCustomFields = async (data) => {
    try {
        const { resources = [], services = [], categories = [], title = null } = data;

        const appointmentCustomFields = [];

        if (resources.length > 0) {
            const response = await getResources();
            if (response) {
                const matchedResources = response.resources.filter(e => resources.includes(e.id));
                appointmentCustomFields.push({ name: "Resources", values: matchedResources.map(e => e.name) });
            }
        }

        if (services.length > 0) {
            const response = await getServices();
            if (response) {
                const matchedResources = response.services.filter(e => services.includes(e.id));
                appointmentCustomFields.push({ name: "Services", values: matchedResources.map(e => e.name) });
            }
        }

        if (categories.length > 0) {
            const response = await getAppointmentCategories();
            if (response) {
                const matchedResources = response.appointmentCategories.filter(e => categories.includes(e.id));
                appointmentCustomFields.push({ name: "AppointmentCategories", values: matchedResources.map(e => e.title) });
            }
        }

        return appointmentCustomFields;
    } catch (err) {
        console.log('Appointment custom field data not fetch from CC.', err);
    }
};

const getUpdatePatient = async (data, extraFields) => {
    const { uniqGHLId: contactId } = await bridgeModel.getbrigeEntity({ uniqCCId: data.patients[0], type: 'Contact'}) || {};
    if (contactId) {
        await updateContact(contactId, extraFields);
        return contactId;
    } else {
        const patientData = await getPatient(data.patients[0]);
        const _contactId = await createContact(patientData.patient, extraFields);
        return _contactId;
    }
};

const getCalender = async (data) => {
    const { people = [] } = data;

    if (people.length > 0) {
        const response = await getPeople();
        if (response) {
            const _calender = response.users.find(u => people.includes(u.id));
            const { calendars } = await fetchCalendar()
            const matchedCalendar = calendars.find(c => c.name == _calender.shortName);
            return matchedCalendar ? matchedCalendar.id : calendars[0].id;
        }
    }
};

const transformPayloadForAppointment = async (data, appointmentStatus = 'confirmed', contactId = null, calendarId = null) => {
    const { startsAt = null, endsAt = null, title = null, patients = [], resources = [], categories = [] } = data;
    const payload = {
        startTime: convertTimeFormatToGHL(startsAt),
        endTime: convertTimeFormatToGHL(endsAt),
        appointmentStatus
    };
    if (calendarId) payload.calendarId = calendarId;
    if (contactId) payload.contactId = contactId;
    // if (patients.length) payload.title = await setTitleOfGhlAppointment(patients, resources, categories);
    if (patients.length) payload.title = await fixTitleOfGhlAppointment(title);

    return payload;
};

const saveBridgeEntity = (ccData, ghlData) => {
    if (ccData && ghlData) {
        return bridgeModel.createbrigeEntity({
            uniqCCId: ccData.id,
            uniqGHLId: ghlData.id,
            type: "Appointment",
            source: "CC"
        });
    }
};

const createAppointment = async (data) => {
    try {
        const { uniqGHLId: appointmentId } = await getAppointment(data.id) || {};
        if(appointmentId){
            console.log('_____already created appointment____', appointmentId);
            return;
        }

        const appointmentCustomFields = await fetchAppointmentCustomFields(data);
        console.log("____Payload in creating extraFields Appointment______", appointmentCustomFields);

        const contactId = await getUpdatePatient(data, appointmentCustomFields);
        const calendarId = await getCalender(data);

        const contactTags = {tags: []};
        appointmentCustomFields.filter((customField)=>{
            if(customField.name == 'Services'){
                contactTags.tags = customField.values;
            }
        });
        await addTags(contactId, contactTags);

        const payload = await transformPayloadForAppointment(data, 'confirmed', contactId, calendarId);
        console.log("____Payload in creating Appointment______", payload);

        const ghlResponse = await createAppointmentToGhl(payload);
        await saveBridgeEntity(data, ghlResponse);

        console.log("____Appointment Created______", payload);

        const appointmentNote = "Appointment Booked: " + fixTitleOfGhlAppointment(data.title);
        const ghlNoteResponse = await createNote(contactId, appointmentNote);
        if (ghlNoteResponse) console.log("____Appointment Note Created______");

    } catch (err) {
        console.log("____Error in creating Appointment______", err);
    }
};

const getAppointment = (uniqCCId) => {
    return bridgeModel.getbrigeEntity({ uniqCCId, type: 'Appointment' });
};

const getGhlAppointment = (uniqGHLId) => {
    return bridgeModel.getbrigeEntity({ uniqGHLId, type: 'Appointment' });
};

const updateAppointment = async (data) => {
    try {
        const { uniqGHLId: appointmentId } = await getAppointment(data.id) || {};

        if(!appointmentId){
            console.log('_____appointment not present in our database____', appointmentId);
            return;
        }

        if (data.canceledAt) {
            const payload = await transformPayloadForAppointment(data, 'cancelled');
            console.log("____Payload in cancelling Appointment______", payload);

            const ghlResponse = await updateAppointmentToGhl(payload, appointmentId);
            console.log("____Appointment Cancelled______", ghlResponse);
        } else {
            const appointmentCustomFields = await fetchAppointmentCustomFields(data);
            console.log("____Payload in updating extraFields Appointment______", appointmentCustomFields);

            const contactId = await getUpdatePatient(data, appointmentCustomFields);

            const payload = await transformPayloadForAppointment(data, 'confirmed');
            console.log("____Payload in creating Appointment______", payload);

            const ghlResponse = await updateAppointmentToGhl(payload, appointmentId);
            console.log("____Appointment Updated______", contactId, ghlResponse);
        }
    } catch (err) {
        console.log("____Error in updating Appointment______", err);
    }
};

const deleteAppointment = async (data) => {
    console.log(data, 'in delete');
    try {
        const { uniqGHLId: appointmentId } = await getAppointment(data.id);
        // const payload = await transformPayloadForAppointment(data, 'cancelled');  
        // console.log("____Payload in cancelling/deleting Appointment______", payload);

        const ghlResponse = await deleteAppointmentToGhl(appointmentId);
        console.log("____Appointment Deleted______", ghlResponse);
    } catch (err) {
        console.log("____Error in deleting Appointment______", err);
    }
};

// const getPatientsData = async (patientsIds) => {
//     const patientsRes = [];
//     patientsIds.forEach(async (patientId) => {
//         patientsRes.push(await getPatient(patientId));
//     });
//     return patientsRes;
// }

// const setTitleOfGhlAppointment = async (patientsIds, resourcesIds, categoriesIds) => {
//     const patientData = await getPatientsData(patientsIds);
//     const customfieldsData = await fetchAppointmentCustomFields({ resources: resourcesIds, categories: categoriesIds});
    

//     let appointmentTitle = '';
//     patientData.forEach( (ele, index) => {
//         appointmentTitle += `${ele.patient.firstName} ${ele.patient.lastName}`;
//         if(index < patientData.length-1){
//             appointmentTitle += `, `;
//         }
//     });
//     appointmentTitle += ` - `;
//     customfieldsData.filter(( fieldData, index ) => {
//         if(fieldData.name == 'Resources'){
//             appointmentTitle += reduceCustomFieldValue(fieldData.values);
//         }else if(fieldData.name == 'AppointmentCategories'){
//             appointmentTitle += reduceCustomFieldValue(fieldData.values);
//         }
//         if(index < customfieldsData.length-1){
//             appointmentTitle += ' - ';
//         }
//     });
//     return appointmentTitle;
// }

const fixTitleOfGhlAppointment = (title) => {
        return title.replace('<strong>', '').replace('</strong>:', '').replace('[', '- ').replace(']', ' -');
}
// console.log(fixTitleOfGhlAppointment('<strong>Raj, Vijay</strong>: [Dr. Musterfrau] Test - Operationsraum - HKFE, US'));

module.exports = {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getGhlAppointment,
    // Below function only use for migration
    fetchAppointmentCustomFields,
    getUpdatePatient,
    getCalender,
    addTags,
    transformPayloadForAppointment,
    fixTitleOfGhlAppointment

};
