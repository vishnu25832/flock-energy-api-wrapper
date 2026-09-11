const client = require("../utils/axiosClient");

async function getTransformers(page = 1) {
  const response = await client.get("/portal/dts", {
    params: {
      page,
    },
  });

  return response.data;
}

module.exports = {
  getTransformers,
};