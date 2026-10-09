const express = require("express");

const router = express.Router();

const dtsController = require("../controllers/dts.controller");

/**
 * @swagger
 * /api/transformers:
 *   get:
 *     tags:
 *       - Transformers
 *     summary: Get distribution transformers
 *     description: Returns a paginated list of distribution transformers from the Urja Operations Portal.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number. Must be a positive integer.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved distribution transformers.
 *       400:
 *         description: Invalid page parameter.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", dtsController.getTransformers);

module.exports = router;