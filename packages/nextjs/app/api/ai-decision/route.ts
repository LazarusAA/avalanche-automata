import { NextResponse } from "next/server";

// We use the fetch API as per the Gemini API instructions
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=";

export async function POST(req: Request) {
  try {
    const { prompt, data } = await req.json();

    if (!prompt || !data) {
      return NextResponse.json({ success: false, error: "Prompt and data are required" }, { status: 400 });
    }

    // System prompt as specified in the build plan
    const systemPrompt =
      "System: You are a 'true/false' logic gate. You must analyze the user's question and the provided JSON data. Respond with only the single word 'TRUE' or the single word 'FALSE'.";

    const userPrompt = `User: Here is some data: ${JSON.stringify(
      data,
    )}. Now, answer this question: ${prompt}?`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    const res = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Gemini API error: ${res.statusText} ${errorData}`);
    }

    const result = await res.json();
    const text = result.candidates[0].content.parts[0].text;

    // Clean and validate the response
    const resultText = text.trim().toUpperCase();
    if (resultText === "TRUE" || resultText === "FALSE") {
      return NextResponse.json({ success: true, result: resultText });
    } else {
      // Handle unexpected AI response
      return NextResponse.json(
        { success: false, error: "AI returned an invalid format", details: resultText },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("AI Decision API Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}