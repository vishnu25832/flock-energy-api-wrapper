const client = require("../utils/axiosClient");

async function getMeters(page = 1, q = "") {
  const response = await client.get("/portal/meters/search", {
    params: {
      q,
      page,
    },
  });

  return response.data;
}

async function getMeterById(meterId) {
  const response = await client.get("/portal/meters/search", {
    params: {
      q: meterId,
      page: 1,
    },
  });

  const meter = response.data.data.find(
    (item) => item.meterId === meterId
  );

  if (!meter) {
    const error = new Error("Meter not found");
    error.status = 404;
    throw error;
  }

  return meter;
}

module.exports = {
  getMeters,
  getMeterById,
};