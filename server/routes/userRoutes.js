const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/users/signup", userController.registerUser);
router.post("/users/login", userController.loginUser);


module.exports = router;