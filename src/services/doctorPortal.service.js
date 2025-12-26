const supabase = require("../config/supabase");
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const secretKey = 'your-shared-secret-key';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '60m';
const { getWeek, getMonth, getYear, startOfWeek, endOfWeek, format, startOfMonth, endOfMonth, endOfYear, startOfYear } = require("date-fns");

function decryptPassword(encryptedPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

async function signin(email, password) {
    const realpassword = decryptPassword(password)
    const realemail = decryptPassword(email)
    const { data, error: errorSignIn } = await supabase
        .from("doctors")
        .select("*")
        .eq("doctor_email", realemail)

    if (errorSignIn) return
    if (data.length > 0) {
        const { data, error: errorPassword } = await supabase
            .from("doctors")
            .select("*")
            .eq("doctor_password", realpassword)
            .eq("doctor_email", realemail)

        console.log(data)
        if (errorSignIn) return errorSignIn
        if (data.length > 0) {
            const doctordata = data[0]
            const payload = {
                user_id: doctordata.id,
                email: doctordata.doctor_email,
                name: doctordata.doctor_name,
                emailNotification: doctordata.emailNotifications,
                appointmentNotifications: doctordata.appointmentNotifications,
                websiteNotifications: doctordata.websiteNotifications,
                '2FA': doctordata['2FA'],
                theme: doctordata.theme,
                img: doctordata.image_url
            };
            console.log("adssdsd", payload)
            const token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
            });
            return { message: "Login Successfull", token: token }
        }
        else {
            return { message: "Incorrect Password" }
        }
    }
    else {
        return { message: "Incorrect Email" }
    }
}

async function dailyAppointment(doctorName) {

    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    const { data: todayAppointments, error: todayError } = await supabase
        .from("appointments")
        .select("*")
        .eq("appointment_date", today)
        .eq("doctor_name", doctorName);

    if (todayError) throw todayError;

    if (!todayAppointments.length)
        return { message: "No appointments today." };

    const patientEmails = todayAppointments.map(a => a.patient_email);
    const { data: allAppointments, error: allError } = await supabase
        .from("appointments")
        .select("patient_email, appointment_date")
        .in("patient_email", patientEmails);

    if (allError) throw allError;

    const patientCounts = {};
    allAppointments.forEach(app => {
        if (!patientCounts[app.patient_email]) {
            patientCounts[app.patient_email] = 1;
        } else {
            patientCounts[app.patient_email]++;
        }
    });

    let newPatients = 0;
    let oldPatients = 0;

    todayAppointments.forEach(app => {
        if (patientCounts[app.patient_email] > 1) {
            oldPatients++;
        } else {
            newPatients++;
        }
    });

    return {
        date: today,
        totalAppointments: todayAppointments.length,
        newPatients,
        oldPatients,
        details: todayAppointments,
    };
}

