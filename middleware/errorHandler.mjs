export function notFound(_req, res, _next) {
  res.status(404).json({ message: "Not found." });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error.";
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({ message });
}