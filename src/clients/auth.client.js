const qs = require("qs");
const client = require("../utils/axiosClient");
const config = require("../config/config");

async function login() {
 
  await client.get("/login");

  const body = qs.stringify({
    email: config.username,
    password: config.password,
  });

  const response = await client.post("/login", body, {
    maxRedirects: 0,
    validateStatus: (status) => status < 400 || status === 401 || status === 303,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: config.baseURL,
      Referer: `${config.baseURL}/login`,
      "X-SvelteKit-Action": "true",
    },
  });

  return response.data;
}

module.exports = {
  login,
};