async function appointments_by_date(doctorName) {

    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_name", doctorName)
        .eq("appointment_date", date);

    if (error) throw error;

    if (!appointments.length) {
        return res.json({
            message: `No appointments found`,
        });
    }
    return {
        appointments,
    };
}
async function doctorPatientStats(doctorName) {

    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1);
    const time = now.split("T")[1].split(".")[0];
    const formattedTime = time.split(":").slice(0, 2).join(":") + ":00";
    var oneMonthAgo = new Date();
    var oneMonthAgo = new Date(oneMonthAgo.getTime() + (5.5 * 60 * 60 * 1000))
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    if(doctorName){
    var { data: pastAppointments, error: pastError } = await supabase
        .from("appointments")
        .select("patient_email, appointment_date")
        .eq("doctor_name", doctorName)
        .lte("appointment_date", now);
    if (pastError) throw pastError;
    var { data: upcomingAppointments, error: upcomingError } = await supabase
        .from("appointments")
        .select("patient_email, appointment_date, appointment_time")
        .eq("doctor_name", doctorName)
        .gte("appointment_date", now)
    }
    if(doctorName===null || doctorName==='' || doctorName===undefined){
    var { data: pastAppointments, error: pastError } = await supabase
        .from("appointments")
        .select("patient_email, appointment_date")
        .lte("appointment_date", now);
    if (pastError) throw pastError;
    var { data: upcomingAppointments, error: upcomingError } = await supabase
        .from("appointments")
        .select("patient_email, appointment_date, appointment_time")
        .gte("appointment_date", now)
    }
    if (upcomingError) throw upcomingError;

    if (!pastAppointments.length && !upcomingAppointments.length)
        return { message: `No appointments found for Dr. ${doctorName}` };

    const uniquePastPatients = [...new Set(pastAppointments.map(a => a.patient_email))];

    const todayDATE = String(now).substring(0, 10)
    var upcomingPatientss = new Set()
    upcomingAppointments.forEach(a => {
        if (a.appointment_date > todayDATE) {
            upcomingPatientss.add(a.patient_email);
        }
        else if (a.appointment_date === todayDATE && a.appointment_time > formattedTime) {
            upcomingPatientss.add(a.patient_email);
        }
    });

    const latestAppointments = {};

    pastAppointments.forEach(app => {
        const existing = latestAppointments[app.patient_email];
        if (!existing || new Date(app.appointment_date) > new Date(existing)) {
            latestAppointments[app.patient_email] = app.appointment_date;
        }
    });

    let activePatients = 0;
    let inactivePatients = 0;

    Object.entries(latestAppointments).forEach(([email, lastVisit]) => {
        var lastSeen = new Date(lastVisit);
        var lastSeen = new Date(lastSeen.getTime() + (5.5 * 60 * 60 * 1000))
        var nowdate = new Date()
        var nowdate = new Date(nowdate.getTime() + (5.5 * 60 * 60 * 1000))
        if (lastSeen >= oneMonthAgo && lastSeen <= nowdate) {
            activePatients++;
        } else if (lastSeen < oneMonthAgo) {
            inactivePatients++;
        }
    });

    return {
        doctor: doctorName,
        asOf: now,
        totalPatients: uniquePastPatients.length,
        activePatients,
        inactivePatients,
        upcomingPatients: upcomingPatientss.size,
    };
}

async function earnings(doctorName) {

    var now = new Date();
    var now = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // 1️⃣ Fetch all completed appointments for the doctor
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("appointment_date, transaction_status, fee")
        .eq("doctor_name", doctorName)
        .eq("transaction_status", "Completed");

    if (error) throw error;
    console.log(appointments)
    if (!appointments.length)
        return { message: `No completed appointments for Dr. ${doctorName}` };

    // 2️⃣ Filter by date ranges
    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    appointments.forEach(app => {
        const date = new Date(app.appointment_date);
        const fee = Number(app.fee) || 0;
        if (date <= now) {
            totalEarnings += fee;
        }
        // today up to now
        if (date >= todayStart && date <= now) {
            todayEarnings += fee;
        }

        // this week
        if (date >= weekStart && date <= now) {
            weekEarnings += fee;
        }

        // this month
        if (date >= monthStart && date <= now) {
            monthEarnings += fee;
        }
    });
    return {
        doctor: doctorName,
        asOf: now.toISOString(),
        totalEarnings,
        todayEarnings,
        weekEarnings,
        monthEarnings,
    };
}

