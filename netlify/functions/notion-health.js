// Diagnostic endpoint to check Notion connection health
export default async (req) => {
  const notionKey = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATABASE_ID;
  const planDbId = process.env.NOTION_PLAN_DATABASE_ID;

  const checks = {
    env: {
      hasToken: !!notionKey,
      tokenPrefix: notionKey ? notionKey.substring(0, 8) + '...' : null,
      hasDbId: !!dbId,
      dbIdPrefix: dbId ? dbId.substring(0, 8) + '...' : null,
      hasPlanDbId: !!planDbId
    },
    recipeDb: null,
    notionUser: null
  };

  if (!notionKey) {
    return new Response(JSON.stringify({
      status: "error",
      message: "NOTION_TOKEN fehlt in Environment Variables",
      checks
    }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  // Check 1: Can we authenticate with Notion?
  try {
    const userRes = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        "Authorization": `Bearer ${notionKey}`,
        "Notion-Version": "2022-06-28"
      }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      checks.notionUser = { ok: true, type: userData.type, name: userData.name || userData.bot?.owner?.type };
    } else {
      const err = await userRes.text();
      checks.notionUser = { ok: false, status: userRes.status, error: err };
    }
  } catch (e) {
    checks.notionUser = { ok: false, error: e.message };
  }

  // Check 2: Can we access the recipe database?
  if (dbId) {
    try {
      const dbRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
        headers: {
          "Authorization": `Bearer ${notionKey}`,
          "Notion-Version": "2022-06-28"
        }
      });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        checks.recipeDb = {
          ok: true,
          title: dbData.title?.map(t => t.plain_text).join('') || 'Untitled',
          properties: Object.keys(dbData.properties || {})
        };
      } else {
        const err = await dbRes.text();
        checks.recipeDb = { ok: false, status: dbRes.status, error: err };
      }
    } catch (e) {
      checks.recipeDb = { ok: false, error: e.message };
    }
  }

  const allOk = checks.notionUser?.ok && checks.recipeDb?.ok;

  return new Response(JSON.stringify({
    status: allOk ? "ok" : "error",
    message: allOk ? "Notion Verbindung funktioniert" : "Probleme mit Notion Verbindung",
    checks
  }, null, 2), {
    status: allOk ? 200 : 500,
    headers: { "Content-Type": "application/json" }
  });
};

export const config = {
  path: "/api/notion-health"
};
