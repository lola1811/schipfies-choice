export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { datum, rezeptId, tag, woche, notiz } = body;
    const notionKey = process.env.NOTION_TOKEN;
    const planDbId = process.env.NOTION_PLAN_DATABASE_ID;

    if (!notionKey || !planDbId) {
      return new Response(JSON.stringify({ error: "Missing config", hasToken: !!notionKey, hasDbId: !!planDbId }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    if (!datum || !rezeptId) {
      return new Response(JSON.stringify({ error: "Missing parameters", datum, rezeptId, tag, woche }), {
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

    const notionBody = {
      parent: { database_id: planDbId },
      properties
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(notionBody)
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ 
        error: "Notion Fehler", 
        status: response.status,
        details: err,
        sentBody: { planDbId: planDbId.substring(0, 8) + '...', rezeptId: rezeptId.substring(0, 8) + '...', datum, tag }
      }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message, stack: error.stack }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/save-plan"
};
