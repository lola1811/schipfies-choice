export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { url, passtFuer, fetchOnly } = await req.json();
    const notionKey = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!notionKey || !dbId || !openrouterKey) {
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const fetchRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
      pageContent = await fetchRes.text();
      // Strip scripts, styles, SVGs, and nav to reduce size drastically
      pageContent = pageContent
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<svg[\s\S]*?<\/svg>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/\s{2,}/g, ' ')
        .substring(0, 25000);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Seite konnte nicht geladen werden", details: e.message }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // Step 2: Extract recipe via AI (free model with Claude fallback)
    const { aiCall } = await import("./ai-router.js");
    const extractPrompt = `Du bist ein Rezept-Parser. Extrahiere aus dem folgenden HTML einer Rezept-Website die Rezeptdaten.

WICHTIG: Übersetze ALLES ins Deutsche — auch den Titel! Wenn das Originalrezept "Thai Green Curry" heißt, wird daraus "Thailändisches Grünes Curry". Wenn es "Roasted Cauliflower Salad" heißt, wird daraus "Gerösteter Blumenkohl-Salat".

PROFIL der Nutzer (wichtig für tipps, gesundheitshinweis und passtFuer):
- Lola (33, vegetarisch, Schilddrüsenunterfunktion, Eisenmangel, niedriger Blutdruck, liebt Käse/Oliven/Kürbiskernöl/Kräuter)
- Lucas (34, isst Fisch aber kein Käse/keine Oliven/keine Pilze, erhöhtes Cholesterin)
- Beide brauchen: viel Eiweiß, Folsäure, Omega-3, Eisen (Lola), Jod (Lola), cholesterinbewusst (Lucas)

Antworte NUR mit einem JSON-Objekt (kein Markdown, keine Erklärung), mit genau diesen Feldern:
{
  "title": "Rezeptname auf Deutsch",
  "beschreibung": "Kurze Beschreibung auf Deutsch, 1 Satz",
  "kuechenstil": "Asiatisch" oder "Mediterran" oder "Orientalisch" oder "Österreichisch" oder "Comfort" oder "Andere",
  "mealType": "Hauptgericht" oder "Vorspeise / Salat" oder "Suppe" oder "Snack" oder "Smoothie" oder "Dessert (gesund)" oder "Dessert (Genuss)",
  "zubereitungszeit": Zahl in Minuten oder null,
  "portionen": "2" oder was angegeben ist,
  "zutaten": "Menge1 Zutat1\\nMenge2 Zutat2\\nMenge3 Zutat3",
  "zubereitung": "1. Schritt eins\\n2. Schritt zwei\\n3. Schritt drei",
  "tipps": "Kochtipps + Kompatibilitätshinweise (siehe unten)",
  "gesundheitshinweis": "2-4 Sätze: welche Zutaten welche Nährstoffe liefern und warum relevant für Lola/Lucas",
  "passtFuer": ["Lola", "Luki"] oder ["Lola"] oder ["Luki"],
  "tags": ["vegan", "schnell"] oder leeres Array - mögliche Tags: vegan, eiweißreich, schnell, ofengericht, suppe, glutenfrei, eisenreich
}

REGELN für "tipps":
- Beginne mit Kochtipps/Variationen falls vorhanden.
- DANN prüfe Kompatibilität mit den Profilen:
  - Enthält Fleisch/Geflügel? → 🌿 Lola ist vegetarisch — schlage eine konkrete pflanzliche Alternative vor (z.B. "Huhn durch 400g Kräuterseitlinge ersetzen").
  - Enthält Käse/Oliven/Pilze? → 🦕 Für Luki: Käse/Oliven/Pilze weglassen oder durch X ersetzen.
  - Enthält cholesterinreiche Zutaten? → Für Lucas cholesterinbewusst: Menge reduzieren oder Alternative.
- Sei konkret mit Alternativen, nicht nur "weglassen".

REGELN für "passtFuer":
- Vegetarisch ohne Käse/Oliven/Pilze → ["Lola", "Luki"]
- Mit Fleisch → ["Luki"] (oder ["Lola", "Luki"] wenn vegetarische Variante einfach möglich)
- Mit Fisch → ["Luki"] oder ["Lola", "Luki"] je nach Rezept
- Mit Käse/Oliven/Pilzen → ["Lola"] (oder ["Lola", "Luki"] wenn leicht weglassbar)

REGELN für "gesundheitshinweis":
- Nenne konkret welche Zutaten welche Nährstoffe liefern.
- Beziehe dich auf Lola und/oder Lucas je nach passtFuer.
- Kompakt, informativ, auf Deutsch.

REGELN für "zutaten":
- IMMER mit Mengenangaben: "250g Spaghetti" nicht nur "Spaghetti"
- Format pro Zeile: "Menge Zutat" — z.B. "2 EL Olivenöl", "1 Zwiebel, gewürfelt", "400g stückige Tomaten"

Alle Texte auf Deutsch — Titel, Beschreibung, Zutaten, Schritte, Tipps, Gesundheitshinweis. Schritte nummeriert.
Wenn du etwas nicht findest, setze null oder leeres Array.

HTML-Inhalt der Seite:
${pageContent}`;

    let recipe, usedModel;
    try {
      const result = await aiCall("parse", extractPrompt, 2000);
      recipe = result.recipe;
      usedModel = result.usedModel;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Rezept konnte nicht extrahiert werden", details: e.message }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    // If fetchOnly, return extracted data without saving to Notion
    if (fetchOnly) {
      return new Response(JSON.stringify({ 
        success: true, 
        title: recipe.title,
        zutaten: recipe.zutaten || '',
        zubereitung: recipe.zubereitung || '',
        tipps: recipe.tipps || '',
        gesundheitshinweis: recipe.gesundheitshinweis || '',
        recipe: recipe 
      }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }

    // Step 3: Save to Notion
    const aiPasstFuer = recipe.passtFuer || [];
    const passtFuerValue = (passtFuer && passtFuer.length > 0 ? passtFuer : (aiPasstFuer.length > 0 ? aiPasstFuer : ["Beide"])).map(n => ({ name: n }));
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
    if (recipe.gesundheitshinweis) {
      properties["Gesundheitshinweis"] = { rich_text: [{ text: { content: recipe.gesundheitshinweis.substring(0, 2000) } }] };
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
