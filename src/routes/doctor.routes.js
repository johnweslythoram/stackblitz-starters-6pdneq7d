const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor.controller");
const authenticateToken = require("../middlewares/tokenAuthentication");

router.get("/allDoctors",doctorController.allDoctors); 
router.get("/singleDoctor", doctorController.singleDoctor); 
router.post("/doctorUpcoming", doctorController.doctorUpcomin); 
router.post("/checkAvailability", doctorController.checkAvailability); 
router.get("/userappointments", doctorController.userappointments); 
router.post("/appointmentStatus", doctorController.appointmentStatus); 
router.post("/transactionStatus", doctorController.transactionStatus); 
router.post("/cancelTransaction", doctorController.cancelTransaction); 
router.post("/bookAppointment", doctorController.bookAppointment); 

module.exports = router;
