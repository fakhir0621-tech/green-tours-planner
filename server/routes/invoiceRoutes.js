const express = require("express");
const router = express.Router();

const { getInvoice } = require("../controllers/invoiceController");

router.get("/:bookingId", getInvoice);

module.exports = router;