const Groq = require("groq-sdk");
const Tour = require("../models/Tour");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---- KNOWLEDGE BASE (in-memory, synced from DB or admin updates) ----
let knowledgeBase = [
  {
    q: "What payment methods do you accept?",
    a: "We accept EasyPaisa (03472058810), JazzCash (03165252847), and Allied Bank transfer (IBAN: PK36ABPA0010045678901234). After payment, upload your screenshot to confirm booking.",
  },
  {
    q: "How do I book a tour?",
    a: "Browse our tours, click 'Book Now', select your travel date and number of guests, choose a payment method, send payment, upload your screenshot, and submit. Admin verifies within 2-4 hours.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Free cancellation up to 7 days before departure. After that a 20% fee applies.",
  },
  {
    q: "Where is Green Tours Planner located?",
    a: "We are based in H-10 Sector, Islamabad, Pakistan. Contact us at 03165252847 or greentoursplanner@gmail.com.",
  },
  {
    q: "Do you offer group discounts?",
    a: "Yes! Groups of 8 or more receive a 15% discount. Contact us directly to arrange group bookings.",
  },
  {
    q: "How long does booking confirmation take?",
    a: "After you submit your payment screenshot, admin verifies within 2-4 hours and your booking status changes to Confirmed.",
  },
];

// Admin can update KB via this exported array
const getKB = () => knowledgeBase;
const setKB = (newKB) => { knowledgeBase = newKB; };
const addKBEntry = (entry) => { knowledgeBase.push(entry); };
const deleteKBEntry = (index) => { knowledgeBase.splice(index, 1); };
const updateKBEntry = (index, entry) => { knowledgeBase[index] = entry; };

const chatbotReply = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please type a message." });
    }

    // ---- Fetch real tours from DB ----
    let toursContext = "";
    try {
      const tours = await Tour.find({}, "tourName location price duration category availableSeats description").limit(20);
      if (tours.length > 0) {
        toursContext = "\n\nCURRENT AVAILABLE TOURS:\n" + tours.map(t =>
          `- ${t.tourName} | Location: ${t.location} | Price: Rs. ${t.price} | Duration: ${t.duration} | Category: ${t.category} | Seats: ${t.availableSeats}`
        ).join("\n");
      }
    } catch {}

    // ---- Build KB context ----
    const kbContext = knowledgeBase.length > 0
      ? "\n\nKNOWLEDGE BASE (use these to answer FAQs accurately):\n" +
        knowledgeBase.map((k, i) => `Q${i + 1}: ${k.q}\nA${i + 1}: ${k.a}`).join("\n\n")
      : "";

    // ---- System prompt ----
    const systemPrompt = `You are a professional, friendly travel assistant chatbot for Green Tours Planner — a tour booking website based in Islamabad, Pakistan.

Your job is to:
1. Answer questions about the website, tours, booking process, payments, and policies
2. Suggest tours based on user preferences (ask about their interests, budget, duration)
3. Help users understand how to book, pay, and get confirmation
4. Be warm, helpful, and professional at all times
5. Only answer questions related to Green Tours Planner and travel in Pakistan/internationally offered tours
6. If someone asks something unrelated to travel or the website, politely redirect them

BUSINESS DETAILS:
- Name: Green Tours Planner
- Location: H-10 Sector, Islamabad, Pakistan
- Phone: 03165252847
- Email: greentoursplanner@gmail.com
- Payment: EasyPaisa (03472058810), JazzCash (03165252847), Allied Bank
- Booking confirmation: 2-4 hours after payment verification
- Cancellation: Free up to 7 days before departure
${toursContext}
${kbContext}

Keep responses concise (2-4 sentences max unless listing tours). Use a friendly tone. When suggesting tours, mention name, location, price, and duration.`;

    // ---- Build message history for context ----
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message.trim() },
    ];

    // ---- Call Groq Llama 3 ----
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim()
      || "I'm sorry, I couldn't process that. Please try again.";

    res.json({ reply });

  } catch (error) {
    console.error("Chatbot error:", error?.message || error);
    res.status(500).json({
      reply: "I'm having trouble connecting right now. Please try again in a moment or contact us at 03165252847.",
    });
  }
};

// ---- KB MANAGEMENT ENDPOINTS ----
const getKnowledgeBase = (req, res) => {
  res.json({ kb: knowledgeBase });
};

const updateKnowledgeBase = (req, res) => {
  const { kb } = req.body;
  if (!Array.isArray(kb)) {
    return res.status(400).json({ message: "KB must be an array." });
  }
  setKB(kb);
  res.json({ message: "Knowledge base updated.", kb: knowledgeBase });
};

const addKBItem = (req, res) => {
  const { q, a } = req.body;
  if (!q || !a) return res.status(400).json({ message: "Question and answer required." });
  addKBEntry({ q: q.trim(), a: a.trim() });
  res.json({ message: "Entry added.", kb: knowledgeBase });
};

const deleteKBItem = (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= knowledgeBase.length) {
    return res.status(400).json({ message: "Invalid index." });
  }
  deleteKBEntry(index);
  res.json({ message: "Entry deleted.", kb: knowledgeBase });
};

const updateKBItem = (req, res) => {
  const index = parseInt(req.params.index);
  const { q, a } = req.body;
  if (isNaN(index) || index < 0 || index >= knowledgeBase.length) {
    return res.status(400).json({ message: "Invalid index." });
  }
  if (!q || !a) return res.status(400).json({ message: "Question and answer required." });
  updateKBEntry(index, { q: q.trim(), a: a.trim() });
  res.json({ message: "Entry updated.", kb: knowledgeBase });
};

module.exports = {
  chatbotReply,
  getKnowledgeBase,
  updateKnowledgeBase,
  addKBItem,
  deleteKBItem,
  updateKBItem,
};