const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect")
const userController = require("../controller/userController");


router.get("/me", protect, (req, res) => {
    res.json({
        id: req.user.id,
        role: req.user.role,
        email: req.user.email
    });
});

router.post("/users/logout", userController.logoutUser);

module.exports = router;
