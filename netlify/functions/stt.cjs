// netlify/functions/stt.cjs
const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    // Parse multipart/form-data (audio upload)
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return {
        statusCode: 400,
        body: "Expected multipart/form-data"
      };
    }

    // Use busboy to parse the multipart form
    const busboy = require("busboy");
    const bb = busboy({ headers: event.headers });
    let audioBuffer = Buffer.alloc(0);
    let audioFilename = "audio.webm";
    let audioMimetype = "audio/webm";

    await new Promise((resolve, reject) => {
      bb.on("file", (fieldname, file, info) => {
        audioFilename = info.filename || "audio.webm";
        audioMimetype = info.mimeType || "audio/webm";
        file.on("data", (data) => {
          audioBuffer = Buffer.concat([audioBuffer, data]);
        });
        file.on("end", () => {});
      });
      bb.on("finish", () => {
        console.log("[stt.cjs] Finished parsing file. Size:", audioBuffer.length, "filename:", audioFilename, "mimetype:", audioMimetype);
        resolve();
      });
      bb.on("error", (err) => {
        console.error("[stt.cjs] Busboy error:", err);
        reject(err);
      });
      bb.end(Buffer.from(event.body, "base64"));
    });

    if (!audioBuffer.length) {
      console.error("[stt.cjs] No audio file uploaded");
      return {
        statusCode: 400,
        body: "No audio file uploaded"
      };
    }

    // Prepare form data for OpenAI Whisper API
    const form = new FormData();
    form.append("file", audioBuffer, {
      filename: audioFilename,
      contentType: audioMimetype
    });
    form.append("model", "whisper-1");
    form.append("response_format", "json");
    form.append("language", "en"); // Optionally make this dynamic

    // Call OpenAI Whisper API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error("[stt.cjs] OpenAI API key not configured");
      return {
        statusCode: 500,
        body: "OpenAI API key not configured"
      };
    }

    console.log("[stt.cjs] Sending audio to OpenAI Whisper. Size:", audioBuffer.length, "filename:", audioFilename, "mimetype:", audioMimetype);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[stt.cjs] OpenAI Whisper error:", errorText);
      return {
        statusCode: response.status,
        body: `OpenAI Whisper error: ${errorText}`
      };
    }

    const data = await response.json();
    console.log("[stt.cjs] OpenAI Whisper transcript:", data.text);
    return {
      statusCode: 200,
      body: JSON.stringify({ transcript: data.text || "" })
    };
  } catch (err) {
    console.error("[stt.cjs] Server error:", err);
    return {
      statusCode: 500,
      body: "Server error: " + (err && err.message ? err.message : String(err))
    };
  }
};
