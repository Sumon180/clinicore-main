const { makeAxiosRequest, makeRequestReq } = require('../util/apiCaller');
const { ghlUrl,  } = require(`../env/${process.env.ENV}.js`);

const getGhlCustomfields = () => {
  const url = ghlUrl + '/locations/' + staticGHLlocationId + '/customFields';
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'GET';
  const payload = null;

  return makeRequestReq(url, params, headers, method, payload);
};

// const createPatientToGhl = (payload) => {
//   const url = ghlUrl + '/contacts/';
//   const params = '';
//   const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
//   const method = 'POST';
//   const data = { ...payload, locationId: staticGHLlocationId };

//   return makeAxiosRequest(url, params, headers, method, data);
// };

const createPatientToGhl = (payload) => {
  const url = ghlUrl + '/contacts/upsert';
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'POST';
  const data = { ...payload, locationId: staticGHLlocationId };

  return makeRequestReq(url, params, headers, method, data);
};

const createAppointmentToGhl = (payload) => {
  const url = ghlUrl + '/calendars/events/appointments';
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'POST';
  const data = { ...payload, locationId: staticGHLlocationId };

  return makeRequestReq(url, params, headers, method, data);
};

const updateAppointmentToGhl = (payload, appointmentId) => {
  const url = ghlUrl + '/calendars/events/appointments/' + appointmentId;
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'PUT';
  const data = { ...payload, locationId: staticGHLlocationId };

  return makeRequestReq(url, params, headers, method, data);
};

const deleteAppointmentToGhl = (calenderId) => {
  const url = ghlUrl + '/calendars/events/' + calenderId;
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'DELETE';
  const data = '';

  return makeRequestReq(url, params, headers, method, data);
};

const createNote = async (contactId, body) => {
  const url = ghlUrl + '/contacts/' + contactId + '/notes';
  const params = '';
  const method = 'POST';
  const data = { body };
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };

  return makeRequestReq(url, params, headers, method, data);
};

const fetchCalendar = () => {
  const url = ghlUrl + '/calendars/';
  const params = '';
  const qs = { locationId: staticGHLlocationId };
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'GET';
  const payload = null;

  return makeRequestReq(url, params, headers, method, payload, qs);
};

const updatePatientToGhl = (contactId, payload)=>{
  const url = ghlUrl + '/contacts/' + contactId;
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'PUT';
  const data = { ...payload };

  return makeRequestReq(url, params, headers, method, data);
};

const fetchPatients = (contactId) => {
  const url = ghlUrl + '/contacts/' + contactId;
  const params = '';
  // const qs = { locationId: staticGHLlocationId, query };
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'GET';
  const payload = null;

  return makeRequestReq(url, params, headers, method, payload);
};

// const createCustomField = async (CCCustomFieldData) => {
//     const url = ghlUrl+'/locations/'+staticGHLlocationId+'/customFields';
//     const params = '';
//     const headers = { 'Content-Type': 'application/json', Authorization: ghl_access_token, Version: '2021-04-15'};
//     const method = 'POST';
//     const payload = {
//         name: CCCustomFieldData.field.name ? CCCustomFieldData.field.name : '',
//         dataType: CCCustomFieldData.field.type ? CCCustomFieldData.field.type : '',
//         placeholder: '',
//         acceptedFormat: '',
//         isMultipleFile: CCCustomFieldData.field.allowMultipleValues ? CCCustomFieldData.field.allowMultipleValues : '',
//         maxNumberOfFiles: '',
//         maxNumberOfFiles: [],
//         position: CCCustomFieldData.field.positions ? CCCustomFieldData.field.positions : ''
//     }
//     return makeRequestReq(url, params, headers, method, payload);
// }

const addTags = (contactId, tags) => {
  const url = ghlUrl + '/contacts/'+contactId+'/tags';
  const params = '';
  const headers = { 'Content-Type': 'application/json', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'POST';
  const data = tags;

  return makeRequestReq(url, params, headers, method, data);
};

const uploadFile = (data) => {
  const url = ghlUrl + '/conversations/messages/upload';
  const params = '';
  const headers = { 'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001', Version: '2021-04-15', Authorization: ghl_access_token };
  const method = 'POST';
  const payload = data;

  return makeRequestReq(url, params, headers, method, payload);
};

module.exports = {
  getGhlCustomfields,
  fetchCalendar,
  updateAppointmentToGhl,
  createPatientToGhl,
  updatePatientToGhl,
  createAppointmentToGhl,
  deleteAppointmentToGhl,
  createNote,
  // upsertPatientToGhl,
  fetchPatients,
  addTags,
  uploadFile
}