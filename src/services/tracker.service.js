const supabase = require("../config/supabase");
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '60m';
const secretKey = 'your-shared-secret-key';
async function login(email, password) {
    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        // .single();
        .maybeSingle();

    console.log(email, password, data)
    console.log(error, "adsdsad")
    if (error) throw new Error(error);


    if (data) {
        return { exists: true, data };
    } else {
        return { exists: false, data };
    }
}

async function newAccount(email, password) {

    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .insert([
            {
                email: email, // must be UNIQUE in DB
                password: password,
                current_step: 1
            }
        ])
        .select()

    console.log(email, password, data)
    console.log(error, "adsdsad")
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }


    if (data) {
        delete data["password"]
        return { exists: true, data };
    } else {
        return { exists: false, data };
    }
}
async function personalDetails(email, name, age, height) {

    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .update({
            name: name,
            age: age,
            height: height,
            current_step: 2
        })
        .eq('email', email)
        .select();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }


    if (data) {
        delete data["password"]
        return { exists: true, data };
    } else {
        return { exists: false, data };
    }
}
async function fitnessDetails(email, gender, weight, calories, targetWeight) {

    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .update({
            gender: gender,
            weight: weight,
            estimatedCalories: calories,
            targetWeight: targetWeight,
            current_step: 3
        })
        .eq('email', email)
        .select();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }


    if (data) {
        delete data["password"]
        return { exists: true, data };
    } else {
        return { exists: false, data };
    }
}

function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

async function set_goal(user_email, weekly_goal) {
    const { data, error } = await supabase
        .from('gym_streaks')
        .insert([
            {
                user_mail: user_email, // must be UNIQUE in DB
                weekly_goal,
                week_count: 0,
                current_streak: 0,
                week_start: getWeekStart(),
                last_workout: null,
            }
        ])
        .select()
    // .single();
    console.log(user_email, weekly_goal)
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }
    if (data) {
        return data
    }
    else {
        return { data: [] }
    }
}
function getISTDate() {
    return new Date(
        new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
        })
    );
}
async function done(email) {
    const today = getISTDate();
    const todayStr = today.toISOString().split('T')[0];

    const currentWeek = getWeekStart(todayStr);

    const { data: user, error } = await supabase
        .from('gym_streaks')
        .select('*')
        .eq('user_mail', email)
        .single();

    if (error || !user) {
        return { error: 'User streak not found' };
    }

    const lastWorkoutDate =
        user.last_workout ? user.last_workout.split('T')[0] : null;

    // 🚫 Prevent double log (FIXED)
    if (lastWorkoutDate === todayStr) {
        return { message: 'Already marked today' };
    }

    let {
        current_streak,
        week_count,
        weekly_goal,
        week_start,
        week_completed,
    } = user;

    /* 🔁 WEEK CHANGE */
    if (week_start !== currentWeek) {
        if (!week_completed) {
            current_streak = 0;
        }

        week_count = 0;
        week_completed = false;
        week_start = currentWeek;
    }

    /* 📊 WEEK COUNT */
    week_count += 1;

    if (week_count >= weekly_goal) {
        week_completed = true;
    }

    /* 🔥 STREAK ALWAYS INCREASES */
    current_streak += 1;

    /* 💾 UPDATE (FIXED) */
    const { data: updated, error: updateError } = await supabase
        .from('gym_streaks')
        .update({
            current_streak,
            week_count,
            week_completed,
            last_workout: today.toISOString(), // ✅ FIX
            week_start,
        })
        .eq('user_mail', email)
        .select();

    if (updateError) {
        console.error(updateError);
        return { error: 'Update failed' };
    }

    await supabase
        .from('streaksAllData')
        .insert([{
            user_mail: email,
            date: today.toISOString(),
        }]).select();
    return {
        message: 'Workout logged 💪',
        today_done: true,
        current_streak,
        week_count,
        weekly_goal,
        week_completed,
    };
}



async function streaksAllData(email) {
    const { data, error } = await supabase
        .from('streaksAllData')
        .select('*')
        .eq('user_mail', email)
    // console.log(user_email, weekly_goal)
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }
    if (data) {
        return { data: data }
    }
    else {
        return { data: [] }
    }
}

async function streakStatus(email) {
    const { data, error } = await supabase
        .from('gym_streaks')
        .select('current_streak,last_workout')
        .eq('user_mail', email)
        .single()
    // console.log(user_email, weekly_goal)
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }
    if (data) {
        return { data: data }
    }
    else {
        return { data: [] }
    }
}

async function allStreaks(email) {
    const { data, error } = await supabase
        .from('streaksAllData')
        .select('date')
        .eq('user_mail', email)
    // console.log(user_email, weekly_goal)
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }
    const alldates = []
    data.map(item => console.log(alldates.push(item.date)))
    console.log(alldates)
    if (data) {
        const alldates = []
        data.map(item => console.log(alldates.push(item.date)))
        return { data: alldates }
    }
    else {
        return { data: [] }
    }
}
async function getLoggedIndata(email) {
    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .select("*")
        .eq("email", email)
        .maybeSingle();
    // console.log(user_email, weekly_goal)
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    if (data) {
        delete data["password"]
        return { data: data }
    }
    else {
        return { data: [] }
    }
}

