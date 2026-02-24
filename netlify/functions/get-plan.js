export default async (req) => {
  try {
    const url = new URL(req.url);
    const weekStart = url.searchParams.get('weekStart'); // ISO date of Monday, e.g. "2026-02-24"
    const notionKey = process.env.NOTION_TOKEN;
    const planDbId = process.env.NOTION_PLAN_DATABASE_ID;

    if (!notionKey || !planDbId || !weekStart) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // Calculate week end (Sunday)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const weekEnd = endDate.toISOString().split('T')[0];

    // Query plan entries for this week
    const response = await fetch(`https://api.notion.com/v1/databases/${planDbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: "Datum", date: { on_or_after: weekStart } },
            { property: "Datum", date: { on_or_before: weekEnd } }
          ]
        },
        sorts: [{ property: "Datum", direction: "ascending" }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: "Notion Fehler", details: err }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();

    // Transform to simple format
    const entries = data.results.map(page => {
      const p = page.properties;
      return {
        id: page.id,
        tag: getTitle(p["Tag"]),
        datum: p["Datum"]?.date?.start || null,
        rezeptIds: (p["Rezept"]?.relation || []).map(r => r.id),
        woche: getText(p["Woche"]),
        notiz: getText(p["Notizen"])
      };
    });

    return new Response(JSON.stringify(entries), {
      status: 200,
      headers: { "Content-Type": "application/json" }
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

export const config = {
  path: "/api/get-plan"
};
