const { login } = require("./src/clients/auth.client");

async function test() {
  try {
    const result = await login();

    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
}

test();