async function dailyreports(doctorName) {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1);

    // Base query — NO DATE FILTER
    let query = supabase
        .from("appointments")
        .select("doctor_name, appointment_date, transaction_status, fee");

    // If doctorName is provided → filter by doctor and date
    if (doctorName) {
        query = query
            .eq("doctor_name", doctorName)
            .lte("appointment_date", now); // Only past appointments
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    if (!appointments.length) {
        return { message: "No appointments found" };
    }

    // Fetch doctor images when showing ALL doctors
    let doctorImages = {};
    if (!doctorName) {
        const { data: doctorsData, error: docErr } = await supabase
            .from("doctors")
            .select("doctor_name, image_url");
        if (docErr) throw docErr;

        doctorsData.forEach(doc => {
            doctorImages[doc.doctor_name] = doc.image_url || null;
        });
    }

    // Grouping
    const grouped = {};

    appointments.forEach(app => {
        const date = new Date(app.appointment_date).toISOString().split("T")[0];

        if (!grouped[date]) {
            grouped[date] = {
                date,
                appointments: 0,
                payed: 0,
                canceled: 0,
                totalEarnings: 0,
                statuses: {},
                doctors: {}
            };
        }

        const group = grouped[date];

        group.appointments++;
        group.statuses[app.transaction_status] =
            (group.statuses[app.transaction_status] || 0) + 1;

        if (app.transaction_status === "Completed") {
            group.payed++;
            group.totalEarnings += Number(app.fee) || 0;
        } else if (app.transaction_status === "Canceled") {
            group.canceled++;
        }

        // MULTI-DOCTOR MODE
        if (!doctorName) {
            const docName = app.doctor_name;

            if (!group.doctors[docName]) {
                group.doctors[docName] = {
                    doctor_name: docName,
                    doctor_img: doctorImages[docName] || null,
                    appointments: 0,
                    payed: 0,
                    canceled: 0,
                    earnings: 0
                };
            }

            const docStats = group.doctors[docName];

            docStats.appointments++;

            if (app.transaction_status === "Completed") {
                docStats.payed++;
                docStats.earnings += Number(app.fee) || 0;
            } else if (app.transaction_status === "Canceled") {
                docStats.canceled++;
            }
        }
    });

    const report = Object.values(grouped).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (!doctorName) {
        report.forEach(day => {
            day.totalDoctors = Object.keys(day.doctors).length;
        });
    }

    return {
        doctor: doctorName || "All Doctors",
        generatedAt: now,
        totalDays: report.length,
        report
    };
}



async function weelyreports(doctorName, month, year) {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1);

    // Base query
    let query = supabase
        .from("appointments")
        .select("doctor_name, appointment_date, transaction_status, fee")
        .lte("appointment_date", now);

    // If doctorName provided → filter by doctor
    if (doctorName) {
        query = query.eq("doctor_name", doctorName);
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    if (!appointments.length) {
        return {
            message: doctorName
                ? `No appointments found for Dr. ${doctorName}`
                : "No appointments found"
        };
    }

    // Fetch doctor images when doctorName is missing
    let doctorImages = {};
    if (!doctorName) {
        const { data: docsData, error: docErr } = await supabase
            .from("doctors")
            .select("doctor_name, image_url");

        if (docErr) throw docErr;

        docsData.forEach(d => {
            doctorImages[d.doctor_name] = d.image_url || null;
        });
    }

    const grouped = {};

    appointments.forEach(app => {
        const date = new Date(app.appointment_date);
        const appYear = getYear(date);
        const appMonth = getMonth(date);
        const fee = Number(app.fee) || 0;

        // Month/Year filter
        if (year && appYear !== year) return;
        if (month && appMonth !== month - 1) return;

        const weekNumber = getWeek(date, { weekStartsOn: 1 });
        const key = `${appYear}-W${weekNumber}`;

        if (!grouped[key]) {
            const start = startOfWeek(date, { weekStartsOn: 1 });
            const end = endOfWeek(date, { weekStartsOn: 1 });

            grouped[key] = {
                week: weekNumber,
                start: format(start, "yyyy-MM-dd"),
                end: format(end, "yyyy-MM-dd"),
                year: appYear,
                month: format(date, "MMMM"),
                appointments: 0,
                payed: 0,
                canceled: 0,
                totalEarnings: 0,
                statuses: {},

                // multi-doctor mode
                doctors: {}
            };
        }

        const group = grouped[key];

        group.appointments++;

        group.statuses[app.transaction_status] =
            (group.statuses[app.transaction_status] || 0) + 1;

        if (["Completed", "paid"].includes(app.transaction_status)) {
            group.payed++;
            group.totalEarnings += fee;
        } else if (app.transaction_status === "Canceled") {
            group.canceled++;
        }

        // MULTI-DOCTOR MODE
        if (!doctorName) {
            const docName = app.doctor_name;

            if (!group.doctors[docName]) {
                group.doctors[docName] = {
                    doctor_name: docName,
                    // appointment_date : 
                    doctor_img: doctorImages[docName] || null,
                    appointments: 0,
                    payed: 0,
                    canceled: 0,
                    earnings: 0
                };
            }

            const docStats = group.doctors[docName];

            docStats.appointments++;

            if (["Completed", "paid"].includes(app.transaction_status)) {
                docStats.payed++;
                docStats.earnings += fee;
            } else if (app.transaction_status === "Canceled") {
                docStats.canceled++;
            }
        }
    });

    const report = Object.values(grouped).sort(
        (a, b) => new Date(a.start) - new Date(b.start)
    );

    // Add totalDoctors for multi-doctor mode
    if (!doctorName) {
        report.forEach(r => {
            r.totalDoctors = Object.keys(r.doctors).length;
        });
    }

    return {
        doctor: doctorName || "All Doctors",
        generatedAt: now,
        filter: {
            month: month ? format(new Date(0, month - 1), "MMMM") : "All",
            year: year || "All",
        },
        totalWeeks: report.length,
        report
    };
}


