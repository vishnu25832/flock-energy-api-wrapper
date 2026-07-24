const geoService = require("../services/geo.service");

async function getGeo(req, res, next) {
  try {
    const { meterId } = req.params;

    const data = await geoService.getGeo(meterId);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getGeo,
};