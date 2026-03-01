// Central AI router for Schipfie's Choice
// Routes to free models for parsing, Claude for creative tasks
// Falls back to Claude if free model output fails validation

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Model config by task type
const MODELS = {
  parse: {
    primary: "meta-llama/llama-3.3-70b-instruct:free",
    fallback: "anthropic/claude-haiku-4-5"
  },
  creative: {
    primary: "anthropic/claude-haiku-4-5",
    fallback: null
  }
};

// Required fields per task for validation
const REQUIRED_FIELDS = {
  parse: ["title", "zutaten", "zubereitung"],
  creative: ["title", "ingredients", "steps"]
};

async function callOpenRouter(apiKey, model, prompt, maxTokens = 2000) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://schipfies-choice.netlify.app",
      "X-Title": "Schipfies Choice"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function parseJSON(raw) {
  // Strip markdown fences
  let cleaned = raw.replace(/^```json\s*\n?/, "").replace(/\n?```$/, "").trim();
  // Try to extract JSON object if there's extra text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  return JSON.parse(cleaned);
}

function validateRecipe(recipe, taskType) {
  const required = REQUIRED_FIELDS[taskType] || [];
  for (const field of required) {
    if (!recipe[field] || (typeof recipe[field] === "string" && recipe[field].trim().length < 3)) {
      return false;
    }
  }
  // For parse: check zutaten has linebreaks (multiple ingredients)
  if (taskType === "parse" && recipe.zutaten && !recipe.zutaten.includes("\n") && recipe.zutaten.length > 50) {
    return false; // Probably malformed
  }
  return true;
}

export async function aiCall(taskType, prompt, maxTokens = 2000) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY nicht konfiguriert");

  const config = MODELS[taskType] || MODELS.creative;
  let rawText, recipe, usedModel;

  // Try primary model
  try {
    rawText = await callOpenRouter(apiKey, config.primary, prompt, maxTokens);
    recipe = parseJSON(rawText);
    usedModel = config.primary;

    if (!validateRecipe(recipe, taskType)) {
      throw new Error("Validierung fehlgeschlagen");
    }
  } catch (primaryErr) {
    // Fallback to Claude if available
    if (config.fallback) {
      try {
        rawText = await callOpenRouter(apiKey, config.fallback, prompt, maxTokens);
        recipe = parseJSON(rawText);
        usedModel = config.fallback + " (fallback)";

        if (!validateRecipe(recipe, taskType)) {
          throw new Error("Auch Fallback-Validierung fehlgeschlagen");
        }
      } catch (fallbackErr) {
        throw new Error(`Primary: ${primaryErr.message} | Fallback: ${fallbackErr.message}`);
      }
    } else {
      throw primaryErr;
    }
  }

  return { recipe, usedModel, rawText };
}
