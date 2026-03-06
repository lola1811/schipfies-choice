// Profile API — reads/writes Schipfie's Profile DB in Notion
// DB data source: a07911f3-a6b9-46b2-8551-b1d3480ef61d
// Luki ID: 31b0c858-3747-81f0-a4a5-f68b3fa1da3d
// Lola ID: 31b0c858-3747-81a1-a093-dd126fae8f90

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PROFILE_DB = "a07911f3a6b946b28551b1d3480ef61d";
const PROFILE_IDS = {
  Luki: "31b0c858374781f0a4a5f68b3fa1da3d",
  Lola: "31b0c858374781a1a093dd126fae8f90"
};
const FIELDS = ["Health", "Isst Nicht", "Liebt", "Braucht", "Mehr Von"];

async function notionGet(pageId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28"
    }
  });
  if (!res.ok) throw new Error(`Notion GET failed: ${res.status}`);
  return res.json();
}

async function notionPatch(pageId, properties) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify({ properties })
  });
  if (!res.ok) throw new Error(`Notion PATCH failed: ${res.status}`);
  return res.json();
}

function extractText(prop) {
  if (!prop || !prop.rich_text) return "";
  return prop.rich_text.map(t => t.plain_text).join("");
}

function toRichText(text) {
  return { rich_text: [{ text: { content: text || "" } }] };
}

export default async (req) => {
  const url = new URL(req.url);

  // GET /api/profile?name=Luki
  if (req.method === "GET") {
    const name = url.searchParams.get("name");
    if (!name || !PROFILE_IDS[name]) {
      return new Response(JSON.stringify({ error: "Name must be Luki or Lola" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const page = await notionGet(PROFILE_IDS[name]);
      const profile = { name };
      FIELDS.forEach(f => {
        profile[f] = extractText(page.properties[f]);
      });
      return new Response(JSON.stringify(profile), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }
  }

  // POST /api/profile — { name: "Luki", "Health": "...", ... }
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const name = body.name;
      if (!name || !PROFILE_IDS[name]) {
        return new Response(JSON.stringify({ error: "Name must be Luki or Lola" }), {
          status: 400, headers: { "Content-Type": "application/json" }
        });
      }

      const properties = {};
      FIELDS.forEach(f => {
        if (body[f] !== undefined) {
          properties[f] = toRichText(body[f]);
        }
      });

      await notionPatch(PROFILE_IDS[name], properties);
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }
  }

  // GET both profiles (for generate-recipe)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/profile"
};
