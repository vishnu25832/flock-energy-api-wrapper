const dtsClient = require("../clients/dts.client");

async function getTransformers(page = 1) {
  return dtsClient.getTransformers(page);
}

module.exports = {
  getTransformers,
};