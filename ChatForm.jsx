import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    // Clear input and focus again
    inputRef.current.value = "";
    inputRef.current.focus();

    // Update chat with user message
    const updatedHistory = [...chatHistory, { role: "user", text: userMessage }];
    setChatHistory(updatedHistory);

    // Show "Typing..." message before bot responds
    setTimeout(() => {
      const historyWithTyping = [...updatedHistory, { role: "model", text: "Typing..." }];
      setChatHistory(historyWithTyping);

      // Send user input as-is (or add prompt engineering here)
      generateBotResponse([
        ...chatHistory,
        { role: "user", text: `Using the details provided above, please address this query: ${userMessage}` }
    ]);
}, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleFormSubmit(e);
    }
  };

  return (
    <form className="chat-form" onSubmit={handleFormSubmit} style={{ flex: 1, display: "flex" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        onKeyDown={handleKeyDown}
        required
        style={{
          flex: 1,
          padding: "10px",
          fontSize: "14px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        type="submit"
        className="material-symbols-rounded"
        style={{
          marginLeft: "8px",
          padding: "10px",
          fontSize: "18px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        arrow_upward
      </button>
    </form>
  );
};

export default ChatForm;
