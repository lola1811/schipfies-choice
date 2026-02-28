export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { recipeId, zutaten, zubereitung, tipps } = await req.json();
    const notionKey = process.env.NOTION_TOKEN;

    if (!notionKey || !recipeId) {
      return new Response(JSON.stringify({ error: "Fehlende Parameter" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const properties = {};
    if (zutaten) {
      properties["Zutaten"] = { rich_text: [{ text: { content: zutaten.substring(0, 2000) } }] };
    }
    if (zubereitung) {
      properties["Zubereitung"] = { rich_text: [{ text: { content: zubereitung.substring(0, 2000) } }] };
    }
    if (tipps) {
      properties["Tipps"] = { rich_text: [{ text: { content: tipps.substring(0, 2000) } }] };
    }

    if (Object.keys(properties).length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Nichts zu updaten" }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }

    const res = await fetch(`https://api.notion.com/v1/pages/${recipeId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({ properties })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: "Notion Update Fehler", details: err }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/update-recipe-details"
};
