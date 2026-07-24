const client = require("../utils/axiosClient");

async function getGeo(meterId) {
  const response = await client.get(`/portal/meters/${meterId}/geo`);

  return response.data;
}

module.exports = {
  getGeo,
};