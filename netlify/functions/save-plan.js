export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { datum, rezeptId, tag, woche, notiz } = await req.json();
    // datum: "2026-02-24", rezeptId: notion page id, tag: "Montag 24.2.", woche: "KW9 2026"
    const notionKey = process.env.NOTION_TOKEN;
    const planDbId = process.env.NOTION_PLAN_DATABASE_ID;

    if (!notionKey || !planDbId || !datum || !rezeptId) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const properties = {
      "Tag": { title: [{ text: { content: tag || datum } }] },
      "Datum": { date: { start: datum } },
      "Rezept": { relation: [{ id: rezeptId }] },
      "Woche": { rich_text: [{ text: { content: woche || "" } }] }
    };

    if (notiz) {
      properties["Notizen"] = { rich_text: [{ text: { content: notiz } }] };
    }

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: planDbId },
        properties
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: "Notion Fehler", details: err }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/save-plan"
};
