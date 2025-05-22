import React, { useState, useRef, useEffect } from "react";
import { usePersona } from "../../contexts/PersonaContext";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Volume2, SendHorizontal } from "lucide-react";
import { useTTS } from "../../hooks/useTTS";
import { useSTT } from "../../hooks/useSTT";
import { useAuth } from "../../contexts/AuthContext";

const ClassicChatInterface: React.FC = () => {
  const { selectedPersona } = usePersona();
  const navigate = useNavigate();
  const { getUserSettings } = useAuth();
  const userSettings = getUserSettings();
  const useOpenAI = !!userSettings?.tts?.openaiTTS;

  useEffect(() => {
    if (!selectedPersona) {
      navigate("/", { replace: true });
    }
  }, [selectedPersona, navigate]);
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [language] = useState("en-GB");

  // Use main TTS/STT hooks
  const { speak, stop, speaking } = useTTS();
  const { isListening, transcript, finalTranscript, startListening, stopListening } = useSTT({ language, useOpenAI });

  const inputRef = useRef<HTMLInputElement>(null);

  // Stream interim transcript to input, but keep final when available
  useEffect(() => {
    if (isListening) {
      if (transcript) setInput(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (finalTranscript) setInput(finalTranscript);
  }, [finalTranscript]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    setInput("");

    // Add placeholder for AI response
    setMessages((msgs) => [...msgs, { sender: "ai", text: "..." }]);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: input }
          ]
        })
      });
      if (!response.ok) {
        throw new Error("Failed to get LLM response");
      }
      const data = await response.json();
      // Extract LLM reply from OpenAI response format
      const aiText =
        (data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content) ||
        data.reply ||
        data.text ||
        data.message ||
        "AI response unavailable.";

      // Update the last AI message with the real response
      setMessages((msgs) => {
        const newMsgs = [...msgs];
        // Find the last AI message (the placeholder)
        const lastIndex = newMsgs.findIndex((msg, idx) =>
          msg.sender === "ai" && idx === newMsgs.length - 1
        );
        if (lastIndex !== -1) {
          newMsgs[lastIndex] = { sender: "ai", text: aiText };
        }
        return newMsgs;
      });

      speak(aiText);
    } catch (err) {
      setMessages((msgs) => {
        const newMsgs = [...msgs];
        // Find the last AI message (the placeholder)
        const lastIndex = newMsgs.findIndex((msg, idx) =>
          msg.sender === "ai" && idx === newMsgs.length - 1
        );
        if (lastIndex !== -1) {
          newMsgs[lastIndex] = { sender: "ai", text: "Error: Could not get LLM response." };
        }
        return newMsgs;
      });
    }
  };

  return (
    <div
      className="flex flex-col h-full relative"
      style={
        selectedPersona
          ? {
              backgroundImage: `url(${selectedPersona.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {}
      }
    >
      {/* Strong faded overlay for readability, does NOT cover header */}
      <div
        className="absolute left-0 right-0 bottom-0 z-0"
        style={{
          top: 0,
          backgroundColor: "rgba(255,255,200,0.85)",
          pointerEvents: "none",
          height: "100%",
        }}
      ></div>
      <div className="flex-1 relative z-10 overflow-y-auto">
        {messages.length === 0 && selectedPersona ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="text-xl font-bold mb-2 text-black text-center">
              Start a conversation with {selectedPersona.name}
            </div>
            <div className="text-gray-600 text-sm max-w-md mx-auto text-center">
              Ask a question or start a discussion to engage with {selectedPersona.name.split(" ")[0]}'s unique personality and knowledge.
            </div>
          </div>
        ) : (
          <div className="w-full p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span
                  className={`inline-block px-3 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-[var(--primary-color)] text-white"
                      : "bg-[var(--secondary-color)] text-[var(--text-primary)]"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-[var(--background-primary)] dark:bg-[var(--background-primary)] border-t border-[var(--secondary-color)] p-4 z-20">
        <div className="flex items-center">
          <button
            className={`p-2 rounded-full mr-2 ${
              isListening
                ? "bg-red-500 text-white"
                : "bg-[var(--secondary-color)] text-white"
            }`}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            ref={inputRef}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          {/* TTS button: only show if last message is AI */}
          {messages.length > 0 && messages[messages.length - 1].sender === "ai" && (
            <button
              className={`p-2 rounded-full ml-2 ${
                speaking
                  ? "bg-[var(--primary-color)] text-white"
                  : "bg-[var(--secondary-color)] text-white"
              }`}
              onClick={speaking ? stop : () => speak(messages[messages.length - 1].text)}
              aria-label={speaking ? "Stop speaking" : "Speak last AI message"}
            >
              <Volume2 size={20} />
            </button>
          )}
          <button
            className="p-2 rounded-full ml-2 bg-[var(--primary-color)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassicChatInterface;
