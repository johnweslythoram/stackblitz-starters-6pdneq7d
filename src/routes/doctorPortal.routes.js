const express = require("express");
const router = express.Router();
const doctorPotalController = require("../controllers/doctorPortal.controller");
const authenticateToken = require("../middlewares/tokenAuthentication");

router.post("/doctorsignin",doctorPotalController.signin); 
router.get("/getLoggedInDoctor",authenticateToken,doctorPotalController.getLoggedInDoctor); 
router.post("/dailyAppointment",doctorPotalController.dailyAppointment);
router.post("/appointments_by_date",doctorPotalController.appointments_by_date);
router.post("/doctorPatientStats",doctorPotalController.doctorPatientStats);
router.post("/earnings",doctorPotalController.earnings);
router.post("/dailyreports",doctorPotalController.dailyreports);
router.post("/weeklyreports",doctorPotalController.weelyreports);
router.post("/monthlyreports",doctorPotalController.mothlyreports);
router.post("/yearlyreports",doctorPotalController.yearlyreports);
router.post("/appointmentsByDate",doctorPotalController.appointmentsByDate);
router.post("/appointmentsFromToday",doctorPotalController.appointmentsFromToday);
router.post("/allPatientDetailsByDoctor",doctorPotalController.allPatientDetailsByDoctor);
router.post("/singlePatientDetailsByDoctor",doctorPotalController.singlePatientDetailsByDoctor);
router.post("/leaverequest",doctorPotalController.leaverequest);
router.post("/leavesummarybydoctor",doctorPotalController.leavesummarybydoctor);
router.post("/leavedetailsbydoctor",doctorPotalController.leavedetailsbydoctor);
router.post("/notifications",doctorPotalController.notifications);
router.post("/updatesinglenotification",doctorPotalController.updatesinglenotification);
router.post("/updateIsfavoriteNotifications",doctorPotalController.updateIsfavoriteNotifications);
router.post("/updateReadNotifications",doctorPotalController.updateReadNotifications);
router.post("/allpatients",doctorPotalController.allpatients);
router.post("/dateWiseAppointmentCount",doctorPotalController.dateWiseAppointmentCount);

module.exports = router;


// async function doctorPatientStats(doctorName) {
//   const now = new Date().toISOString(); // full timestamp
//   const oneMonthAgo = new Date();
//   oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//   // 1️⃣ Fetch all appointments for the doctor till NOW
//   const { data: pastAppointments, error: pastError } = await supabase
//     .from("appointments")
//     .select("patient_email, appointment_date")
//     .eq("doctor_name", doctorName)
//     .lte("appointment_date", now); // till this time

//   if (pastError) throw pastError;

//   // 2️⃣ Fetch upcoming appointments (after this exact time)
//   const { data: upcomingAppointments, error: upcomingError } = await supabase
//     .from("appointments")
//     .select("patient_email, appointment_date")
//     .eq("doctor_name", doctorName)
//     .gt("appointment_date", now); // after this time

//   if (upcomingError) throw upcomingError;

//   if (!pastAppointments.length && !upcomingAppointments.length)
//     return { message: `No appointments found for Dr. ${doctorName}` };

//   // 3️⃣ Total unique patients till now
//   const uniquePastPatients = [...new Set(pastAppointments.map(a => a.patient_email))];

//   // 4️⃣ Upcoming unique patients
//   const upcomingPatients = [...new Set(upcomingAppointments.map(a => a.patient_email))];

//   // 5️⃣ Determine latest visit per patient
//   const latestAppointments = {};

//   pastAppointments.forEach(app => {
//     const existing = latestAppointments[app.patient_email];
//     if (!existing || new Date(app.appointment_date) > new Date(existing)) {
//       latestAppointments[app.patient_email] = app.appointment_date;
//     }
//   });

//   let activePatients = 0;
//   let inactivePatients = 0;

//   Object.entries(latestAppointments).forEach(([email, lastVisit]) => {
//     const lastSeen = new Date(lastVisit);
//     if (lastSeen >= oneMonthAgo && lastSeen <= new Date()) {
//       activePatients++;
//     } else if (lastSeen < oneMonthAgo) {
//       inactivePatients++;
//     }
//   });

//   // 6️⃣ Return structured stats
//   return {
//     doctor: doctorName,
//     asOf: now,
//     totalPatients: uniquePastPatients.length,
//     activePatients,
//     inactivePatients,
//     upcomingPatients: upcomingPatients.length,
//     details: {
//       totalUniquePatients: uniquePastPatients,
//       upcomingPatientEmails: upcomingPatients,
//     },
//   };
// }

