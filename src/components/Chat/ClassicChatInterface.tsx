import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePersona } from "../../contexts/PersonaContext";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Volume2, SendHorizontal } from "lucide-react";
import { useTTS } from "../../hooks/useTTS";

// Removed useBrowserTTS - now using useTTS for TTS functionality.

// Minimal browser STT hook
function useBrowserSTT(language: string = "en-GB") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const Recognition = (window as any).webkitSpeechRecognition;
    const rec = new Recognition();
    recognitionRef.current = rec;
    rec.lang = language;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece;
        } else {
          interim += transcriptPiece;
        }
      }
      setTranscript(interim);
      if (final) setFinalTranscript(final.trim());
    };
    rec.start();
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => stopListening();
    // eslint-disable-next-line
  }, []);

  return { isListening, transcript, finalTranscript, startListening, stopListening };
}

const ClassicChatInterface: React.FC = () => {
  const { selectedPersona } = usePersona();
  const navigate = useNavigate();
  console.log("[ClassicChat] selectedPersona:", selectedPersona);

  useEffect(() => {
    if (!selectedPersona) {
      navigate("/", { replace: true });
    }
  }, [selectedPersona, navigate]);
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-GB");
  // useTTS supports both browser and OpenAI TTS, depending on user settings
  const { speak, stop, speaking } = useTTS();
  const { isListening, transcript, finalTranscript, startListening, stopListening } = useBrowserSTT(language);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stream interim transcript to input, but keep final when available
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (isListening && finalTranscript) {
      setInput(finalTranscript);
    }
  }, [finalTranscript, isListening]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    // Simulate streaming AI response
    const aiText = "AI: " + input;
    setTimeout(() => {
      let i = 0;
      const words = aiText.split(" ");
      setMessages((msgs) => [...msgs, { sender: "ai", text: "" }]);
      function stream() {
        setMessages((msgs) => {
          const newMsgs = [...msgs];
          newMsgs[newMsgs.length - 1] = {
            sender: "ai",
            text: words.slice(0, i + 1).join(" "),
          };
          return newMsgs;
        });
        i++;
        if (i < words.length) {
          setTimeout(stream, 80);
        } else {
          speak(aiText);
        }
      }
      stream();
    }, 500);
    setInput("");
    // Clear STT transcripts after sending to avoid overwriting user input
    // @ts-ignore
    if (typeof setTranscript === "function") setTranscript("");
    // @ts-ignore
    if (typeof setFinalTranscript === "function") setFinalTranscript("");
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
      <div className="flex-1 relative z-10">
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
                <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-[var(--background-primary)] dark:bg-[var(--background-primary)] border-t border-[var(--secondary-color)] p-4 relative z-10">
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
