const { getCategories, getPatientCustomFields } = require('../externalAPI/clinicCore');
const { createPatientToGhl, getGhlCustomfields, createNote, updatePatientToGhl } = require('../externalAPI/goHighLevel');
const { processCfName, reduceCustomFieldValue } = require('../util/helpers');
const bridgeModel = require("../model/bridgeEntity");

const customToStandardMapArr = [
    {
        cfName: 'how-did-you-hear-about-us',
        fieldName: 'source'
    }
];

const transformPayloadForContact = async (data, migration) => {
    try {
        const { firstName = '', lastName = '', email = '', phoneMobile = '', addresses = [], gender = '', dob = null } = data;

        if (!email && !phoneMobile)
            console.log('No Email or Phone was provided.');

        let payload = {
            firstName,
            lastName,
            name: firstName + ' ' + lastName,
            email: email,
            phone: phoneMobile,
            dnd: false,
            dndSettings: {},
            tags: ["mobimed-api", "german", gender],
            customFields: [],
            dateOfBirth: dob
        }

        if(migration){
            payload.tags.push("migrated"); 
        }

        const _addresses = addresses.filter((add) => add.primary)[0];
        if (_addresses) {
            const { name = '', street = '', streetNumber = '', city = '', country = '', postalCode = '' } = _addresses;
            payload = {
                ...payload,
                address1: `${(name || '')} ${(street || '')} ${(streetNumber || '')}`,
                city,
                postalCode,
                country
            }
        }

        return payload;
    } catch (err) {
        console.log("____Error in creating Contact payload______", err);
    }
};

const fetchAllCustomFields = async (data, extraFields = []) => {
    try {
        const { categories = [], customFields = [] } = data;
        const allcustomFields = [];

        if (categories.length) {
            const response = await getCategories();
            if (response) {
                const matched = response.categories.filter(e => categories.includes(e.id));
                allcustomFields.push({ name: "Categories", values: matched.map(e => e.label) });
            }
        }

        if (customFields.length) {
            const response = await getPatientCustomFields(customFields);
            if (response) {
                response.patientCustomFields.forEach(e => {
                    allcustomFields.push({ name: e.field.name, values: e.values.map(val => val.value) });
                });
            }
        }

        console.log("_____fetched customFields___", JSON.stringify([...allcustomFields, ...extraFields]));
        return [...allcustomFields, ...extraFields];

    } catch (err) {
        console.log("____Error in fetching customFields___", err);
    }
};

const processPayload = async (payload, customFields) => {
    const { customFields: ghlCustomFields } = await getGhlCustomfields();

    customFields.forEach((cc) => {
        const ghlMatchedCF = ghlCustomFields.find((ghl) => processCfName(cc.name) == processCfName(ghl.name));
        if (ghlMatchedCF) {
            payload.customFields.push({ id: ghlMatchedCF.id, field_value: reduceCustomFieldValue(cc.values) });
        } else {
            const standarField = customToStandardMapArr.find((ele) => cc.name == ele.cfName);
            if (standarField) payload[standarField.fieldName] = reduceCustomFieldValue(cc.values);
        }
    });
}

const saveBridgeEntity = (ccData, ghlData, migration) => {
    if (ccData && ghlData) {
        return bridgeModel.createbrigeEntity({
            uniqCCId: ccData.id,
            uniqGHLId: ghlData.id,
            type: "Contact",
            source: "CC",
            createdByMigration: migration
        });
    }
};

const createContact = async (data, extraFields = [], migration) => {
    try {

        const { uniqGHLId: contactId } = await getContact(data.id) || {};
        if(contactId){
            console.log('_____already created contact____', contactId);
            return;
        }

        const payload = await transformPayloadForContact(data, migration);

        const customFields = await fetchAllCustomFields(data, extraFields);
        await processPayload(payload, customFields);

        console.log("____payload in creating Contact______", payload);

        const { contact: ghlResponse } = await createPatientToGhl(payload);
        console.log("____ghlId in creating Contact______", ghlResponse.id);

        const note = customFields.find(e => e.name == 'note');
        if (note && note.values[0]) await createNote(ghlResponse.id, note.values[0]);

        await saveBridgeEntity(data, ghlResponse, migration);
        console.log("____Contact created______");

        return ghlResponse.id;
    } catch (err) {
        console.log("____Error in creating Contact______", err);
    }
};

const updateContact = async (contactId, extraFields = []) => {
    try {
        const payload = { customFields: [] };

        const customFields = await fetchAllCustomFields({}, extraFields);
        await processPayload(payload, customFields);

        const { contact: ghlResponse } = await updatePatientToGhl(contactId, payload);
        console.log("____ghlId in updating Contact______", ghlResponse.id);

        console.log("____Contact updated______");
    } catch (err) {
        console.log("____Error in updating Contact______", err);
    }
};

const getContact = (uniqCCId) => {
    return bridgeModel.getbrigeEntity({ uniqCCId, type: 'Contact' });
};

module.exports = {
    createContact,
    updateContact,
    getContact
};
