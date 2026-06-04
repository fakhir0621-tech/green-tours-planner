import { useState } from "react";
import API from "../services/api";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 How can I help you?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    // Add user message
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await API.post("/chatbot", { message: input });

      const botMessage = {
        sender: "bot",
        text: res.data.reply || "No response"
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error getting response ❌" }
      ]);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-primary text-white p-3 font-bold">
        AI Assistant 🤖
      </div>

      {/* Messages */}
      <div className="p-3 h-64 overflow-y-auto flex flex-col gap-2 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-[75%] ${
              msg.sender === "user"
                ? "bg-green-500 text-white self-end"
                : "bg-gray-200 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-grow p-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default Chatbot;