async function getWeightDetails(email) {
    const { data, error } = await supabase
        .from("WeightTracker")
        .select("*")
        .eq("user_mail", email)
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }


    if (data) {
        return { data: data }
    }
    else {
        return { data: [] }
    }
}
async function addWeight(email, weight, phase) {
    const today = getISTDate();
    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .select("weight")
        .eq("email", email)
        .single();

    console.log(data.weight, "adsdasda")
    await supabase
        .from("WeightTracker")
        .insert([
            {
                user_mail: email,
                weight: weight,
                date: today.toISOString(),
                previous_weight: data.weight,
                actual_phase: phase,
                phase: phase
            }
        ])
        .select()
    await supabase
        .from('WeightTracker')
        .update({ phase: phase })
        .eq('user_mail', email)
        .select()
    await supabase
        .from("TrackerLoginDetails")
        .update(
            {
                weight: weight,
            }
        )
        .eq("email", email)
        .select()

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return "true"
}
async function addPhase(email, weight, phase, id) {
    const today = getISTDate();
    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .select("weight")
        .eq("email", email)
        .single();
    await supabase
        .from("WeightTracker")
        .insert([
            {
                user_mail: email,
                weight: weight,
                date: today.toISOString(),
                previous_weight: data.weight,
                actual_phase: phase,
                phase: phase
            }
        ])
        .select()
    await supabase
        .from('WeightTracker')
        .update({ phase: phase })
        .eq('user_mail', email)
        .select()
    await supabase
        .from("TrackerLoginDetails")
        .update(
            {
                weight: weight,
                currentphaseName: phase
            }
        )
        .eq("email", email)
        .select()


    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return "true"
}
async function addMeasuremnets(data1) {
    const today = getISTDate();
    const { data, error } = await supabase
        .from("bodyMeasurements")
        .insert([
            {
                user_mail: data1.email,
                chest: data1.chest,
                waist: data1.waist,
                right_bicep: data1.right_bicep,
                left_bicep: data1.left_bicep,
                right_forearm: data1.right_forearm,
                left_forearm: data1.left_forearm,
                right_thigh: data1.right_thigh,
                left_thigh: data1.left_thigh,
                right_calf: data1.right_calf,
                left_calf: data1.
                    left_calf,
                date: today.toISOString(),
            }
        ])
        .select()

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return "true"
}
async function addDiet(email, diet_name, diet, is_current, protein, calories, currentDiet) {
    const { data, error } = await supabase
        .from("DietTable")
        .insert([
            {
                email: email,
                diet_name: diet_name,
                is_current: is_current,
                diet: diet,
                protien: protein,
                calories: calories
            }
        ])
        .select()
    console.log(email, diet_name, diet, is_current, protein, calories, currentDiet)
    await supabase
        .from("TrackerLoginDetails")
        .update(
            {
                currentDiet: currentDiet,
                estimatedCalories: calories,
                protien: protein
            }
        )
        .eq("email", email)
        .select()
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return "true"
}
async function addWorkout(email, workout_name, workouts) {

    const { data, error } = await supabase
        .from("workoutTable")
        .insert([
            {
                user_mail: email,
                workout_name: workout_name,
                workouts: workouts,
            }
        ])
        .select()
    console.log(data)
    await supabase
        .from("TrackerLoginDetails")
        .update(
            {
                currentWorkout: workout_name,
            }
        )
        .eq("email", email)
        .select()
    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return "true"
}


async function checkEmail(email) {
    const { data, error } = await supabase
        .from("users_emails")
        .select("email")
        .eq("email", email)
        .maybeSingle();
    if (error) throw new Error(error);
    data.map(item => console.log(item))
    if (data) {
        return { exists: true };
    } else {
        return { exists: false };
    }
}
async function getAllDiets(email) {
    const { data, error } = await supabase
        .from("DietTable")
        .select("diet_name,protien,calories,id")
        .eq("email", email);
    if (error) throw new Error(error);
    if (data) {
        return { diets: data };
    } else {
        return { diets: [] };
    }
}
async function getAllWorkouts(email) {
    const { data, error } = await supabase
        .from("workoutTable")
        .select("workout_name,id")
        .eq("user_mail", email);
    if (error) throw new Error(error);
    if (data) {
        return { diets: data };
    } else {
        return { diets: [] };
    }
}
async function getSingleDiets(email, id) {
    console.log(email,id)
    const { data, error } = await supabase
        .from("DietTable")
        .select("diet_name,diet")
        .eq("email", email)
        .eq('id', id);
    if (error) throw new Error(error);
    if (data) {
        return { diets: data };
    } else {
        return { diets: [] };
    }
}
async function getSingleWorkout(email, id) {
    const { data, error } = await supabase
        .from("workoutTable")
        .select("workouts,workout_name")
        .eq("user_mail", email)
        .eq('id', id);
    if (error) throw new Error(error);
    data.map(item => console.log(item))
    if (data) {
        return { diets: data };
    } else {
        return { diets: [] };
    }
}
async function updateWorkoutName(email, currentWorkout) {
    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .update({
            currentWorkout : currentWorkout,
        })
        .eq('email', email)
        .select();
    if (data) {
        return true;
    } else {
        return false;
    }
}
async function updateDietName(email, currentDiet) {
    const { data, error } = await supabase
        .from("TrackerLoginDetails")
        .update({
            currentDiet : currentDiet,
        })
        .eq('email', email)
        .select();
    if (data) {
        return true;
    } else {
        return false;
    }
}




module.exports = { streaksAllData,updateDietName,updateWorkoutName,getSingleWorkout, getAllWorkouts, getSingleDiets, getAllDiets, addWorkout, fitnessDetails, personalDetails, newAccount, addPhase, addDiet, addMeasuremnets, addWeight, login, checkEmail, set_goal, done, streakStatus, allStreaks, getLoggedIndata, getWeightDetails };
