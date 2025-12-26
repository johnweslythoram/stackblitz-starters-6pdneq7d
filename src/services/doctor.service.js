const supabase = require("../config/supabase");

async function allDoctors() {
  const { data: allDoctors, error } = await supabase
    .from("doctors")
    .select("*");

  if (error || !allDoctors) throw new Error("No Doctors Found");

  return { allDoctors };
}

async function singleDoctor(doctorName) {
  const { data: doctorDetails, error } = await supabase
    .from("doctors")
    .select('*')
    .eq("doctor_name", doctorName)
    .single();

  if (error || !doctorDetails) throw new Error(error);

  return { doctorDetails };
}

async function doctorUpcomin(doctorName) {
  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_date, appointment_time")
    .eq("doctor_name", doctorName)
    .not('appointment_status', 'eq', 'Cancelled')
    .gte("appointment_date", now.toISOString().split("T")[0])
    .lte("appointment_date", sevenDaysLater.toISOString().split("T")[0])
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) throw error;

  const upcomingAppointments = data.filter((appt) => {
    const apptDateTime = new Date(
      `${appt.appointment_date}T${appt.appointment_time}`
    );
    return apptDateTime >= now;
  });

  const result = {};
  upcomingAppointments.forEach((appt) => {
    if (!result[appt.appointment_date]) {
      result[appt.appointment_date] = [];
    }
    result[appt.appointment_date].push(appt.appointment_time);
  });

  return { result }
}

async function checkAvailability(doctor_name, date, time) {

  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_name', doctor_name)
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .not('appointment_status', 'eq', 'Cancelled')
    .limit(1);
  if (error) throw error;

  if (data.length > 0) {
    return { available: false, message: 'Slot is already booked.' };
  } else {
    return { available: true, message: 'Slot is available.' };
  }

}

async function userappointments(id) {
  const { data: userappointments, error } = await supabase
    .from("appointments")
    .select('*')
    .eq("userId", id)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });


  if (error || !userappointments) throw new Error(error);

  return { userappointments };
}

// -- Create or replace function to mark past appointments as completed
// create or replace function mark_past_appointments()
// returns void as $$
// begin
//   -- Update appointments whose date + time have already passed
//   update appointments
//   set status = 'completed'
//   where (appointment_date + appointment_time) < now()  -- combine date + time
//     and status != 'completed';

//   -- Update related transactions as done
//   update transactions
//   set status = 'done'
//   where appointmentId in (
//     select id
//     from appointments
//     where (appointment_date + appointment_time) < now()
//   )
//   and status != 'done';
// end;
// $$ language plpgsql;

// -- Schedule it to run automatically every 5 minutes
// select cron.schedule(
//   'update-past-appointments',
//   '*/5 * * * *',  -- runs every 5 minutes
//   $$ select mark_past_appointments(); $$
// );


// create or replace function mark_past_appointments()
// returns void as $$
// begin
//   update appointments
//   set status = 'completed'
//   where date < current_date
//     and status != 'completed';

//   update transactions
//   set status = 'done'
//   where appointmentId in (
//     select id from appointments where date < current_date
//   )
//   and status != 'done';
// end;
// $$ language plpgsql;

// -- Run it daily automatically (using Supabase Scheduler)
// select cron.schedule(
//   'update-past-appointments',
//   '0 0 * * *', -- every midnight
//   $$ select mark_past_appointments(); $$
// );


async function appointmentStatus(id, appointment_Status) {

  const { data, error } = await supabase
    .from('appointments')
    .update({ appointment_status: appointment_Status, transaction_status: 'Canceled' })
    .eq('id', id)
    .select();
  if (error || !data) throw new Error(error);

  return { message: 'Appointment status updated', data };
}

async function transactionStatus(id, transaction_Status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ transaction_status: transaction_Status })
    .eq('id', id)
    .select();
  if (error || !data) throw new Error(error);
  return { message: 'Transaction status updated' };
}

async function cancelTransaction(id, transaction_status, appointment_status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      transaction_status: transaction_status,
      appointment_status: appointment_status
    })
    .eq('id', id)
    .select();
  if (error || !data) throw new Error(error);
  return { message: 'Transaction Cancelled updated' };
}

async function bookAppointment(doctor_name, doctor_email, doctor_speciality, appointment_date, appointment_time, patient_first_name, patient_last_name, patient_email, patient_mobile_no, patient_age, patient_gender, reason, category, transaction_status, appointment_status, doctor_img, userId, doctor_address, sub_category) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        doctor_name: doctor_name,
        doctor_email: doctor_email,
        doctor_speciality: doctor_speciality,
        appointment_date: appointment_date,
        appointment_time: appointment_time,
        patient_first_name: patient_first_name,
        patient_last_name: patient_last_name,
        patient_email: patient_email,
        patient_mobile_no: patient_mobile_no,
        patient_age: patient_age,
        patient_gender: patient_gender,
        reason: reason,
        category: category,
        transaction_status: transaction_status,
        appointment_status: appointment_status,
        doctor_img: doctor_img,
        userId: userId,
        doctor_address: doctor_address,
        sub_category: sub_category
      }
    ])
    .select();
  const { data: doctorDetails, error: error1 } = await supabase
    .from('doctors')
    .select('*')
    .eq('doctor_name', doctor_name);
  if(doctorDetails[0].appointmentNotifications  && doctorDetails[0].websiteNotifications){
    console.log("jj")
    const { data, error } = await supabase
    .from('Notifications')
    .insert([
      {
        doctor_id: doctorDetails[0].id,
        patient_name: patient_first_name +" " +  patient_last_name,
        appointment_date: appointment_date,
        title: "Booked Appointment on",
        is_read : false,
        is_favourite : false,
      }
    ])
    .select();
    console.log(data)
  }
  if (error || !data) throw new Error(error);
  return { message: 'Appointment Booked successfully' };
}


module.exports = { allDoctors, singleDoctor, doctorUpcomin, checkAvailability, userappointments, appointmentStatus, transactionStatus, cancelTransaction, bookAppointment };
