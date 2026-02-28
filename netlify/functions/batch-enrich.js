export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { mode, cursor } = await req.json();
    const notionKey = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!notionKey || !dbId || !anthropicKey) {
      return Response.json({ error: "API Keys nicht konfiguriert" }, { status: 500 });
    }

    // Fetch all recipes from Notion
    let allPages = [];
    let hasMore = true;
    let startCursor = undefined;
    while (hasMore) {
      const body = { page_size: 100 };
      if (startCursor) body.start_cursor = startCursor;
      const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${notionKey}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      allPages = allPages.concat(data.results || []);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const recipes = allPages.map(page => {
      const p = page.properties;
      return {
        id: page.id,
        title: p["Rezept"]?.title?.[0]?.plain_text || "?",
        link: p["Originalrezept-Link"]?.url || "",
        hasZutaten: (p["Zutaten"]?.rich_text?.map(t => t.plain_text).join("") || "").length > 0,
        hasZubereitung: (p["Zubereitung"]?.rich_text?.map(t => t.plain_text).join("") || "").length > 0,
        zutaten: p["Zutaten"]?.rich_text?.map(t => t.plain_text).join("") || "",
        tipps: p["Tipps"]?.rich_text?.map(t => t.plain_text).join("") || "",
        hasHealth: (p["Gesundheitshinweis"]?.rich_text?.map(t => t.plain_text).join("") || "").length > 0,
        passtFuer: (p["Passt für"]?.multi_select || []).map(o => o.name)
      };
    });

    // SCAN mode
    if (mode === "scan") {
      const needsFetch = recipes.filter(r => (!r.hasZutaten || !r.hasZubereitung) && r.link);
      const needsHealth = recipes.filter(r => !r.hasHealth);
      const complete = recipes.filter(r => r.hasZutaten && r.hasZubereitung && r.hasHealth);
      return Response.json({
        total: recipes.length, complete: complete.length,
        needsFetch: needsFetch.map(r => ({ id: r.id, title: r.title, link: r.link.substring(0, 50) })),
        needsHealth: needsHealth.map(r => ({ id: r.id, title: r.title })),
        countFetch: needsFetch.length, countHealth: needsHealth.length
      });
    }

    // FETCH mode: fill missing zutaten/zubereitung from links
    if (mode === "fetch") {
      const needsFetch = recipes.filter(r => (!r.hasZutaten || !r.hasZubereitung) && r.link);
      const cursorIdx = cursor ? needsFetch.findIndex(r => r.id === cursor) : -1;
      const target = needsFetch[cursorIdx + 1] || null;
      if (!target) return Response.json({ action: "fetch_done", remaining: 0 });

      let pageContent;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const fetchRes = await fetch(target.link, {
          headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", "Accept": "text/html" },
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
        pageContent = await fetchRes.text();
        pageContent = pageContent
          .replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<svg[\s\S]*?<\/svg>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "")
          .replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "")
          .replace(/<aside[\s\S]*?<\/aside>/gi, "").replace(/<!--[\s\S]*?-->/g, "")
          .replace(/\s{2,}/g, " ").substring(0, 25000);
      } catch (e) {
        return Response.json({ action: "fetch", status: "error", title: target.title, error: e.message, next: target.id, remaining: needsFetch.length - (cursorIdx + 2) });
      }

      const extractPrompt = `Du bist ein Rezept-Parser. Extrahiere aus dem HTML die Rezeptdaten.
Übersetze alles ins Deutsche. Antworte NUR mit JSON:
{"zutaten":"Menge1 Zutat1\\nMenge2 Zutat2","zubereitung":"1. Schritt\\n2. Schritt","tipps":"Tipp oder null"}
Zutaten mit Mengenangaben, Schritte nummeriert.
HTML:
${pageContent}`;

      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2000, messages: [{ role: "user", content: extractPrompt }] })
      });
      if (!claudeRes.ok) return Response.json({ action: "fetch", status: "error", title: target.title, error: `Claude ${claudeRes.status}`, next: target.id, remaining: needsFetch.length - (cursorIdx + 2) });

      const claudeData = await claudeRes.json();
      const rawText = claudeData.content[0].text.trim();
      const cleaned = rawText.replace(/^```json\s*\n?/, "").replace(/\n?```$/, "").trim();
      let extracted;
      try { extracted = JSON.parse(cleaned); } catch (e) {
        return Response.json({ action: "fetch", status: "error", title: target.title, error: "JSON parse", next: target.id, remaining: needsFetch.length - (cursorIdx + 2) });
      }

      const updateProps = {};
      if (extracted.zutaten && !target.hasZutaten) updateProps["Zutaten"] = { rich_text: [{ text: { content: extracted.zutaten.substring(0, 2000) } }] };
      if (extracted.zubereitung && !target.hasZubereitung) updateProps["Zubereitung"] = { rich_text: [{ text: { content: extracted.zubereitung.substring(0, 2000) } }] };
      if (extracted.tipps && !target.tipps) updateProps["Tipps"] = { rich_text: [{ text: { content: extracted.tipps.substring(0, 2000) } }] };

      if (Object.keys(updateProps).length > 0) {
        await fetch(`https://api.notion.com/v1/pages/${target.id}`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${notionKey}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
          body: JSON.stringify({ properties: updateProps })
        });
      }

      return Response.json({ action: "fetch", status: "ok", title: target.title, updated: Object.keys(updateProps), next: target.id, remaining: needsFetch.length - (cursorIdx + 2) });
    }

    // HEALTH mode: generate health notes
    if (mode === "health") {
      const needsHealth = recipes.filter(r => !r.hasHealth && r.hasZutaten);
      const cursorIdx = cursor ? needsHealth.findIndex(r => r.id === cursor) : -1;
      const target = needsHealth[cursorIdx + 1] || null;
      if (!target) return Response.json({ action: "health_done", remaining: 0 });

      const profileContext = `Lola (33, Schilddrüsenunterfunktion, Eisenmangel, niedriger Blutdruck, Familienplanung, vegetarisch, liebt Käse/Oliven/Kürbiskernöl/Kräuter). Lucas (34, erhöhter Cholesterin, Familienplanung, kein Käse/keine Oliven/keine Pilze, isst Fisch). Beide: viel Eiweiß, Folsäure, Omega-3, Eisen (Lola), cholesterinbewusst (Lucas), Jod (Lola).`;
      const who = target.passtFuer.includes("Lola") && target.passtFuer.includes("Luki") ? "Lola & Lucas" : target.passtFuer.includes("Lola") ? "Lola" : "Lucas";

      const prompt = `Schreibe einen kurzen Gesundheitshinweis (2-4 Sätze) für dieses Rezept.
Profil: ${profileContext}
Rezept: "${target.title}" — passt für: ${who}
Zutaten: ${target.zutaten.substring(0, 500)}
Erkläre welche Zutaten welche Nährstoffe liefern und warum das für ${who} relevant ist. NUR den Hinweistext, kompakt, Deutsch.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, messages: [{ role: "user", content: prompt }] })
      });
      if (!res.ok) return Response.json({ action: "health", status: "error", title: target.title, error: `Claude ${res.status}`, next: target.id, remaining: needsHealth.length - (cursorIdx + 2) });

      const data = await res.json();
      const note = data.content[0].text.trim();

      await fetch(`https://api.notion.com/v1/pages/${target.id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${notionKey}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({ properties: { "Gesundheitshinweis": { rich_text: [{ text: { content: note.substring(0, 2000) } }] } } })
      });

      return Response.json({ action: "health", status: "ok", title: target.title, note: note.substring(0, 100) + "...", next: target.id, remaining: needsHealth.length - (cursorIdx + 2) });
    }

    return Response.json({ error: "Unbekannter mode. Nutze: scan, fetch, health" }, { status: 400 });

  } catch (error) {
    return Response.json({ error: "Interner Fehler", message: error.message }, { status: 500 });
  }
};

export const config = { path: "/api/batch-enrich" };
