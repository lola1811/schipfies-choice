export default async (req) => {
  try {
    const notionKey = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!notionKey || !dbId) {
      return new Response(JSON.stringify({ error: "Notion nicht konfiguriert" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch all pages from the database (paginated)
    let allPages = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const body = { page_size: 100 };
      if (startCursor) body.start_cursor = startCursor;

      const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const err = await response.text();
        return new Response(JSON.stringify({ error: "Notion Fehler", details: err }), {
          status: 500, headers: { "Content-Type": "application/json" }
        });
      }

      const data = await response.json();
      allPages = allPages.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    // Transform Notion pages to app format
    const recipes = allPages.map(page => {
      const p = page.properties;
      return {
        id: page.id,
        notionUrl: page.url,
        title: getTitle(p["Rezept"]),
        subtitle: getText(p["Beschreibung"]),
        link: p["Originalrezept-Link"]?.url || null,
        cuisine: p["Küchenstil"]?.select?.name || null,
        mealType: mapMealType(p["Meal-Type"]?.select?.name),
        prepTime: p["Zubereitungszeit"]?.number?.toString() || null,
        servings: getText(p["Portionen"]) || "2",
        source: p["Quelle"]?.select?.name || "Favorit",
        passtFuer: getMultiSelect(p["Passt für"]),
        geherztVon: getMultiSelect(p[" ❤️ Geherzt von "]),
        tags: getMultiSelect(p["Tags"]),
        zutaten: getText(p["Zutaten"]),
        zubereitung: getText(p["Zubereitung"]),
        tipps: getText(p["Tipps"]),
        healthNote: getText(p["Gesundheitshinweis"]),
        createdAt: page.created_time
      };
    });

    return new Response(JSON.stringify(recipes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

function getTitle(prop) {
  return prop?.title?.map(t => t.plain_text).join('') || '';
}

function getText(prop) {
  return prop?.rich_text?.map(t => t.plain_text).join('') || '';
}

function getMultiSelect(prop) {
  return (prop?.multi_select || []).map(o => o.name);
}

function mapMealType(notionType) {
  const map = {
    'Hauptgericht': 'hauptgericht',
    'Vorspeise / Salat': 'vorspeise',
    'Suppe': 'suppe',
    'Snack': 'snack',
    'Smoothie': 'smoothie',
    'Dessert (gesund)': 'dessert_gesund',
    'Dessert (Genuss)': 'dessert_ungesund'
  };
  return map[notionType] || 'hauptgericht';
}

export const config = {
  path: "/api/get-favorites"
};
