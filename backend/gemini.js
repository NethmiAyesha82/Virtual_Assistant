import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });

    const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.

CURRENT SYSTEM CONTEXT:
- Time: ${currentTime}
- Date: ${currentDate}
- Day: ${currentDay}
- Month: ${currentMonth}

You MUST return ONLY valid JSON. No explanation. No markdown formatting. No text outside the JSON block.

JSON FORMAT:
{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "calculator_open" | "instagram_open" | "facebook_open" | "weather_show" | "get_time" | "get_date" | "get_day" | "get_month" | "get_battery" | "set_timer" | "calculate",
  "userInput": "clean user command without assistant name",
  "value": "optional field (e.g. seconds for timer, math expression for calculate, city for weather)",
  "response": "A short voice-friendly reply"
}

RULES:
- Return ONLY the JSON object.
- Do not wrap it in markdown.
- Remove the assistant name from the userInput field.

TYPE MEANINGS:
- "general": Factual/informational questions.
- "google_search": Google search requests.
- "youtube_search" / "youtube_play": YouTube requests.
- "calculator_open" / "instagram_open" / "facebook_open": Open app requests.
- "weather_show": Weather requests.
- "get_time" / "get_date" / "get_day" / "get_month": Date/Time requests.
- "get_battery": If user asks for battery percentage or power status.
- "set_timer": If user asks to set a timer (e.g. extract duration in seconds into 'value').
- "calculate": If user asks a math problem (e.g. put math expression like '25*4' into 'value').

USER INPUT:
${command}
`;

    const result = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (
      !result?.data?.candidates ||
      !result.data.candidates.length ||
      !result.data.candidates[0]?.content?.parts?.length
    ) {
      console.log("Invalid Gemini response:", result.data);
      return null;
    }

    let text = result.data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, "").trim();

    return text;
  } catch (error) {
    console.log("Gemini Error:", error?.response?.data || error?.message || error);
    return null;
  }
};

export default geminiResponse;