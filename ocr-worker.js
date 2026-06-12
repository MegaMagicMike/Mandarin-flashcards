const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in model response.");
    return JSON.parse(match[0]);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ error: "Missing OPENAI_API_KEY worker secret." }, 500);
    }

    const body = await request.json();
    const imageDataUrl = body.imageDataUrl;
    const expectedTraditional = body.expectedTraditional || "";
    const expectedSimplified = body.expectedSimplified || expectedTraditional;
    const pinyin = body.pinyin || "";

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return jsonResponse({ error: "Missing imageDataUrl." }, 400);
    }

    const prompt = [
      "You are checking a Mandarin handwriting practice answer.",
      "The image contains a handwritten Chinese word or phrase written on a blank practice canvas.",
      "Recognize only the Chinese text the user wrote.",
      "Compare it to the expected Traditional and Simplified answers.",
      "Ignore minor stroke-style differences, but do not accept missing, extra, or different characters.",
      "Return JSON only with keys: recognized, correct, notes.",
      `Expected Traditional: ${expectedTraditional}`,
      `Expected Simplified: ${expectedSimplified}`,
      `Pinyin: ${pinyin}`
    ].join("\n");

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-5.5",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: imageDataUrl }
            ]
          }
        ],
        max_output_tokens: 200
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return jsonResponse({ error: "OpenAI request failed.", detail: errorText }, 502);
    }

    const data = await openaiResponse.json();
    const outputText = data.output_text
      || data.output?.flatMap((item) => item.content || [])
        .map((part) => part.text || "")
        .join("")
      || "";
    const result = extractJson(outputText);

    return jsonResponse({
      recognized: result.recognized || "",
      correct: Boolean(result.correct),
      notes: result.notes || ""
    });
  }
};
