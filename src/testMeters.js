const { login } = require("./clients/auth.client");
const client = require("./utils/axiosClient");

async function main() {
  await login();

  const response = await client.get("/portal/meters/search?q=&page=1");

  console.log(response.data);
}

main().catch(console.error);