const client = require("../utils/axiosClient");

async function getMeters(search = "", page = 1) {
  const response = await client.get("/portal/meters/search", {
    params: {
      q: search,
      page,
    },
  });

  return response.data;
}

module.exports = {
  getMeters,
};