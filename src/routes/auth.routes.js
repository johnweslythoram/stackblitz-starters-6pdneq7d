const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middlewares/tokenAuthentication");
router.post("/login", authController.login);
router.get("/test", authController.test);
router.post("/signUp", authController.signUp);
router.post("/checkUsername", authController.checkUsername);
router.post("/checkPhonenumber", authController.checkPhonenumber);
router.post("/checkEmail", authController.checkEmail);
router.get("/getUserDetails", authenticateToken, authController.getUserDetails);
router.get("/getLoggedInUser", authenticateToken, authController.getLoggedInUser);
router.get("/getPersonalDetails", authenticateToken,authController.getPersonalDetails); 
router.post("/updateMetadata", authController.updateMetadata);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
