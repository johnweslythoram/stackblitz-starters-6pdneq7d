const doctorService = require("../services/doctor.service");
const pusher = require("../../pusher")
async function allDoctors(req, res) {
  try {
    const result = await doctorService.allDoctors();
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function singleDoctor(req, res) {
  try {
    const { doctorName } = req.query
    if (!doctorName) {
      return res.status(400).json({ message: "Doctor not Found." });
    }
    const result = await doctorService.singleDoctor(doctorName);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function doctorUpcomin(req, res) {
  try {
    const { doctor_name } = req.body;
    if (!doctor_name) {
      return res.status(400).json({ error: "doctor_name is required" });
    }
    const result = await doctorService.doctorUpcomin(doctor_name);
    res.status(200).json(result);

  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function checkAvailability(req, res) {
  try {
    const { doctor_name, date, time } = req.body;
    const result = await doctorService.checkAvailability(doctor_name, date, time);
    res.status(200).json(result);

  } catch (err) {

    res.status(500).json({ error: "Internal server error" });
  }
}

async function userappointments(req, res) {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ message: "Id not Found." });
    }
    const result = await doctorService.userappointments(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
async function appointmentStatus(req, res) {
  try {
    const { id, appointment_Status } = req.body
    const result = await doctorService.appointmentStatus(id, appointment_Status);
    pusher.trigger('appointments-channel', 'appointment-updated', {
      action: 'canceled',
      result: result.data[0]
    }).catch(error => {
      console.error('Pusher error:', error);
    });;
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
async function transactionStatus(req, res) {
  try {
    const { id, transaction_Status } = req.body
    const result = await doctorService.transactionStatus(id, transaction_Status);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function cancelTransaction(req, res) {
  try {
    const { id, transaction_status, appointment_status } = req.body
    const result = await doctorService.cancelTransaction(id, transaction_status, appointment_status);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function bookAppointment(req, res) {
  try {
    const { doctor_name, doctor_email, doctor_speciality, appointment_date, appointment_time, patient_first_name, patient_last_name, patient_email, patient_mobile_no, patient_age, patient_gender, reason, category, transaction_status, appointment_status, doctor_img, userId, doctor_address, sub_category } = req.body
    const result = await doctorService.bookAppointment(doctor_name, doctor_email, doctor_speciality, appointment_date, appointment_time, patient_first_name, patient_last_name, patient_email, patient_mobile_no, patient_age, patient_gender, reason, category, transaction_status, appointment_status, doctor_img, userId, doctor_address, sub_category);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { allDoctors, singleDoctor, doctorUpcomin, checkAvailability, userappointments, appointmentStatus, transactionStatus, cancelTransaction, bookAppointment };
