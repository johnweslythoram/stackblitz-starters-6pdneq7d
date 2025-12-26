const supabase = require("../config/supabase");
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '60m'; 
const secretKey = 'your-shared-secret-key';
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
function encryptEmail(email) {
  return CryptoJS.AES.encrypt(email, secretKey).toString();
}
async function login(email, password) {
  const rawPassword = decryptPassword(password);
  //console.log(rawPassword)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: rawPassword,
  });

  if (error) throw new Error(error);
  const user = data.user;
  const username = user.user_metadata?.username;
  const type = user.user_metadata?.type;
  const is2FAEnable = user.user_metadata?.twoStepVerification;
  const details = user.user_metadata?.firstName ? true : false;
  const phonenumber = user.user_metadata?.mobileNumber
  const firstName = user.user_metadata?.firstName
  const lastName = user.user_metadata?.lastName
  const DOB = user.user_metadata?.DOB
  const theme = user.user_metadata?.theme
  const gender = user.user_metadata?.gender
  const age = user.user_metadata?.age
  const payload = {
    user_id: user.id,
    email: user.email,
    username: username,
    phonenumber: phonenumber,
    firstName: firstName,
    lastName: lastName,
    DOB: DOB,
    theme: theme,
    gender: gender,
    age:age,
  };
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return {
    message: "Login successful", user: {
      type: type,
      is2FAEnable: is2FAEnable,
      details : details
    },
    token: token,
  };
}

async function signUp(email, password, firstName, lastName, DOB, mobileNumber, type, twoStepVerification, age, gender, userName) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        type: type,
        twoStepVerification: twoStepVerification,
        firstName: firstName,
        lastName: lastName,
        DOB: DOB,
        mobileNumber: mobileNumber,
        age: age,
        gender: gender,
        username: userName,
      },
    },
  });

  if (error) throw new Error(error);

  return { user, "message": "Signup successful! Please check your email to confirm your account." }
}

async function test() {
  return "text"
}

async function checkUsername(username) {
  const { data, error } = await supabase
    .from("users_emails")
    .select("email")
    .eq("username", username)
    .maybeSingle();
  if (error) throw new Error(error);

  if (data) {
    return { exists: true, data };
  } else {
    return { exists: false, data };
  }
}

async function checkPhonenumber(phonenumber) {
  const { data, error } = await supabase
    .from("users_emails")
    .select("email")
    .eq("mobilenumber", phonenumber)
    .maybeSingle();
  if (error) throw new Error(error);

  if (data) {
    return { exists: true, data };
  } else {
    return { exists: false, data };
  }
}

async function checkEmail(email) {
  const { data, error } = await supabase
    .from("users_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error);

  if (data) {
    return { exists: true };
  } else {
    return { exists: false };
  }
}

async function updateMetadata(userId, metadata) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });
  if (error) throw new Error(error);

  return { success: true };
}

async function forgotPassword(email) {
  const encrypted = encodeURIComponent(encryptEmail(email));
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `http://localhost:5173/reset-password?dm=${encrypted}`,
  });
  if (error) throw new Error(error);
  return { message: "Password reset email sent!" };
}

async function resetPassword(access_token, new_password, refresh_token) {
  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (sessionError) {
    return { message: "Session Expired" };
  }
  const { data, error } = await supabase.auth.updateUser({ password: new_password });
  console.log("hihih")
  if (data?.user?.id) {
    await supabase.auth.signOut();
    return { message: "Password updated successfully!" };
  }
  if (error.message === "New password should be different from the old password.") {
      return { message: "New password should be different from the old password." };
    }

  if (error) throw new Error(error);
  return { message: "Password updated successfully!" };
}




module.exports = { login, test, signUp, checkUsername, checkPhonenumber, checkEmail, updateMetadata, forgotPassword, resetPassword };
