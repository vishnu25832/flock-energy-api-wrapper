const client = require("../utils/axiosClient");

async function getEnergy(meterId) {
  const response = await client.get(
    `/portal/meters/${meterId}/energy`
  );

  return response.data;
}

module.exports = {
  getEnergy,
};