module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next(); // allow preflight requests
  }

  const apiKey = req.headers["doctorsecreatkey"]; // Automatically headers will convert to lowercase
  console.log(apiKey)
  if (!apiKey) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }

  next();
};