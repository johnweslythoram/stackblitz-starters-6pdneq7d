const authService = require("../services/tracker.service");

async function login(req, res) {
  console.log("affas")
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return res
          .status(403)
          .json({ error: "Please confirm your email before logging in." });
      }
      return res.status(400).json({ error: error.message });
    }
  }


}
async function newAccount(req, res) {
  console.log("affas")
  try {
    const { email, password } = req.body;
    const result = await authService.newAccount(email, password);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return res
          .status(403)
          .json({ error: "Please confirm your email before logging in." });
      }
      return res.status(400).json({ error: error.message });
    }
  }


}
async function personalDetails(req, res) {
  console.log("affas")
  try {
    const { email, name, age, height } = req.body;
    const result = await authService.personalDetails(email, name, age, height);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return res
          .status(403)
          .json({ error: "Please confirm your email before logging in." });
      }
      return res.status(400).json({ error: error.message });
    }
  }


}
async function fitnessDetails(req, res) {
  console.log("affas")
  try {
    const { email, gender, weight, calories, targetWeight } = req.body;
    const result = await authService.fitnessDetails(email, gender, weight, calories, targetWeight);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return res
          .status(403)
          .json({ error: "Please confirm your email before logging in." });
      }
      return res.status(400).json({ error: error.message });
    }
  }


}

async function set_goal(req, res) {
  try {
    const { user_email, weekly_goal } = req.body;
    const result = await authService.set_goal(user_email, weekly_goal);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function done(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.done(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function streakStatus(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.streakStatus(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function allStreaks(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.allStreaks(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function getWeightDetails(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.getWeightDetails(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function addPhase(req, res) {
  try {
    const { email, weight, phase } = req.body;
    const result = await authService.addPhase(email, weight, phase);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function addWeight(req, res) {
  try {
    const { email, weight, phase } = req.body;
    const result = await authService.addWeight(email, weight, phase);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function addMeasuremnets(req, res) {
  try {
    const { data } = req.body;
    const result = await authService.addMeasuremnets(data);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function addDiet(req, res) {
  try {
    const { email, diet_name, diet, is_current, protein, calories, currentDiet } = req.body;
    const result = await authService.addDiet(email, diet_name, diet, is_current, protein, calories, currentDiet);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function addWorkout(req, res) {
  try {
    const { email, workout_name, workouts } = req.body;
    const result = await authService.addWorkout(email, workout_name, workouts);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function getAllDiets(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.getAllDiets(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function getAllWorkouts(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.getAllWorkouts(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function getSingleDiets(req, res) {
  try {
    const { email, id } = req.body;
    const result = await authService.getSingleDiets(email, id);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function getSingleWorkout(req, res) {
  try {
    const { email, id } = req.body;
    const result = await authService.getSingleWorkout(email, id);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function updateWorkoutName(req, res) {
  try {
    const { email, currentWorkout } = req.body;
    const result = await authService.updateWorkoutName(email, currentWorkout);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function updateDietName(req, res) {
  try {
    const { email, currentDiet } = req.body;
    const result = await authService.updateDietName(email, currentDiet);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}
async function streaksAllData(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.streaksAllData(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}



async function signUp(req, res) {
  try {
    const { email, password, firstName, lastName, DOB, mobileNumber, type, twoStepVerification, age, gender, userName } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    const result = await authService.signUp(email, password, firstName, lastName, DOB, mobileNumber, type, twoStepVerification, age, gender, userName);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
async function getLoggedIndata(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.getLoggedIndata(email);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error)
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }


}


module.exports = { streaksAllData,updateDietName,updateWorkoutName, getSingleWorkout, getAllWorkouts, getSingleDiets, getAllDiets, addWorkout, fitnessDetails, personalDetails, newAccount, addPhase, addDiet, addMeasuremnets, addWeight, getWeightDetails, login, signUp, set_goal, done, streakStatus, allStreaks, getLoggedIndata };









