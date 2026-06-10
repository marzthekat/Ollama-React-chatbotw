import { useState } from "react";
import "./App.css";

const MODEL_NAME = "qwen2.5";

function App() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I am your local AI chatbot. Ask me something!",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [personality, setPersonality] = useState("friendly");

  function getSystemMessage() {
    return {
      role: "system",
      content: `You are a ${personality} AI assistant. Keep your answers short, clear, and easy for students to understand.`,
    };
  }

  function speak(text) {
    if (!voiceOn) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (input.trim() === "") return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/ollama/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: MODEL_NAME,

          messages: [getSystemMessage(), ...updatedMessages],

          stream: false,
        }),
      });

      const data = await response.json();

      const aiText = data.message.content;

      const aiMessage = {
        role: "assistant",
        content: aiText,
      };

      setMessages([...updatedMessages, aiMessage]);

      speak(aiText);
    } catch (error) {
      console.error("Ollama error:", error);

      const errorText =
        "Something went wrong. Make sure Ollama is running and the model is installed.";

      const errorMessage = {
        role: "assistant",
        content: errorText,
      };

      setMessages([...updatedMessages, errorMessage]);

      speak(errorText);
    }

    setLoading(false);
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. What do you want to talk about now?",
      },
    ]);

    window.speechSynthesis.cancel();
  }

  return (
    <div className="app">
      <div className="chat-container">
        <h1>Marz's Chatbot</h1>
        <p className="subtitle">Model: {MODEL_NAME}</p>

        <div className="controls">
          <button onClick={() => setVoiceOn(!voiceOn)}>
            {voiceOn ? "🔊 Voice On" : "🔇 Voice Off"}
          </button>

          <button onClick={clearChat}>Clear Chat</button>

          <select
            value={personality}
            onChange={(event) => setPersonality(event.target.value)}
          >
            <option value="friendly">Friendly</option>
            <option value="serious">Serious</option>
            <option value="sarcastic">Sarcastic</option>
            <option value="charming">Charming</option>
            <option value="New York Knicks fan">New York Knicks fan</option>
            <option value="annoying">Annoying</option>
            <option value="unique">Unique</option>
          </select>
        </div>

        <p className="personality-text">
          Current personality: {personality}
        </p>

        <div className="chat-box">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user" ? "message user" : "message assistant"
              }
            >
              <p>{message.content}</p>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <p>Thinking...</p>
            </div>
          )}
        </div>

        <form className="input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Ask the AI something..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />

          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;