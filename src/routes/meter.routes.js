
const express = require("express");

const router = express.Router();

const meterController = require("../controllers/meter.controller");
const energyController = require("../controllers/energy.controller");
const geoController = require("../controllers/geo.controller");

/**
 * @swagger
 * /api/meters:
 *   get:
 *     tags:
 *       - Meters
 *     summary: Get all meters
 *     description: Returns a paginated list of meters, optionally filtered by a search query.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number; must be a positive integer.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: q
 *         required: false
 *         description: Optional meter search query.
 *         schema:
 *           type: string
 *           default: ""
 *         example: J100000
 *     responses:
 *       200:
 *         description: Successfully retrieved meters.
 *       400:
 *         description: Invalid page parameter.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 */
router.get("/", meterController.getMeters);

/**
 * @swagger
 * /api/meters/{meterId}:
 *   get:
 *     tags:
 *       - Meters
 *     summary: Get a meter by ID
 *     description: Returns meter information together with geographic location and energy readings.
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         description: Unique meter identifier.
 *         schema:
 *           type: string
 *         example: J100000
 *     responses:
 *       200:
 *         description: Successfully retrieved the meter and related data.
 *       404:
 *         description: Meter not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 */
router.get("/:meterId", meterController.getMeter);

/**
 * @swagger
 * /api/meters/{meterId}/energy:
 *   get:
 *     tags:
 *       - Meters
 *     summary: Get meter energy readings
 *     description: Returns energy readings for the specified meter.
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         description: Unique meter identifier.
 *         schema:
 *           type: string
 *         example: J100000
 *     responses:
 *       200:
 *         description: Successfully retrieved energy readings.
 *       404:
 *         description: Meter or energy resource not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 */
router.get("/:meterId/energy", energyController.getEnergy);

/**
 * @swagger
 * /api/meters/{meterId}/geo:
 *   get:
 *     tags:
 *       - Meters
 *     summary: Get meter geographic location
 *     description: Returns the latitude and longitude associated with the specified meter.
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         description: Unique meter identifier.
 *         schema:
 *           type: string
 *         example: J100000
 *     responses:
 *       200:
 *         description: Successfully retrieved the meter location.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GeoLocation'
 *       404:
 *         description: Meter or geographic resource not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 */
router.get("/:meterId/geo", geoController.getGeo);

module.exports = router;
