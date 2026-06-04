const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatbotReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // safe model
      messages: [
        {
          role: "system",
          content:
            "You are a helpful travel assistant for Green Tours Planner. Suggest tours, locations, prices, and travel tips in Pakistan.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion?.choices?.[0]?.message?.content || "No response from AI";

    res.json({ reply });
  } catch (error) {
    console.error("OPENAI ERROR FULL:", error);

    res.status(500).json({
      reply: "AI server error ❌",
    });
  }
};
console.log("API KEY:", process.env.OPENAI_API_KEY);
module.exports = { chatbotReply };