async function mothlyreports(doctorName, month, year) {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1);

    const selectedYear = year || null;
    const selectedMonth = month ? month - 1 : null;

    // Base query
    let query = supabase
        .from("appointments")
        .select("doctor_name, appointment_date, transaction_status, fee")
        .lte("appointment_date", now);

    if (doctorName) {
        query = query.eq("doctor_name", doctorName);
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    if (!appointments.length) {
        return {
            message: doctorName
                ? `No appointments found for Dr. ${doctorName}`
                : "No appointments found"
        };
    }

    // If doctorName is NOT passed → fetch all doctors with images
    let doctorImages = {};
    if (!doctorName) {
        const { data: docsData, error: docErr } = await supabase
            .from("doctors")
            .select("doctor_name, image_url");

        if (docErr) throw docErr;

        docsData.forEach(d => {
            doctorImages[d.doctor_name] = d.image_url || null;
        });
    }

    const grouped = {};

    appointments.forEach(app => {
        const date = new Date(app.appointment_date);
        const appYear = getYear(date);
        const appMonth = getMonth(date);
        const fee = Number(app.fee) || 0;

        // Apply filters for month/year
        if (selectedYear && appYear !== selectedYear) return;
        if (selectedMonth !== null && appMonth !== selectedMonth) return;

        const key = `${appYear}-${appMonth}`;
        const monthName = format(date, "MMMM");

        if (!grouped[key]) {
            grouped[key] = {
                month: monthName,
                year: appYear,
                start: format(startOfMonth(date), "yyyy-MM-dd"),
                end: format(endOfMonth(date), "yyyy-MM-dd"),

                appointments: 0,
                payed: 0,
                canceled: 0,
                totalEarnings: 0,
                statuses: {},

                // Only used in multi-doctor mode
                doctors: {}
            };
        }

        const group = grouped[key];

        group.appointments++;

        group.statuses[app.transaction_status] =
            (group.statuses[app.transaction_status] || 0) + 1;

        if (["Completed", "paid"].includes(app.transaction_status)) {
            group.payed++;
            group.totalEarnings += fee;
        } else if (app.transaction_status === "Canceled") {
            group.canceled++;
        }

        // MULTI-DOCTOR MODE (when doctorName IS NOT given)
        if (!doctorName) {
            const docName = app.doctor_name;

            if (!group.doctors[docName]) {
                group.doctors[docName] = {
                    doctor_name: docName,
                    doctor_img: doctorImages[docName] || null, // ADD IMAGE
                    appointments: 0,
                    payed: 0,
                    canceled: 0,
                    earnings: 0
                };
            }

            const docStats = group.doctors[docName];

            docStats.appointments++;

            if (["Completed", "paid"].includes(app.transaction_status)) {
                docStats.payed++;
                docStats.earnings += fee;
            } else if (app.transaction_status === "Canceled") {
                docStats.canceled++;
            }
        }
    });

    const report = Object.values(grouped).sort(
        (a, b) => new Date(a.start) - new Date(b.start)
    );

    // Add number of doctors per month when doctorName is NOT passed
    if (!doctorName) {
        report.forEach(r => {
            r.totalDoctors = Object.keys(r.doctors).length;
        });
    }

    return {
        doctor: doctorName || "All Doctors",
        generatedAt: now,
        filter: {
            month:
                selectedMonth !== null
                    ? format(new Date(0, selectedMonth), "MMMM")
                    : "All",
            year: selectedYear || "All"
        },
        totalMonths: report.length,
        report
    };
}



