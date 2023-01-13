const { updateAppointment, createAppointment, getResources, getAppointmentCategories, getServices, getCategories, createPatient, searchPatient, updatePatient, getCustomFields } = require('../externalAPI/clinicCore');
const { convertTimeFormatToCC, getKeyByValue } = require('../util/helpers');
const { getGhlAppointment } = require('./appointment');
const bridgeModel = require("../model/bridgeEntity");


const CreateAppointmentOnCC = async (data) => {
    // console.log('in CreateAppointmentOnCC', data);

    const { uniqCCId: appointmentId } = await getGhlAppointment(data.calendar.appointmentId) || {};
        if(appointmentId){
            console.log('_____already created appointmentt____', appointmentId);
            return;
        }

    if (data.calendar.created_by_meta.source != 'third_party') {
        let appointmentPayload = {
            appointment: {
                categories: [],
                patients: [],
                // people: [],
                resources: [],
                services: []
            }
        };

        if (data['Appointment Categories']) {
            const categoriesData = data['Appointment Categories'].split(',');
            const response = await getAppointmentCategories();
            if (response) {
                response.appointmentCategories.filter((r) => {
                    if (categoriesData.includes(r.title)) {
                        appointmentPayload.appointment.categories.push(r.id);
                    }
                })
            }
        }


        if (data['Services']) {
            const servicesData = data['Services'].split(',');
            const response = await getServices();
            if (response) {
                response.services.filter((r) => {
                    if (servicesData.includes(r.name)) {
                        appointmentPayload.appointment.services.push(r.id);
                    }
                })
            }
        }

        // const peopleData = data.Peoples.split(' ');
        // if(peopleData.length){
        //     const response = await getPeople();
        //     if (response) {
        //         response.users.filter((r) => {
        //             if (peopleData.includes(r.shortName)) {
        //                 appointmentPayload.appointment.people.push(r.id);
        //             }
        //         })
        //     }
        // }

        if (data['Resources']) {
            const resourcesData = data['Resources'].split(',');
            const response = await getResources();
            if (response) {
                response.resources.filter((r) => {
                    if (resourcesData.includes(r.name)) {
                        appointmentPayload.appointment.resources.push(r.id);
                    }
                })
            }
        }

        appointmentPayload.appointment.patients[0] = await createContactOnCC(data);

        appointmentPayload.appointment.startsAt = convertTimeFormatToCC(data.calendar.startTime);
        appointmentPayload.appointment.endsAt = convertTimeFormatToCC(data.calendar.startTime);
        appointmentPayload.appointment.reminderStatus = "default";
        appointmentPayload.appointment.slot = true;

        console.log('ready to create appointment');
        const ccAppintmentResponse = await createAppointment(appointmentPayload);
        if (ccAppintmentResponse) {
            await saveBridgeEntity(ccAppintmentResponse.appointment, { id: data.calendar.appointmentId });
            console.log("____Payload in creating Appointment on CC______", appointmentPayload, ccAppintmentResponse);
        }
    }
};

const saveBridgeEntity = (ccData, ghlData) => {
    if (ccData && ghlData) {
        return bridgeModel.createbrigeEntity({
            uniqCCId: ccData.id,
            uniqGHLId: ghlData.id,
            type: "Appointment",
            source: "GHL"
        });
    }
};


const getAppointment = (uniqGHLId) => {
    return bridgeModel.getbrigeEntity({ uniqGHLId, type: 'Appointment' });
};

