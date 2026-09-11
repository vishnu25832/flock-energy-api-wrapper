const dtsService = require("../services/dts.service");

async function getTransformers(req, res, next) {
  try {
    const rawPage = req.query.page;

    if (rawPage !== undefined) {
      const page = Number(rawPage);

      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          success: false,
          message: "page must be a positive integer",
        });
      }

      const data = await dtsService.getTransformers(page);
      return res.json(data);
    }

    const data = await dtsService.getTransformers(1);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTransformers,
};