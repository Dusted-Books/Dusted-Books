const express = require("express");
const router = express.Router();
const bookRequestController = require("../controller/bookRequestController");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

// Customer: submit a request
router.post(
  "/book-requests",
  protect,
  authorize("customer"),
  bookRequestController.createRequest
);

// Customer: view own requests
router.get(
  "/book-requests/my",
  protect,
  authorize("customer"),
  bookRequestController.getMyRequests
);

// Admin: view all requests
router.get(
  "/book-requests",
  protect,
  authorize("admin"),
  bookRequestController.getAllRequests
);

// Admin: approve or reject a request
router.patch(
  "/book-requests/:id",
  protect,
  authorize("admin"),
  bookRequestController.updateRequest
);

module.exports = router;
