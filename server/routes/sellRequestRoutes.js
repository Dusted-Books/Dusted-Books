const express = require("express");
const router = express.Router();
const sellRequestController = require("../controller/sellRequestController");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");

// Customer: submit a sell request (with photo uploads, one per book)
router.post(
  "/sell-requests",
  protect,
  authorize("customer"),
  upload.array("photos", 20),
  sellRequestController.createSellRequest
);

// Customer: view own sell requests
router.get(
  "/sell-requests/my",
  protect,
  authorize("customer"),
  sellRequestController.getMySellRequests
);

// Admin: view all sell requests
router.get(
  "/sell-requests",
  protect,
  authorize("admin"),
  sellRequestController.getAllSellRequests
);

// Admin: update sell request status
router.patch(
  "/sell-requests/:id",
  protect,
  authorize("admin"),
  sellRequestController.updateSellRequestStatus
);

module.exports = router;
