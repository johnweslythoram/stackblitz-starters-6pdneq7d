const authService = require("../services/auth.service");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  }
  catch (error) {
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

async function test(req, res) {
  const result = await authService.test();
  res.send(result); // ✅ send response back
}


async function checkUsername(req, res) {

  try {
    const { username } = req.body;

    const result = await authService.checkUsername(username);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function checkPhonenumber(req, res) {

  try {
    const { phonenumber } = req.body;

    const result = await authService.checkPhonenumber(phonenumber);
    res.status(200).json(result);

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function checkEmail(req, res) {

  try {
    const { email } = req.body;

    const result = await authService.checkEmail(email);
    res.status(200).json(result);

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function getUserDetails(req, res) {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        userId: user.user_id,
        email: user.email,
        userName: user.username,
        phonenumber: user.phonenumber
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getPersonalDetails(req, res) {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        userId: user.user_id,
        email: user.email,
        userName: user.username,
        phonenumber: user.phonenumber,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        age: user.age,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getLoggedInUser(req, res) {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        email: user.email,
        userName: user.username,
        theme: user.theme
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateMetadata(req, res) {
  try {
    const { userId, metadata } = req.body;
    const result = await authService.updateMetadata(userId, metadata);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function resetPassword(req, res) {
  try {
    const { access_token, new_password, refresh_token } = req.body;
    const result = await authService.resetPassword(access_token, new_password, refresh_token);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = { login, test, signUp, checkUsername, checkPhonenumber, checkEmail, getUserDetails, updateMetadata, getLoggedInUser, forgotPassword, resetPassword, getPersonalDetails };
