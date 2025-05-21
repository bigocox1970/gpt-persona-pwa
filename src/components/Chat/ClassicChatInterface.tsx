import React, { useState, useRef, useEffect, useCallback } from "react";

// Minimal browser TTS hook
function useBrowserTTS() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice }) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    if (options?.rate) utter.rate = options.rate;
    if (options?.pitch) utter.pitch = options.pitch;
    if (options?.voice) utter.voice = options.voice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// Minimal browser STT hook
function useBrowserSTT(language: string = "en-GB") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const Recognition = (window as any).webkitSpeechRecognition;
    const rec = new Recognition();
    recognitionRef.current = rec;
    rec.lang = language;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      setTranscript(final.trim());
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

  return { isListening, transcript, startListening, stopListening };
}

const ClassicChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-GB");
  const { speak, stop, speaking } = useBrowserTTS();
  const { isListening, transcript, startListening, stopListening } = useBrowserSTT(language);
  const inputRef = useRef<HTMLInputElement>(null);

  // When transcript updates, set input
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { sender: "ai", text: "AI: " + input }]);
      speak("AI: " + input);
    }, 500);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex items-center space-x-2">
        <button
          className={`p-2 rounded-full ${isListening ? "bg-red-500 text-white" : "bg-gray-200"}`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? "Stop" : "🎤"}
        </button>
        <input
          ref={inputRef}
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type a message..."}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="p-2 rounded bg-blue-500 text-white" onClick={handleSend}>
          Send
        </button>
        <button className="p-2 rounded bg-green-500 text-white" onClick={speaking ? stop : () => speak(input)}>
          {speaking ? "Stop" : "🔊"}
        </button>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="ml-2 border rounded px-2 py-1">
          <option value="en-GB">English (UK)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
        </select>
      </div>
    </div>
  );
};

export default ClassicChatInterface;
