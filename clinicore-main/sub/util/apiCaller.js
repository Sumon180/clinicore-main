const axiosInstance = require("axios");
const requestInstance = require("request");
const { getGHlCred } = require("../util/helpers");
const { getGHLAccessToken } = require("../externalAPI/oAuth2");
const { ghlClientId } = require(`../env/${process.env.ENV}.js`);

const makeAxiosRequest = (url, params, headers, method, data) => {
  // console.log("trying req at", url);
  const options = {
    url,
    headers,
    method,
  };
  if (params) options.params = params;
  if (data) options.data = data;

  return axiosInstance(options)
    .then((res) => {
      // console.log("trying res", res.data);
      return res.data;
    })
    .catch(async (err) => {
      console.log("trying err", err.response.data);
      if (err.response) {
        if (
          err.response.statusCode == 401 &&
          (err.response.message == "Invalid token: access token has expired" ||
            err.response.message == "Invalid token: access token is invalid")
        ) {
          const authRes = await getGHLAccessToken();
          if (authRes.access_token) {
            await getGHlCred(ghlClientId);
            headers.Authorization = "Bearer " + authRes.access_token;
            const newRes = await makeRequestReq(
              url,
              params,
              headers,
              method,
              data
            );
            resolve(newRes);
          }
        }
        throw err.response.data;
      } else if (err.request) {
        // client never received a response
        throw err.request;
      } else {
        throw new Error(`Error: ${err.message}`);
      }
    });
};

const makeRequestReq = (url, params, headers, method, data, qs = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers,
      method,
      json: true,
    };
    if (params) options.params = params;
    if (data) options.body = data;
    if (qs) options.qs = qs;

    // console.log("trying req at", options);

    requestInstance(options, async (err, response, body) => {
      if (err) {
        console.log("trying res error", err.response);
        // reject('Api request error: ', err);
      } else {
        if (body.statusCode) console.log("trying res body", body);

        if (
          body.statusCode == 401 &&
          (body.message == "Invalid token: access token has expired" ||
            body.message == "Invalid token: access token is invalid")
        ) {
          const authRes = await getGHLAccessToken();

          if (authRes.access_token) {
            await getGHlCred(ghlClientId);
            headers.Authorization = "Bearer " + authRes.access_token;
            const newRes = await makeRequestReq(
              url,
              params,
              headers,
              method,
              data
            );
            resolve(newRes);
          }
        }
        resolve(body);
      }
    });
  });
};

module.exports = {
  makeAxiosRequest,
  makeRequestReq,
};
