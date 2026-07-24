const meterService = require("../services/meter.service");
const energyService = require("../services/energy.service");
const geoService = require("../services/geo.service");

async function getMeters(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const q = req.query.q || "";

    const data = await meterService.getMeters(page, q);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getMeter(req, res, next) {
  try {
    const { meterId } = req.params;

    // First verify the meter exists
    const meter = await meterService.getMeterById(meterId);

    // Only fetch these if the meter exists
    const energy = await energyService.getEnergy(meterId);
    const geo = await geoService.getGeo(meterId);

    res.json({
      meter,
      geo: geo.data,
      energy: energy.data,
    });
  } catch (err) {
    // Convert Axios 404 into a clean API response
    if (err.response && err.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Meter not found",
      });
    }

    next(err);
  }
}

module.exports = {
  getMeters,
  getMeter,
};