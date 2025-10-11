export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error caught by middleware:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  return res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message,
    stack: err.stack,
  });
};