const UpdateAppointmentOnCC = async (data) => {
    console.log('in UpdateAppointmentOnCC');
    console.log(data.calendar.last_updated_by_meta.source, 'metaSouce');
    if (data.calendar.last_updated_by_meta.source != 'third_party') {
        const { uniqCCId } = await getAppointment(data.calendar.appointmentId) || {};
        console.log('========================================================', uniqCCId);
        if (uniqCCId) {

            const appointmentPayload = {
                appointment: {
                    categories: [],
                    // patients: [],
                    // people: [],
                    resources: [],
                    services: []
                }
            };

            if (data['Appointment Categories']) {
                const categoriesData = data['Appointment Categories'].split(',');
                const response = await getAppointmentCategories();
                if (response) {
                    response.appointmentCategories.filter((r) => {
                        if (categoriesData.includes(r.title)) {
                            appointmentPayload.appointment.categories.push(r.id);
                        }
                    })
                }
            }

            if (data.Services) {
                const servicesData = data.Services.split(',');
                const response = await getServices();
                if (response) {
                    response.services.filter((r) => {
                        if (servicesData.includes(r.name)) {
                            appointmentPayload.appointment.services.push(r.id);
                        }
                    })
                }
            }

            // const peopleData = data.Peoples.split(' ');
            // if(peopleData.length){
            //     const response = await getPeople();
            //     if (response) {
            //         response.users.filter((r) => {
            //             if (peopleData.includes(r.shortName)) {
            //                 appointmentPayload.appointment.people.push(r.id);
            //             }
            //         })
            //     }
            // }

            if (data.Resources) {
                const resourcesData = data.Resources.split(',');
                const response = await getResources();
                if (response) {
                    response.resources.filter((r) => {
                        if (resourcesData.includes(r.name)) {
                            appointmentPayload.appointment.resources.push(r.id);
                        }
                    })
                }
            }

            // const patientsData = data.Patients.split(' ');
            // if(patientsData.length){
            //     const response = await getPatients();
            //     if (response) {
            //         response.patients.filter((r) => {
            //             if (patientsData.includes(r.fullName)) {
            //                 appointmentPayload.appointment.patients.push(r.id);
            //             }
            //         })
            //     }
            // }

            appointmentPayload.appointment.startsAt = convertTimeFormatToCC(data.calendar.startTime);
            appointmentPayload.appointment.endsAt = convertTimeFormatToCC(data.calendar.endTime);
            appointmentPayload.appointment.title = data.calendar.title;
            if (data.calendar.appoinmentStatus == 'cancelled') {
                appointmentPayload.appointment.canceledWhy = "cancelled at autoPatient";
            }

            const ccAppintmentResponse = await updateAppointment(appointmentPayload, uniqCCId);
            if (ccAppintmentResponse) {
                console.log("____Payload in updating Appointment on CC______", appointmentPayload, ccAppintmentResponse);
            }
        }
    } else if (data.calendar.appoinmentStatus == 'cancelled') {
        const { uniqCCId } = await getAppointment(data.calendar.appointmentId) || {};
        const appointmentPayload = { appointment: {} };
        appointmentPayload.appointment.canceledWhy = "cancelled at autoPatient";
        const ccAppintmentResponse = await updateAppointment(appointmentPayload, uniqCCId);
        if (ccAppintmentResponse) {
            console.log("____Payload in cancelling Appointment on CC______", appointmentPayload, ccAppintmentResponse);
        }
    }
};

// const getContactCCId = async (ghlContactId) => {
//     const dbRes =  await bridgeModel.getbrigeEntity({ uniqGHLId: ghlContactId, type: 'Contact', source: 'CC' }) || {};
//     if(dbRes){
//         return dbRes.uniqCCId;
//     }
// }

