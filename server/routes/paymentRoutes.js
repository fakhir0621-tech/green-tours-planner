const express = require("express");
const router = express.Router();

const {
    createPayment,
    verifyPayment
} = require("../controllers/paymentController");

router.post("/create", createPayment);
router.put("/verify/:paymentId", verifyPayment);

module.exports = router;