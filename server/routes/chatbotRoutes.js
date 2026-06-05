const express = require("express");
const router = express.Router();

const {
  chatbotReply,
  getKnowledgeBase,
  updateKnowledgeBase,
  addKBItem,
  deleteKBItem,
  updateKBItem,
} = require("../controllers/chatController");

// ---- CHAT ----
router.post("/", chatbotReply);

// ---- KNOWLEDGE BASE (admin) ----
router.get("/kb", getKnowledgeBase);
router.put("/kb", updateKnowledgeBase);
router.post("/kb", addKBItem);
router.delete("/kb/:index", deleteKBItem);
router.put("/kb/:index", updateKBItem);

module.exports = router;