const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workflow Hub API is running 🚀",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body must be 20 KB or smaller." });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ success: false, message: "Request body must contain valid JSON." });
  }
  return res.status(500).json({ success: false, message: "Internal server error." });
});

module.exports = app;
