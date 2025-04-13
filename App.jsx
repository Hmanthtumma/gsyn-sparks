// Final Merged App.jsx
import React, { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import FaceDetectMP from "./FaceDetectMP";
import HiddenCamEmotion from "./HiddenCamEmotion";
import "./App.css";

const App = () => {
  const allowedRollNumbers = ["23102A040970", "2302A040955", "23102A040965", "23102A040980"];
  const correctPassword = "Naveen@00";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [emotion, setEmotion] = useState("neutral");
  const [isMuted, setIsMuted] = useState(false);
  const chatBodyRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        const newUserMessage = { role: "user", text: speechText };
        setChatHistory((prev) => [...prev, newUserMessage, { role: "model", text: "Typing..." }]);
        generateBotResponse([...chatHistory, newUserMessage, { role: "model", text: "Typing..." }]);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Typing..."),
        { role: "model", text, isError },
      ]);
      if (!isMuted) playAudioResponse(text);
    };

    const cohereHistory = history
      .filter((msg) => msg.role === "user" || msg.role === "model")
      .slice(0, -1)
      .map((msg) => ({
        role: msg.role === "user" ? "USER" : "CHATBOT",
        message: msg.text,
      }));

    const latestUserMessage = history[history.length - 1]?.text || "";

    const requestBody = {
      model: "command-r-plus",
      chat_history: cohereHistory,
      message: latestUserMessage,
      temperature: 0.3,
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.text) {
        throw new Error(data.message || "Invalid response from Cohere API");
      }

      const adjustedResponse = adjustResponseBasedOnEmotion(data.text.trim());
      updateHistory(adjustedResponse);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  const adjustResponseBasedOnEmotion = (text) => {
    if (emotion === "sleepy") {
      return `It seems like you're feeling a bit tired 😴. Let's keep you engaged! 💪 ${text}`;
    } else if (emotion === "happy") {
      return `You're in a great mood! 😄 Let's dive deeper into this: ${text}`;
    } else if (emotion === "neutral") {
      return `${text}`;
    }
    return text;
  };

  const playAudioResponse = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    msg.pitch = 1;
    msg.rate = 1;
    window.speechSynthesis.speak(msg);
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (allowedRollNumbers.includes(username.trim()) && password === correctPassword) {
      setSuccessMsg("Login Successful!");
      setIsLoggedIn(true);
    } else {
      setErrorMsg("Invalid Roll Number or Password!");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container" id="login-container">
        <div className="title">Welcome to VidyaAI++</div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Roll Number"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
          <div id="error-message">{errorMsg}</div>
          <div id="success-message">{successMsg}</div>
        </form>
      </div>
    );
  }

  if (!showChatbot) {
    return (
      <div id="dashboard-container">
        <h2>Welcome to 5th Class Dashboard</h2>
        <div style={{ display: "flex" }}>
          <div className="sidebar">
            <h3>Class 5th</h3>
            <ul>
              <li onClick={() => setShowChatbot(true)}>Mathematics</li>
              <li onClick={() => setShowChatbot(true)}>Science</li>
              <li onClick={() => setShowChatbot(true)}>English</li>
              <li onClick={() => setShowChatbot(true)}>Social Studies</li>
              <li onClick={() => setShowChatbot(true)}>Computer Science</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <HiddenCamEmotion onEmotionDetected={setEmotion} />
      <FaceDetectMP />

      <div className="chatbot-full" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="chat-header" style={{ padding: "10px", background: "#eee" }}>
          <div className="header-info" style={{ display: "flex", alignItems: "center" }}>
            <ChatbotIcon />
            <h2 style={{ marginLeft: "10px" }}>VidyAI++ Chatbot</h2>
          </div>
        </div>

        <div ref={chatBodyRef} className="chat-body" style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">Hi 👋  <br /> I Am Your Trainer</p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage
              key={index}
              chat={chat}
              isMuted={isMuted}
              toggleMute={toggleMute}
              replayAudio={() => playAudioResponse(chat.text)}
            />
          ))}
        </div>

        <div className="chat-footer" style={{ padding: "10px", display: "flex", alignItems: "center" }}>
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
          <button
            onClick={() => recognitionRef.current?.start()}
            style={{
              marginLeft: "10px",
              padding: "8px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#ff5252",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
