const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const checkHeader = require("./middlewares/checkHeader");
const pusher = require("../pusher")
const cron = require('node-cron');
// import cron from 'node-cron';

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const trackerRoutes = require("./routes/tracker.routes");
const doctorRoutes = require("./routes/doctor.routes");
const doctorPortalRouted = require("./routes/doctorPortal.routes");

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "DoctorSecreatKey", "authorization"],
    credentials: true,
  })
);

// app.get("/test-pusher", (req, res) => {
//   console.log("hihi")
//   pusher.trigger("appointments-channel", "appointment-updated", {
//     action: "test",
//     result: { id: 1, patient: "John Doe", status: "canceled" }
//   });
//   res.send("Event sent");
// });

// app.use(checkHeader);
cron.schedule('29,59 9-17 * * *', async () => {
  try {
    console.log('⏰ Running scheduled API call:', new Date().toLocaleString()); 
  } catch (err) {
    console.error('❌ API call failed:', err.message);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/doctorPortal", doctorPortalRouted);

module.exports = app;
