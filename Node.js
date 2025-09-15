// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// Example for Qwen / DeepSeek / OpenAI style APIs
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`, // put your provider key in .env
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat", // or Qwen’s model name
        messages: messages,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed");
  }
});

app.listen(3001, () => console.log("Proxy running on http://localhost:3001"));