const createContactOnCC = async (data) => {
    console.log('in createContactOnCC', data.email);
     // const contactId = await getContactCCId(data.contact_id);
     let action = 'createContact';
     let patientId = '';
     const ifFound = await bridgeModel.getbrigeEntity({'uniqGHLId': data.contact_id, 'type': 'Contact'});
     console.log(ifFound, 'ifFound');
     if(ifFound){
        patientId = ifFound.uniqCCId;
        action = 'updateContact';
     }else{
        console.log('InElse');
        const searchRes = await searchPatient(data.email);
        console.log(searchRes, 'searchRes');
        if(searchRes.patients.length > 0){
            action = 'updateContact';
            patientId = searchRes.patients[0].id;
        }
     }

    const contactPayload = {
            patient: {
                "active": true,
                "addresses": [{
                    "city": data.city,
                    "country": data.country,
                    "label": null,
                    "name": null,
                    "patient": null,
                    "postalCode": data.postal_code,
                    "primary": true,
                    "street": null,
                    "streetNumber": null
                }],
                "avatarUrl": null,
                "categories": [], //
                "createdAt": null,
                "createdBy": null,
                "customFields": [],
                "dob": data.date_of_birth,
                // "email": data.email,
                "firstName": data.first_name,
                "flashMessage": data.Message,
                "gender": data.Gender,
                "healthInsurance": null,
                "lastName": data.last_name,
                // "phoneMobile": data.phone,
                "qrUrl": null,
                "ssn": null,
                "title": null,
                "titleSuffix": null,
                "updatedAt": null,
                "updatedBy": null
            }
    }

    const ccCustomFields =  await getCustomFields();

    let cfName = getKeyByValue(data, data.email);
     data.email ? contactPayload.patient.customFields.push(await customFieldFormat(cfName, data.email, ccCustomFields)): '';
     cfName = getKeyByValue(data, data.phone);
     data.phone ? contactPayload.patient.customFields.push(await customFieldFormat(cfName, data.phone, ccCustomFields)): '';

    if (data['Categories']) {
        const categoriesData = data['Categories'].split(',');
        const response = await getCategories();
        if (response) {
            response.categories.filter((r) => {
                if (categoriesData.includes(r.title)) {
                    contactPayload.patient.categories.push(r.id);
                }
            })
        }
    }
    // data.date_of_birth ? contactPayload.contact = data.date_of_birth : '';
    // data.email ? contactPayload.contact.email = data.email : '';
    // data.first_name ? contactPayload.contact.firstName = data.first_name : '';
    // data.last_name ? contactPayload.contact.lastName = data.last_name : '';
    // data.phone ? contactPayload.contact.phoneMobile = data.phone : '';
    // data.Gender ? contactPayload.contact.gender = data.Gender : '';
    // data.address1 ? contactPayload.contact.addresses = `${data.address1}, ${data.city}, ${data.country}, ${data.postal_code}` : ''; 
    
    if(data.calendar.created_by_meta.source != 'third_party'){
        if(action == 'createContact'){
            const ccContactResponse = await createPatient(contactPayload);
            if (ccContactResponse.patient) {
                const dbResponse = await bridgeModel.createbrigeEntity({
                    uniqCCId: ccContactResponse.patient.id,
                    uniqGHLId: data.contact_id,
                    type: "Contact",
                    source: "GHL"
                });
                console.log(dbResponse, 'dbResponse');
                console.log("____Payload in creating Contact on CC______", contactPayload, ccContactResponse);
            }
            return ccContactResponse.patient.id;
        }else{
            const ccContactResponse = await updatePatient(contactPayload, patientId);
            if (ccContactResponse) {
                console.log("____Payload in updating Contact on CC______", contactPayload, ccContactResponse);
            }
            return ccContactResponse.patient.id;
        }
    }
}

const customFieldFormat = async (cfname, value, ccCustomFields) => {
   const id = getCustomFieldId(cfname, ccCustomFields);
   let customFieldObj = {};
   ccCustomFields.customFields.filter( (ele) => {
        if(ele.id == id){
            customFieldObj = {
                field: ele,
                values: [{
                    createdAt: null,
                    value: value
                }]
            }
            if(ele.allowedValues.length > 0){
                ele.allowedValues.filter((allowedValue) => {
                    if(allowedValue == value){
                        customFieldObj.values[0].id = allowedValue.id;
                    }
                });
            }
        }
   });
   return customFieldObj;
}

const getCustomFieldId = (cfname, ccCustomFields) => {

    let customFieldId = '';
    const stdMapping = ghlToCCMapArr.find((obj) => cfname == obj.ghlName);
    ccCustomFields.customFields.filter((ele) => {
        if(stdMapping && ele.name == stdMapping.ccCfName) {
            customFieldId = ele.id;
        }
    });
    return customFieldId;
}

const ghlToCCMapArr = [
    {
        ghlName: 'phone',
        ccCfName: 'phone-mobile'
    },
    {
        ghlName: 'email',
        ccCfName: 'email'
    }

];

module.exports = {
    CreateAppointmentOnCC,
    UpdateAppointmentOnCC
}