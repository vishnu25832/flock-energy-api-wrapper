const meterService = require("../services/meter.service");
const energyService = require("../services/energy.service");
const geoService = require("../services/geo.service");

async function getMeters(req, res, next) {
  try {
    const rawPage = req.query.page;

    let page = 1;

    if (rawPage !== undefined) {
      page = Number(rawPage);

      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          success: false,
          message: "page must be a positive integer",
        });
      }
    }

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

    const meter = await meterService.getMeterById(meterId);

    const energy = await energyService.getEnergy(meterId);
    const geo = await geoService.getGeo(meterId);

    res.json({
      meter,
      geo: geo.data,
      energy: energy.data,
    });
  } catch (err) {
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