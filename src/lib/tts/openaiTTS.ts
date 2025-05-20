/**
 * OpenAI Text-to-Speech API implementation
 * This file handles the API call to OpenAI's TTS service
 */

export async function fetchTTS({
  text,
  voice = "nova",
  model = "tts-1",
}: {
  text: string;
  voice?: "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy";
  model?: "tts-1" | "tts-1-hd";
}): Promise<Blob> {
  // Get the API key from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your .env file.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("OpenAI TTS API error:", errorData);
      throw new Error(`TTS generation failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Error calling OpenAI TTS API:", error);
    throw error;
  }
}
