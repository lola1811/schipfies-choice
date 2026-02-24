export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { recipeId, person, action } = await req.json();
    // person: "Lola" or "Luki"
    // action: "heart" or "unheart"
    const notionKey = process.env.NOTION_TOKEN;

    if (!notionKey || !recipeId || !person) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // First get current page to read existing hearts
    const getResponse = await fetch(`https://api.notion.com/v1/pages/${recipeId}`, {
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Notion-Version": "2022-06-28"
      }
    });

    if (!getResponse.ok) {
      return new Response(JSON.stringify({ error: "Rezept nicht gefunden" }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    const page = await getResponse.json();
    const currentHearts = (page.properties[" ❤️ Geherzt von "]?.multi_select || []).map(o => o.name);

    let newHearts;
    if (action === "heart") {
      newHearts = [...new Set([...currentHearts, person])];
    } else {
      newHearts = currentHearts.filter(h => h !== person);
    }

    // Update the page
    const updateResponse = await fetch(`https://api.notion.com/v1/pages/${recipeId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        properties: {
          " ❤️ Geherzt von ": {
            multi_select: newHearts.map(n => ({ name: n }))
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const err = await updateResponse.text();
      return new Response(JSON.stringify({ error: "Update fehlgeschlagen", details: err }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, geherztVon: newHearts }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/heart-recipe"
};
