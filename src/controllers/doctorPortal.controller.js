const doctorPortalService = require("../services/doctorPortal.service");
const pusher = require("../../pusher")
const CryptoJS = require('crypto-js');
const { decrypt } = require("dotenv");
const secretKey = 'your-shared-secret-key';
function encrptdata(doctorDetails) {
    const jsonString = JSON.stringify(doctorDetails);
    return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
}
async function signin(req, res) {
    const { email, password } = req.body;
    try {
        const result = await doctorPortalService.signin(email, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function getLoggedInDoctor(req, res) {
    try {
        const doctorDetails = req.user;
        console.log(doctorDetails)
        console.log(encrptdata(doctorDetails))
        return res.json({
            success: true,
            data: encrptdata(doctorDetails)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function dailyAppointment(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.dailyAppointment(doctorName);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function appointments_by_date(req, res) {
    const { doctorName, date } = req.body;
    try {
        const result = await doctorPortalService.appointments_by_date(doctorName, date);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function doctorPatientStats(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.doctorPatientStats(doctorName);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function earnings(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.earnings(doctorName);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function dailyreports(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.dailyreports(doctorName);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function weelyreports(req, res) {
    const { doctorName, month, year } = req.body;
    try {
        const result = await doctorPortalService.weelyreports(doctorName, month, year);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function mothlyreports(req, res) {
    const { doctorName, month, year } = req.body;
    try {
        const result = await doctorPortalService.mothlyreports(doctorName, month, year);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function yearlyreports(req, res) {
    const { doctorName, year } = req.body;
    try {
        const result = await doctorPortalService.yearlyreports(doctorName, year);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function appointmentsByDate(req, res) {
    const { doctorName, date } = req.body;
    try {
        const result = await doctorPortalService.appointmentsByDate(doctorName, date);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function appointmentsFromToday(req, res) {
    const { doctorName, date } = req.body;
    try {
        const result = await doctorPortalService.appointmentsFromToday(doctorName, date);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function allPatientDetailsByDoctor(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.allPatientDetailsByDoctor(doctorName);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function singlePatientDetailsByDoctor(req, res) {
    const { doctorName, patientId } = req.body;
    try {
        const result = await doctorPortalService.singlePatientDetailsByDoctor(doctorName, patientId);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function leaverequest(req, res) {
    const { doctor_id, leave_type, start_date, end_date, reason } = req.body;
    try {
        const result = await doctorPortalService.leaverequest(doctor_id, leave_type, start_date, end_date, reason);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function leavesummarybydoctor(req, res) {
    const { doctor_id } = req.body;
    try {
        const result = await doctorPortalService.leavesummarybydoctor(doctor_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function leavedetailsbydoctor(req, res) {
    const { doctor_id } = req.body;
    try {
        const result = await doctorPortalService.leavedetailsbydoctor(doctor_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function notifications(req, res) {
    const { doctor_id } = req.body;
    try {
        const result = await doctorPortalService.notifications(doctor_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function updatesinglenotification(req, res) {
    const { id } = req.body;
    try {
        const result = await doctorPortalService.updatesinglenotification(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function updateIsfavoriteNotifications(req, res) {
    const { id, value } = req.body;
    try {
        const result = await doctorPortalService.updateIsfavoriteNotifications(id, value);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}
async function updateReadNotifications(req, res) {
    const { id } = req.body;
    try {
        const result = await doctorPortalService.updateReadNotifications(id);
        res.status(200).json(result);
    } catch (err) {
        console.log(res)
        res.status(401).json({ message: err.message });
    }
}
async function allpatients(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.allpatients(doctorName);
        res.status(200).json(result);
    } catch (err) {
        console.log(res)
        res.status(401).json({ message: err.message });
    }
}
async function dateWiseAppointmentCount(req, res) {
    const { doctorName } = req.body;
    try {
        const result = await doctorPortalService.dateWiseAppointmentCount(doctorName);
        res.status(200).json(result);
    } catch (err) {
        console.log(res)
        res.status(401).json({ message: err.message });
    }
}

module.exports = { dateWiseAppointmentCount, updateReadNotifications, updateIsfavoriteNotifications, updatesinglenotification, notifications, getLoggedInDoctor, signin, leavedetailsbydoctor, leavesummarybydoctor, dailyAppointment, appointments_by_date, doctorPatientStats, earnings, dailyreports, weelyreports, mothlyreports, yearlyreports, appointmentsByDate, appointmentsFromToday, allPatientDetailsByDoctor, singlePatientDetailsByDoctor, leaverequest, allpatients };