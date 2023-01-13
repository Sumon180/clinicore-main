const {
  ghlOAuthUrl,
  ghlClientId,
  ghlClientSecret,
} = require(`../env/${process.env.ENV}.js`);
const axios = require("axios");
const queryString = require("querystring");
const ghlCredModel = require("../model/ghlCred");

module.exports.getGHLAccessToken = async () => {
  const options = {
    method: "POST",
    url: ghlOAuthUrl + "/oauth/token",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: {
      client_id: ghlClientId,
      client_secret: ghlClientSecret,
      grant_type: "refresh_token",
      refresh_token: ghlRefreshToken,
    },
  };
  options.data = queryString.stringify(options.data);
  return axios
    .request(options)
    .then(async (response) => {
      console.log(response.data, "oAuthResponse");
      if (response.data.access_token) {
        const ifClientFound = await ghlCredModel.getGhlCred({
          clientId: ghlClientId,
        });
        if (!ifClientFound) {
          await ghlCredModel.createGhlCred({
            clientId: ghlClientId,
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            locationId: response.data.locationId,
          });
        } else {
          const condition = { clientId: ghlClientId };
          const body = {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
          };
          await ghlCredModel.updateGhlCred(condition, body);
        }
      }
      return response.data;
    })
    .catch(function (error) {
      console.error(error, "oAuthError");
      throw error;
    });
};
