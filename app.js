const express = require("express");

const { login } = require("./src/clients/auth.client");
const meterRoutes = require("./src/routes/meter.routes");
const errorHandler = require("./src/middleware/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const app = express();

app.set("json spaces", 2);

app.use(express.json());

app.use("/api/meters", meterRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

const PORT = 3000;

async function startServer() {
  try {
    console.log("Logging into Urja Portal...");

    await login();

    console.log("Login successful.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to login:", err.message);
    process.exit(1);
  }
}

startServer();