const ghlCredModel = require("../model/ghlCred");

const getGHlCred = async (clientId) => {
  const CredRes = (await ghlCredModel.getGhlCred({ clientId })) || {};
  global.ghl_access_token = "Bearer " + CredRes.accessToken;
  global.ghlRefreshToken = CredRes.refreshToken;
  global.staticGHLlocationId = CredRes.locationId;
};

const moment = require("moment");

const processCfName = (str) => str.replace(/[ -]/g, "").toLowerCase();

const reduceCustomFieldValue = (values) => {
  if (Array.isArray(values))
    return values.reduce(
      (val1, val2) => `${val1}${contactHelper(val1)}${val2}`,
      ""
    );
  return values;
};

const contactHelper = (str) => (str ? "," : "");

const convertTimeFormatToGHL = (dateStr) =>
  dateStr && moment.parseZone(dateStr).local().format();

const convertTimeFormatToCC = (dateStr) => {
  if (dateStr) {
    const splited = dateStr.split("T");
    const timeArr = splited[1].split(":");
    timeArr[0] = `${(timeArr[0] < 11 ? "0" : "") + (parseInt(timeArr[0]) - 2)}`;
    const correctDateStr = splited[0] + "T" + timeArr.join(":");
    return moment(correctDateStr).utc().format().replace("00Z", "00.000Z");
  }
};

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

module.exports = {
  processCfName,
  reduceCustomFieldValue,
  convertTimeFormatToGHL,
  convertTimeFormatToCC,
  getGHlCred,
  getKeyByValue,
};