async function yearlyreports(doctorName, year) {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1);

    const selectedYear = year || null;

    // Base query
    let query = supabase
        .from("appointments")
        .select("doctor_name, appointment_date, transaction_status, fee")
        .lte("appointment_date", now);

    // Filter by doctor if provided
    if (doctorName) {
        query = query.eq("doctor_name", doctorName);
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    if (!appointments.length) {
        return {
            message: doctorName
                ? `No appointments found for Dr. ${doctorName}`
                : "No appointments found"
        };
    }

    // If doctorName is not provided → fetch all doctors with images
    let doctorImages = {};
    if (!doctorName) {
        const { data: docsData, error: docErr } = await supabase
            .from("doctors")
            .select("doctor_name, image_url");

        if (docErr) throw docErr;

        docsData.forEach(d => {
            doctorImages[d.doctor_name] = d.image_url || null;
        });
    }

    const grouped = {};

    appointments.forEach(app => {
        const date = new Date(app.appointment_date);
        const appYear = getYear(date);
        const fee = Number(app.fee) || 0;

        if (selectedYear && appYear !== selectedYear) return;

        const key = `${appYear}`;

        if (!grouped[key]) {
            grouped[key] = {
                year: appYear,
                start: format(startOfYear(date), "yyyy-MM-dd"),
                end: format(endOfYear(date), "yyyy-MM-dd"),
                appointments: 0,
                payed: 0,
                canceled: 0,
                totalEarnings: 0,
                statuses: {},
                doctors: {} // multi-doctor mode
            };
        }

        const group = grouped[key];

        // Main counts
        group.appointments++;

        group.statuses[app.transaction_status] =
            (group.statuses[app.transaction_status] || 0) + 1;

        if (["Completed", "paid"].includes(app.transaction_status)) {
            group.payed++;
            group.totalEarnings += fee;
        } else if (app.transaction_status === "Canceled") {
            group.canceled++;
        }

        // MULTI-DOCTOR MODE
        if (!doctorName) {
            const docName = app.doctor_name;

            if (!group.doctors[docName]) {
                group.doctors[docName] = {
                    doctor_name: docName,
                    doctor_img: doctorImages[docName] || null, // ADD IMAGE
                    appointments: 0,
                    payed: 0,
                    canceled: 0,
                    earnings: 0
                };
            }

            const docStats = group.doctors[docName];

            docStats.appointments++;

            if (["Completed", "paid"].includes(app.transaction_status)) {
                docStats.payed++;
                docStats.earnings += fee;
            } else if (app.transaction_status === "Canceled") {
                docStats.canceled++;
            }
        }
    });

    const report = Object.values(grouped).sort((a, b) => a.year - b.year);

    // Add totalDoctors for all-doctors mode
    if (!doctorName) {
        report.forEach(r => {
            r.totalDoctors = Object.keys(r.doctors).length;
        });
    }

    return {
        doctor: doctorName || "All Doctors",
        generatedAt: now,
        filter: {
            year: selectedYear || "All",
        },
        totalYears: report.length,
        report,
    };
}


async function appointmentsByDate(doctorName, date) {
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_name", doctorName)
        .eq("appointment_date", date)
        .order("appointment_date", { ascending: true });

    if (error) throw error;
    if (!appointments.length)
        return {
            appointments: [],
        }
    return {
        appointments,
    }
}
async function appointmentsFromToday(doctorName, date) {
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_name", doctorName)
        .gte("appointment_date", date)
        .order("appointment_date", { ascending: true });

    if (error) throw error;
    if (!appointments.length)
        return {
            appointments: [],
        }
    return {
        appointments,
    }
}
async function allPatientDetailsByDoctor(doctorName) {
    if(doctorName){
    var { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_name", doctorName)
        .order("appointment_date", { ascending: false });
    }
    if(doctorName===""){
    var { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: false });
    }

    if (error) throw error;

    if (!appointments.length)
        return {
            doctor: doctorName,
            totalPatients: 0,
            patients: [],
        }

    const patientsMap = {};

    appointments.forEach((app) => {
        const email = app.patient_email;
        const number = app.patient_mobile_no
        const name = app.patient_first_name + " " + app.patient_first_name
        const age = app.patient_age
        const gender = app.patient_gender
        const id = app.userId
        if (!patientsMap[email]) {
            patientsMap[email] = {
                email,
                number,
                name,
                age,
                gender,
                id: id,
                totalAppointments: 1,
                appointments: [app],
                lastAppointmentDate: app.appointment_date,
            };
        } else {
            patientsMap[email].totalAppointments++;
            patientsMap[email].appointments.push(app);
        }
    });

    // 3️⃣ Determine active/inactive status (last visit within 1 month)
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const patients = Object.values(patientsMap).map((patient) => {
        const lastAppointment = new Date(patient.lastAppointmentDate);
        const status = lastAppointment >= oneMonthAgo ? "active" : "inactive";
        return { ...patient, status };
    });

    return {
        doctor: doctorName,
        totalPatients: patients.length,
        patients,
    }
}
async function singlePatientDetailsByDoctor(doctorName, id) {
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_name", doctorName)
        .eq("userId", id)
        .order("appointment_date", { ascending: false });

    const { data: patientDetails, error1 } = await supabase
        .from("users_view")
        .select("*")
        .eq("id", id)

    if (error) throw error;
    if (error1) throw error;

    return {
        appointments,
        patientDetails
    }
}

