const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");
const config = require("../config/config");

const jar = new CookieJar();

const client = wrapper(
  axios.create({
    baseURL: config.baseURL,
    jar,
    withCredentials: true,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  })
);

module.exports = client;