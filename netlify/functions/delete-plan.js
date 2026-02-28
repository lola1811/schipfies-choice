export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { planEntryId, deleteAll, weekStart } = await req.json();
    const notionKey = process.env.NOTION_TOKEN;
    const planDbId = process.env.NOTION_PLAN_DATABASE_ID;

    if (!notionKey || !planDbId) {
      return new Response(JSON.stringify({ error: "Missing config" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // Delete single entry
    if (planEntryId) {
      const res = await fetch(`https://api.notion.com/v1/pages/${planEntryId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${notionKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({ archived: true })
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: "Notion Fehler", details: err }), {
          status: 500, headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }

    // Delete all entries for a week
    if (deleteAll && weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const weekEnd = endDate.toISOString().split('T')[0];

      // Query all entries for this week
      const queryRes = await fetch(`https://api.notion.com/v1/databases/${planDbId}/query`, {
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
          }
        })
      });

      if (!queryRes.ok) {
        const err = await queryRes.text();
        return new Response(JSON.stringify({ error: "Query Fehler", details: err }), {
          status: 500, headers: { "Content-Type": "application/json" }
        });
      }

      const data = await queryRes.json();
      let deleted = 0;

      // Archive each entry
      for (const page of data.results) {
        await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${notionKey}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
          },
          body: JSON.stringify({ archived: true })
        }).catch(() => {});
        deleted++;
      }

      return new Response(JSON.stringify({ success: true, deleted }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Kein planEntryId oder deleteAll angegeben" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/delete-plan"
};