async function hasAppointments(doctor_email, startDate, endDate) {
    const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_name", doctor_email)
        .gte("appointment_date", startDate)
        .lte("appointment_date", endDate);

    if (error) {
        console.error("Error checking appointments:", error);
        return false;
    }

    return data && data.length > 0;
}

const leavePriority = {
    Sick: 1,
    Paternity: 2,
    Casual: 3,
    Vacation: 4,
};

async function leaverequest(doctor_id, leave_type, start_date, end_date, reason) {
    const priority = leavePriority[leave_type] || 5;
    const hasAppt = await hasAppointments(doctor_id, start_date, end_date);
    let status = "pending";
    let auto_action = null;
    let validation_message = "";
    const { data: existingLeaves, error1 } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("doctor_id", doctor_id)
        .or(
            `and(start_date.lte.${end_date},end_date.gte.${start_date})`
        );

    if (error1) {
        return { error: error.message }
    }



    // If any overlapping leave exists, decline
    if (existingLeaves && existingLeaves.length > 0) {
        return {
            message: "Please Contact admin for extra leaves.",
        }
    }
    const start = new Date(start_date);
    const end = new Date(end_date);
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // inclusive of start and end
    const { data: approvedLeaves } = await supabase
        .from('leave_requests')
        .select('start_date,end_date')
        .eq('doctor_id', doctor_id)
        .eq('leave_type', leave_type)
        .eq('status', 'approved');

    // Calculate total approved days
    let approvedDays = 0;
    approvedLeaves.forEach(lv => {
        const s = new Date(lv.start_date);
        const e = new Date(lv.end_date);
        approvedDays += Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    });

    const MAX_DAYS = 10;
    if (approvedDays + requestedDays > MAX_DAYS) {
        return {
            message: `You cannot request this leave. You already have ${approvedDays} approved ${leave_type} leave days. Maximum allowed is ${MAX_DAYS} days.`
        }
    }
    if (leave_type === "Sick") {
        const today = new Date();
        const start = new Date(start_date);

        const diffDays = Math.floor((start - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1 && diffDays >= 0) {
            // Sick leave for today or tomorrow → urgent
            status = "approved";
            auto_action = "instant_approve";
            validation_message = "Sick leave approved (urgent or short-term illness).";
        } else if (diffDays <= 3 && diffDays > 1) {
            // 2–3 days ahead → mild planning
            status = "pending";
            auto_action = "delayed_approve";
            validation_message = "Sick leave within 3 days — approval delayed 5 minutes.";
            setTimeout(async () => {
                await supabase
                    .from("leave_requests")
                    .update({ status: "approved" })
                    .eq("doctor_id", doctor_id)
                    .eq("start_date", start_date);
            }, 5 * 60 * 1000);
        } else {
            // Too far ahead → invalid sick leave
            status = "declined";
            auto_action = "decline";
            validation_message = "Declined: Sick leave cannot be requested more than 3 days in advance.";
        }

    } else if (leave_type === "Paternity") {
        if (hasAppt) {
            status = "pending";
            auto_action = "delayed_approve";
            validation_message = "Paternity leave — delayed approval due to appointments.";
            setTimeout(async () => {
                console.log("executed")
                await supabase
                    .from("leave_requests")
                    .update({ status: "approved" })
                    .eq("doctor_id", doctor_id)
                    .eq("start_date", start_date);
            }, 5000);
        } else {
            status = "approved";
            auto_action = "instant_approve";
            validation_message = "Paternity leave approved (no appointments).";
        }

    } else if (leave_type === "Casual" || leave_type === "Vacation") {
        if (hasAppt) {
            status = "declined";
            auto_action = "decline";
            validation_message = `${leave_type} leave declined — doctor has appointments.`;
        } else {
            status = "pending";
            auto_action = "delayed_approve";
            validation_message = `${leave_type} leave approved after 5 min (no appointments).`;
            setTimeout(async () => {
                await supabase
                    .from("leave_requests")
                    .update({ status: "approved" })
                    .eq("doctor_id", doctor_id)
                    .eq("start_date", start_date);
            }, 5 * 60 * 1000);
        }

    } else {
        validation_message = "Unknown leave type — manual review required.";
    }
    const { data, error } = await supabase.from("leave_requests").insert([
        {
            doctor_id,
            leave_type,
            start_date,
            end_date,
            reason,
            status,
            priority,
            has_appointments: hasAppt,
            auto_action,
            validation_message,
        },
    ]).select();

    if (error) throw error;

    return {
        message: `Leave ${status === "pending" ? "requested" : status}`,
        data,
    }
}

async function leavesummarybydoctor(doctor_id) {


    const { data, error } = await supabase
        .from('leave_summary_per_doctor')
        .select('*')
        .eq('doctor_id', doctor_id)
    if (error) throw error;

    return {
        data,
    }
}
async function leavedetailsbydoctor(doctor_id) {


    const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('doctor_id', doctor_id)
    if (error) throw error;

    return {
        data,
    }
}
async function notifications(doctor_id) {


    const { data, error } = await supabase
        .from('Notifications')
        .select('*')
        .eq('doctor_id', doctor_id)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return {
        data
    }
}

async function updatesinglenotification(id) {

    const { data, error } = await supabase
        .from('Notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select('*')
    if (error) throw error;
    return {
        data
    }
}

async function updateIsfavoriteNotifications(id, value) {

    const { data, error } = await supabase
        .from('Notifications')
        .update({ is_favourite: value })
        .eq('id', id)
        .select('*')
    if (error) throw error;
    return {
        data
    }
}
async function updateReadNotifications(id) {
    const { data, error } = await supabase
        .from('Notifications')
        .update({ is_read: true })
        .eq('doctor_id', id)
        .select('*');
    if (error) throw error;
    return {
        data
    }
}
async function allpatients(id) {
    console.log(id)
    const { data, error } = await supabase
        .from('appointments')
        .select('patient_first_name,patient_last_name,userId')
        .eq('doctor_name', id)
    if (error) throw error;
    const map = new Map();

    data.forEach(row => {
        if (!map.has(row.userId)) {
            map.set(row.userId, row);  // keep only first row per unique userId
        }
    });

    const distinctRows = Array.from(map.values());
    return {
        distinctRows
    }
}

async function dateWiseAppointmentCount(id) {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
    const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date")
        .eq("doctor_name", id)
        .gte("appointment_date", today)
        .neq("appointment_status", "Cancelled");
    if (error) throw error;
    const grouped = data.reduce((acc, row) => {
        const date = row.appointment_date.split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const result = Object.entries(grouped).map(([date, total_appointments]) => ({
        appointment_date: date,
        total_appointments
    }));
    return {
        appointments: result
    }
}

module.exports = { dateWiseAppointmentCount, allpatients, updateReadNotifications, updateIsfavoriteNotifications, updatesinglenotification, notifications, signin, leavedetailsbydoctor, leavesummarybydoctor, dailyAppointment, appointments_by_date, doctorPatientStats, earnings, dailyreports, weelyreports, mothlyreports, yearlyreports, appointmentsByDate, appointmentsFromToday, allPatientDetailsByDoctor, singlePatientDetailsByDoctor, leaverequest };