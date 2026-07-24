const express = require("express");

const router = express.Router();

const meterController = require("../controllers/meter.controller");
const energyController = require("../controllers/energy.controller");
const geoController = require("../controllers/geo.controller");

/**
 * @swagger
 * /api/meters:
 *   get:
 *     summary: Get all meters
 *     responses:
 *       200:
 *         description: Returns a paginated list of meters.
 */
router.get("/", meterController.getMeters);

/**
 * @swagger
 * /api/meters/{meterId}:
 *   get:
 *     summary: Get a meter by ID
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns meter details, geo, and energy data.
 *       404:
 *         description: Meter not found.
 */
router.get("/:meterId", meterController.getMeter);

/**
 * @swagger
 * /api/meters/{meterId}/energy:
 *   get:
 *     summary: Get meter energy readings
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns energy readings.
 */
router.get("/:meterId/energy", energyController.getEnergy);

/**
 * @swagger
 * /api/meters/{meterId}/geo:
 *   get:
 *     summary: Get meter geographic location
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns meter latitude and longitude.
 */
router.get("/:meterId/geo", geoController.getGeo);

module.exports = router;