export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { url, passtFuer } = await req.json();
    const notionKey = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!notionKey || !dbId || !anthropicKey) {
      return new Response(JSON.stringify({ error: "API Keys nicht konfiguriert" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    if (!url) {
      return new Response(JSON.stringify({ error: "Keine URL angegeben" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // Step 1: Fetch the recipe page
    let pageContent;
    try {
      const fetchRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SchipfiesChoice/1.0)',
          'Accept': 'text/html,application/xhtml+xml'
        }
      });
      if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
      pageContent = await fetchRes.text();
      // Limit content to avoid token overflow
      pageContent = pageContent.substring(0, 30000);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Seite konnte nicht geladen werden", details: e.message }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // Step 2: Extract recipe via Claude
    const extractPrompt = `Du bist ein Rezept-Parser. Extrahiere aus dem folgenden HTML einer Rezept-Website die Rezeptdaten.

WICHTIG: Übersetze ALLES ins Deutsche — auch den Titel! Wenn das Originalrezept "Thai Green Curry" heißt, wird daraus "Thailändisches Grünes Curry". Wenn es "Roasted Cauliflower Salad" heißt, wird daraus "Gerösteter Blumenkohl-Salat".

Antworte NUR mit einem JSON-Objekt (kein Markdown, keine Erklärung), mit genau diesen Feldern:
{
  "title": "Rezeptname auf Deutsch",
  "beschreibung": "Kurze Beschreibung auf Deutsch, 1 Satz",
  "kuechenstil": "Asiatisch" oder "Mediterran" oder "Orientalisch" oder "Österreichisch" oder "Comfort" oder "Andere",
  "mealType": "Hauptgericht" oder "Vorspeise / Salat" oder "Suppe" oder "Snack" oder "Smoothie" oder "Dessert (gesund)" oder "Dessert (Genuss)",
  "zubereitungszeit": Zahl in Minuten oder null,
  "portionen": "2" oder was angegeben ist,
  "zutaten": "Zutat 1\\nZutat 2\\nZutat 3",
  "zubereitung": "1. Schritt eins\\n2. Schritt zwei\\n3. Schritt drei",
  "tipps": "Optionaler Tipp oder null",
  "tags": ["vegan", "schnell"] oder leeres Array - mögliche Tags: vegan, eiweißreich, schnell, ofengericht, suppe, glutenfrei, eisenreich
}

Alle Texte auf Deutsch — Titel, Beschreibung, Zutaten, Schritte, Tipps. Zutaten mit Mengenangaben. Schritte nummeriert.
Wenn du etwas nicht findest, setze null oder leeres Array.

HTML-Inhalt der Seite:
${pageContent}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: extractPrompt }]
      })
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      return new Response(JSON.stringify({ error: "Claude API Fehler", details: err }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content[0].text.trim();
    
    let recipe;
    try {
      // Strip possible markdown code fences
      const cleaned = rawText.replace(/^```json\s*\n?/,'').replace(/\n?```$/,'').trim();
      recipe = JSON.parse(cleaned);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Rezept konnte nicht extrahiert werden", raw: rawText }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    // Step 3: Save to Notion
    const passtFuerValue = (passtFuer || ["Beide"]).map(n => ({ name: n }));
    const notionTags = (recipe.tags || []).map(t => ({ name: t }));

    const properties = {
      "Rezept": { title: [{ text: { content: recipe.title || "Unbenanntes Rezept" } }] },
      "Originalrezept-Link": { url: url },
      "Beschreibung": { rich_text: [{ text: { content: (recipe.beschreibung || "").substring(0, 2000) } }] },
      "Quelle": { select: { name: "Favorit" } },
      "Passt für": { multi_select: passtFuerValue },
      "Geherzt am": { date: { start: new Date().toISOString().split('T')[0] } },
      "Zutaten": { rich_text: [{ text: { content: (recipe.zutaten || "").substring(0, 2000) } }] },
      "Zubereitung": { rich_text: [{ text: { content: (recipe.zubereitung || "").substring(0, 2000) } }] },
    };

    if (recipe.tipps) {
      properties["Tipps"] = { rich_text: [{ text: { content: recipe.tipps.substring(0, 2000) } }] };
    }
    if (recipe.zubereitungszeit) {
      properties["Zubereitungszeit"] = { number: parseInt(recipe.zubereitungszeit) || null };
    }
    if (recipe.portionen) {
      properties["Portionen"] = { rich_text: [{ text: { content: String(recipe.portionen) } }] };
    }
    if (recipe.kuechenstil) {
      properties["Küchenstil"] = { select: { name: recipe.kuechenstil } };
    }
    if (recipe.mealType) {
      properties["Meal-Type"] = { select: { name: recipe.mealType } };
    }
    if (notionTags.length > 0) {
      properties["Tags"] = { multi_select: notionTags };
    }

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties
      })
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      return new Response(JSON.stringify({ error: "Notion Speicherfehler", details: err }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const notionData = await notionRes.json();

    return new Response(JSON.stringify({ 
      success: true, 
      id: notionData.id, 
      title: recipe.title,
      recipe: recipe 
    }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/import-recipe"
};