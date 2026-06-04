const express = require("express");
const router = express.Router();

const {
    getAdminReport
} = require("../controllers/adminController");

router.get("/report", getAdminReport);

module.exports = router;