const energyService = require("../services/energy.service");

async function getEnergy(req, res, next) {
  try {
    const { meterId } = req.params;

    const data = await energyService.getEnergy(meterId);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEnergy,
};