export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const recipe = await req.json();
    const notionKey = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!notionKey || !dbId) {
      return new Response(JSON.stringify({ error: "Notion nicht konfiguriert" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build ingredients text
    const ingredientsText = (recipe.ingredients || [])
      .map(i => `${i.amount} ${i.unit || ''} ${i.name}`.trim())
      .join('\n');

    // Build steps text
    const stepsText = (recipe.steps || [])
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n');

    // Determine "Passt für"
    const passtFuer = [];
    const tags = recipe.tags || [];
    if (tags.includes('Lola+Luki') || (recipe.profiles && recipe.profiles.includes('lucas') && recipe.profiles.includes('lola'))) {
      passtFuer.push({ name: "Beide" });
    } else {
      if (recipe.profiles?.includes('lucas') || tags.includes('Luki-Solo')) passtFuer.push({ name: "Luki" });
      if (recipe.profiles?.includes('lola') || tags.includes('Lola-Solo')) passtFuer.push({ name: "Lola" });
    }
    if (passtFuer.length === 0) passtFuer.push({ name: "Beide" });

    // Map cuisine
    const cuisineMap = {
      asiatisch: "Asiatisch",
      mediterran: "Mediterran",
      orientalisch: "Orientalisch",
      comfort: "Comfort"
    };

    // Map tags to Notion tags
    const notionTags = tags
      .filter(t => !['Lola+Luki', 'Lola-Solo', 'Luki-Solo'].includes(t))
      .map(t => {
        const lower = t.toLowerCase();
        if (lower.includes('vegan')) return { name: 'vegan' };
        if (lower.includes('eiweiß') || lower.includes('protein')) return { name: 'eiweißreich' };
        if (lower.includes('schnell')) return { name: 'schnell' };
        if (lower.includes('ofen')) return { name: 'ofengericht' };
        if (lower.includes('suppe')) return { name: 'suppe' };
        if (lower.includes('gluten')) return { name: 'glutenfrei' };
        if (lower.includes('eisen')) return { name: 'eisenreich' };
        return null;
      })
      .filter(Boolean);

    const properties = {
      "Rezept": { title: [{ text: { content: recipe.title || "Unbenanntes Rezept" } }] },
      "Beschreibung": { rich_text: [{ text: { content: (recipe.subtitle || "").substring(0, 2000) } }] },
      "Quelle": { select: { name: recipe.source || "KI-generiert" } },
      "Passt für": { multi_select: passtFuer },
      "Geherzt am": { date: { start: new Date().toISOString().split('T')[0] } },
      "Zutaten": { rich_text: [{ text: { content: ingredientsText.substring(0, 2000) } }] },
      "Zubereitung": { rich_text: [{ text: { content: stepsText.substring(0, 2000) } }] },
    };

    if (recipe.tips) {
      properties["Tipps"] = { rich_text: [{ text: { content: recipe.tips.substring(0, 2000) } }] };
    }
    if (recipe.healthNote) {
      properties["Gesundheitshinweis"] = { rich_text: [{ text: { content: recipe.healthNote.substring(0, 2000) } }] };
    }
    if (recipe.prepTime) {
      properties["Zubereitungszeit"] = { number: parseInt(recipe.prepTime) || null };
    }
    if (recipe.link) {
      properties["Originalrezept-Link"] = { url: recipe.link };
    }
    if (recipe.cuisine && cuisineMap[recipe.cuisine]) {
      properties["Küchenstil"] = { select: { name: cuisineMap[recipe.cuisine] } };
    }
    if (notionTags.length > 0) {
      properties["Tags"] = { multi_select: notionTags };
    }

    const response = await fetch("https://api.notion.com/v1/pages", {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Notion API error:", errorText);
      return new Response(JSON.stringify({ error: "Notion Fehler", details: errorText }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, id: data.id, url: data.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/save-to-notion"
};
