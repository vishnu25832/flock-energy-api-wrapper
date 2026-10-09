function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.response?.status || err.status || 500;

  let message = err.message || "Internal Server Error";

  if (status === 404 && !err.message) {
    message = "Resource not found";
  }

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;