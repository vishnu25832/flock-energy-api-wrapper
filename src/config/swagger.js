const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Flock Energy API",
      version: "1.0.0",
      description:
        "REST API wrapper around the Urja Operations Portal used for retrieving meter, energy, geographic, and transformer data.",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Meters",
        description: "Meter discovery and meter-related operations",
      },
      {
        name: "Transformers",
        description: "Distribution transformer operations",
      },
    ],

    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Meter not found",
            },
          },
        },

        GeoLocation: {
          type: "object",
          properties: {
            latitude: {
              type: "string",
              example: "26.938961002479868",
            },
            longitude: {
              type: "string",
              example: "75.83095696146852",
            },
          },
        },

        EnergyReading: {
          type: "object",
          properties: {
            timestamp: {
              type: "string",
              example: "27/06/2026 12:00",
            },
            kwh: {
              type: "string",
              example: "123.45",
            },
            kvah: {
              type: "string",
              example: "130.12",
            },
            voltR: {
              type: "string",
              example: "231.50",
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);