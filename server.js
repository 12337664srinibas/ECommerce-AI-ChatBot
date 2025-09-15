import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load your API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// API route for chatbot
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

async function sendMessage() {
  const userMessage = document.getElementById("user-input").value;

  // Show user message
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<div class="user">You: ${userMessage}</div>`;

  // Send message to backend
  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  });

  const data = await response.json();

  // Show AI reply
  chatBox.innerHTML += `<div class="bot">AI: ${data.reply}</div>`;
  document.getElementById("user-input").value = "";
}
