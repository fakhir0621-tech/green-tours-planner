const express = require("express");
const router = express.Router();

const { chatbotReply } = require("../controllers/chatController");

router.post("/", chatbotReply);

module.exports = router;