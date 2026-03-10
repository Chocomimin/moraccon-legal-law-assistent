import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const API_URL = "http://127.0.0.1:8000";

  // ------------------------------
  // Auto scroll
  // ------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ------------------------------
  // Validate token on page load
  // ------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthLoading(false);
      return;
    }

    fetch(`${API_URL}/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token invalid");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    const savedMessages = JSON.parse(localStorage.getItem("chat_messages") || "[]");
    setMessages(savedMessages);
  }, []);

  // ------------------------------
  // Save chat history
  // ------------------------------
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  // ------------------------------
  // Send message
  // ------------------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    const question = input;
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question,
          lang: "en",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const answerMessages = data.answer
          .split(/\n(?=\d+\.)/)
          .map((line) => ({
            text: line.trim(),
            sender: "bot",
          }));

        setMessages((prev) => [...prev, ...answerMessages]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: data.answer || "Server error", sender: "bot" },
        ]);
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          text: "Server error or unauthorized. Please login again.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Loading screen
  // ------------------------------
  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking login...</p>
      </div>
    );
  }

  // ------------------------------
  // Not logged in
  // ------------------------------
  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          You are not logged in. Please login to access the chat.
        </p>
      </div>
    );
  }

  // ------------------------------
  // Chat UI
  // ------------------------------
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-3xl mx-auto mt-10 border border-gray-200 rounded-2xl flex flex-col h-[80vh] overflow-hidden shadow-md">

        {/* Chat messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">

          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20">
              Start the conversation by typing a legal question below...
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-5 py-3 rounded-2xl max-w-[90%] break-words ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-gray-500 text-sm italic animate-pulse">
              AI is typing...
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="flex p-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="ml-4 px-6 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}