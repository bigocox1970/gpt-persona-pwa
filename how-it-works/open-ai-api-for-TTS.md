# ✅ OpenAI TTS Integration Instructions for Persona GPT App

## 🎯 Objective

Implement OpenAI Text-to-Speech (TTS) using the `/v1/audio/speech` API to speak AI-generated responses from personas. This should support both Web and React Native (Expo), use best practices, modular design, and allow user interruption and voice switching.

---NOTE WE ARE NOT USING EXPO

## 📦 Features to Implement

- Call OpenAI `/v1/audio/speech` endpoint
- Play resulting MP3 audio
- Support interruption (stop current audio)
- Use secure `.env` variable for the API key
- Modular code: each file under 500 lines
- Work for both Web (using HTMLAudioElement) and Expo (using `expo-av`)
- Add voice and model selection support

---

## 📁 Folder & File Structure


/lib
/tts
openaiTTS.ts # API call to OpenAI
useTTSPlayer.ts # Hook to manage audio playback

/components
PersonaChat.tsx # Uses the hook to play persona responses



---

## 🔐 .env Setup

Make sure this is in your `.env` file:


OPENAI_API_KEY=your_openai_api_key


---

## 🧠 API Call Logic — `openaiTTS.ts`

```ts
export async function fetchTTS({
  text,
  voice = "nova",
  model = "tts-1",
}: {
  text: string;
  voice?: "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy";
  model?: "tts-1" | "tts-1-hd";
}): Promise<Blob> {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: "mp3",
    }),
  });

  if (!response.ok) throw new Error("TTS generation failed");
  return await response.blob();
}


🔊 Audio Hook (Web and Expo-compatible) — useTTSPlayer.ts

import { Platform } from "react-native";
import { useRef } from "react";

// Expo/React Native
import { Audio } from "expo-av";

// Web fallback
const isWeb = Platform.OS === "web";

export function useTTSPlayer() {
  const audioRef = useRef<any>(null);

  async function playBlob(blob: Blob) {
    stop();

    if (isWeb) {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } else {
      const arrayBuffer = await blob.arrayBuffer();
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: URL.createObjectURL(blob) });
      audioRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    }
  }

  function stop() {
    if (isWeb) {
      if (audioRef.current) {
        audioRef.current.pause?.();
        audioRef.current = null;
      }
    } else {
      audioRef.current?.stopAsync?.();
      audioRef.current?.unloadAsync?.();
      audioRef.current = null;
    }
  }

  return { playBlob, stop };
}

💬 Example Usage — PersonaChat.tsx


import { fetchTTS } from "@/lib/tts/openaiTTS";
import { useTTSPlayer } from "@/lib/tts/useTTSPlayer";

const { playBlob, stop } = useTTSPlayer();

async function speakReply(text: string, voice = "nova") {
  try {
    const blob = await fetchTTS({ text, voice });
    await playBlob(blob);
  } catch (e) {
    console.error("TTS playback error:", e);
  }
}


🛡 Best Practices
🔐 NEVER hardcode your OpenAI key

🛑 Stop any current audio before starting new playback

✅ Use React hooks for reusable logic

📱 Use expo-av for mobile and Audio for web

🔄 Consider adding settings to let user choose voice

🧪 Test Checklist
Feature	Web	Expo
Generate and play audio	✅	✅
Change voices (nova, echo, etc.)	✅	✅
Stop playback mid-sentence	✅	✅
API error handling	✅	✅

📦 Expo Dependency Install

📚 OpenAI Docs
TTS Guide: https://platform.openai.com/docs/guides/text-to-speech

Voices: nova, echo, shimmer, fable, alloy, onyx

✅ Summary
This implementation will:

Use OpenAI’s /v1/audio/speech API

Work across Web and Expo

Use a modular and scalable architecture

Let personas “speak” naturally with voice control

Once this is working, you can build on it with:

Persona-specific voices

Queued audio

Local audio caching

Voice settings UI


Let me know if you want me to generate the actual `.ts` or `.tsx` files based on this.
