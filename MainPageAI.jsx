import { useEffect, useState, useRef } from "react";
import mainPageMessage from "./mainPageAIText";

const MainPageAI = ({ generateBotResponse, emotion }) => {
  const [highlightedWord, setHighlightedWord] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const messageRef = useRef(null);

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const words = text.split(" ");
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    msg.pitch = 1;
    msg.rate = 1;

    let currentIndex = 0;
    msg.onboundary = (event) => {
      if (event.name === "word") {
        setHighlightedWord(words[currentIndex]);
        currentIndex++;
      }
    };

    msg.onend = () => setHighlightedWord("");
    window.speechSynthesis.speak(msg);
  };

  const getHighlightedMessage = () => {
    return mainPageMessage.split(" ").map((word, index) => (
      <span
        key={index}
        style={{
          backgroundColor: word === highlightedWord ? "#ffff00" : "transparent",
          padding: "0 2px",
        }}
      >
        {word}{" "}
      </span>
    ));
  };

  const handleAIExplain = async () => {
    const history = [
      {
        role: "user",
        text: `${mainPageMessage} (Student emotion: ${emotion || "Neutral"})`,
      },
    ];
    const fakeSet = (responseText) => setAiResponse(responseText);
    await generateBotResponse(history, fakeSet);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2 ref={messageRef}>{getHighlightedMessage()}</h2>
      <button onClick={() => speakText(mainPageMessage)} style={buttonStyle}>
        🔊 Speak
      </button>
      <button onClick={handleAIExplain} style={buttonStyle}>
        🤖 AI Explain
      </button>
      {aiResponse && (
        <div style={{ marginTop: "20px", fontWeight: "bold" }}>{aiResponse}</div>
      )}
    </div>
  );
};

const buttonStyle = {
  margin: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "5px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

export default MainPageAI;
