import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat, isMuted, toggleMute, replayAudio }) => {
  const isBot = chat.role === "model";

  return (
    <div
      className={`message ${isBot ? "bot-message" : "user-message"}`}
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        marginBottom: "12px",
        padding: "4px 10px",
      }}
    >
      {/* Bot message */}
      {isBot && (
        <>
          <div style={{ marginRight: "10px" }}>
            <ChatbotIcon />
          </div>
          <div
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "10px",
              maxWidth: "70%",
              position: "relative",
            }}
          >
            <p style={{ margin: 0 }}>{chat.text}</p>

            {/* Controls below the message */}
            <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
              <button
                onClick={toggleMute}
                style={{
                  fontSize: "12px",
                  padding: "4px 6px",
                  backgroundColor: isMuted ? "#ff4d4d" : "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={replayAudio}
                disabled={isMuted}
                style={{
                  fontSize: "12px",
                  padding: "4px 6px",
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  opacity: isMuted ? 0.6 : 1,
                  cursor: isMuted ? "not-allowed" : "pointer",
                }}
              >
                Replay 🔊
              </button>
            </div>
          </div>
        </>
      )}

      {/* User message */}
      {!isBot && (
        <div
          style={{
            backgroundColor: "#d1f7c4",
            padding: "10px",
            borderRadius: "10px",
            maxWidth: "70%",
            textAlign: "right",
          }}
        >
          <p style={{ margin: 0 }}>{chat.text}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
