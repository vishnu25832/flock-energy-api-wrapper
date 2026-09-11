const express = require("express");

const router = express.Router();
const dtsController = require("../controllers/dts.controller");

/**
 * @swagger
 * /api/transformers:
 *   get:
 *     summary: Get distribution transformers
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: Returns a paginated list of distribution transformers.
 */
router.get("/", dtsController.getTransformers);

module.exports = router;