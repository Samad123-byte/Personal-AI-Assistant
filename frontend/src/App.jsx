import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const starterMessage = {
  role: "assistant",
  content: "Hey — I’m ready. What would you like to work on today?",
};

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75 14.2 9.8 21.25 12l-7.05 2.2L12 21.25 9.8 14.2 2.75 12 9.8 9.8 12 2.75Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.25 12h14.5M13 6.25 18.75 12 13 17.75" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 8.25V4.5m0 0h-3.75M19 4.5l-3.1 3.1A7.5 7.5 0 1 0 19.3 13" />
    </svg>
  );
}

function App() {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);

  const endOfMessagesRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const resizeTextarea = (element) => {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 132)}px`;
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    resizeTextarea(event.target);
  };

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || isThinking) return;

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setInput("");
    setIsThinking(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          sessionId: "user-1",
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply || "I received your message, but no reply was returned.",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant service. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([starterMessage]);
    setInput("");
    setIsThinking(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  return (
    <div className="app-shell">
      <div className="retro-orb retro-orb-one" />
      <div className="retro-orb retro-orb-two" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <SparkIcon />
          </div>
          <div className="brand-copy">
            <strong>MY ASSISTANT</strong>
            <span>PERSONAL AI</span>
          </div>
        </div>

        <button className="new-chat-button" onClick={handleNewChat} type="button">
          <RefreshIcon />
          <span>New chat</span>
        </button>
      </header>

      <main className="chat-layout">
        <section className="chat-panel" aria-label="AI assistant chat">
          <div className="conversation-header">
            <div className="eyebrow">
              <span className="status-dot" />
              AI ONLINE · READY WHEN YOU ARE
            </div>
            <h1>Personal AI Assistant</h1>
            <p>Work, research, planning and ideas — all in one conversation.</p>
          </div>

          <section className="messages" aria-live="polite">
            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`message-row ${isUser ? "user-row" : "assistant-row"}`}
                >
                  {!isUser && (
                    <div className="message-avatar assistant-avatar" aria-hidden="true">
                      <SparkIcon />
                    </div>
                  )}

                  <div
                    className={isUser ? "user-message" : "assistant-message"}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {isUser && (
                    <div className="message-avatar user-avatar" aria-hidden="true">
                      YOU
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="message-row assistant-row thinking-row">
                <div className="message-avatar assistant-avatar" aria-hidden="true">
                  <SparkIcon />
                </div>

                <div className="thinking-message" role="status" aria-label="Assistant is thinking">
                  <span className="thinking-label">Thinking</span>
                  <span className="thinking-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} />
          </section>

          <div className="composer-wrap">
            <div className="composer">
              <textarea
                ref={textareaRef}
                rows="1"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                aria-label="Message your assistant"
                disabled={isThinking}
              />

              <button
                className="send-button"
                onClick={handleSend}
                type="button"
                disabled={!input.trim() || isThinking}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>

            <div className="composer-meta">
              <span>Enter to send</span>
              <span className="meta-divider">•</span>
              <span>Shift + Enter for a new line</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
