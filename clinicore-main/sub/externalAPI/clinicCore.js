const { makeAxiosRequest } = require("../util/apiCaller");
const { ccUrl, ccDemoToken } = require(`../env/${process.env.ENV}.js`);

const getCategories = () => {
  let url = ccUrl + "/categories";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = {};

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getAppointmentCategories = () => {
  let url = ccUrl + "/appointmentCategories";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = {};

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getPeople = () => {
  let url = ccUrl + "/users";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = {};

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getServices = () => {
  let url = ccUrl + "/services";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = {};

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getResources = () => {
  let url = ccUrl + "/resources";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = {};

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getPatientCustomFields = (customIds) => {
  const url = ccUrl + "/patientCustomFields";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = {};
  params = { ids: customIds };

  return makeAxiosRequest(url, params, headers, method, payload);
};

const searchPatient = (value) => {
  const url = ccUrl + "/patients?search=" + value;
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

const createPatient = (payloadData) => {
  const url = ccUrl + "/patients";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "POST";
  let payload = payloadData;

  return makeAxiosRequest(url, params, headers, method, payload);
};

const updatePatient = (payloadData, patientId) => {
  const url = ccUrl + "/patients/" + patientId;
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "PUT";
  let payload = payloadData;

  return makeAxiosRequest(url, params, headers, method, payload);
};

const createAppointment = (payloadData) => {
  const url = ccUrl + "/appointments";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "POST";
  let payload = payloadData;

  return makeAxiosRequest(url, params, headers, method, payload);
};

const updateAppointment = (payloadData, appintmentId) => {
  const url = ccUrl + "/appointments/" + appintmentId;
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "PUT";
  let payload = payloadData;

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getPatient = (patientId) => {
  const url = ccUrl + "/patients/" + patientId;
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getCustomFields = () => {
  const url = ccUrl + "/customFields/";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getPatients = (pageNum, size) => {
  const url =
    ccUrl +
    "/patients?active=true&page[number]=" +
    pageNum +
    "&page[size]=" +
    size +
    "&sort=-createdAt";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getAppointment = (appintmentId) => {
  const url = ccUrl + "/appointments/" + appintmentId;
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getInvoices = (pageNum, size) => {
  const url =
    ccUrl +
    "/invoices?list=all&page[number]=" +
    pageNum +
    "&page[size]=" +
    size +
    "&sort=-createdAt";
  let params = "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

const getPayments = (paramsData) => {
  const url = ccUrl + "/payments";
  let params = paramsData;
  const headers = {
    "Content-Type": "application/json",
    Authorization: ccDemoToken,
  };
  const method = "GET";
  let payload = "";

  return makeAxiosRequest(url, params, headers, method, payload);
};

module.exports = {
  getCategories,
  getPeople,
  getServices,
  getResources,
  getPatientCustomFields,
  searchPatient,
  createPatient,
  updatePatient,
  createAppointment,
  updateAppointment,
  getAppointmentCategories,
  getPatient,
  getCustomFields,
  getPatients,
  getAppointment,
  getInvoices,
  getPayments,
};
