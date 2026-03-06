const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PROFILE_IDS = {
  Luki: "31b0c858-3747-81f0-a4a5-f68b3fa1da3d",
  Lola: "31b0c858-3747-81a1-a093-dd126fae8f90"
};

async function fetchProfile(name) {
  const res = await fetch(`https://api.notion.com/v1/pages/${PROFILE_IDS[name]}`, {
    headers: { "Authorization": `Bearer ${NOTION_TOKEN}`, "Notion-Version": "2022-06-28" }
  });
  if (!res.ok) return null;
  const page = await res.json();
  const get = (f) => (page.properties[f]?.rich_text || []).map(t => t.plain_text).join("") || "";
  return { name, health: get("Health"), isstNicht: get("Isst Nicht"), liebt: get("Liebt"), braucht: get("Braucht"), mehrVon: get("Mehr Von") };
}

function buildProfileText(p) {
  return `${p.name} (${p.health}):
ISST NICHT: ${p.isstNicht}
LIEBT: ${p.liebt}
BRAUCHT: ${p.braucht}${p.mehrVon ? `\nMEHR DAVON BEI KI-REZEPTEN: ${p.mehrVon}` : ""}`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { profiles, filters, cuisine, mealType, maxMinutes, ingredient, recentRecipes } = await req.json();

    // Fetch profiles from Notion
    const [luki, lola] = await Promise.all([fetchProfile("Luki"), fetchProfile("Lola")]);

    let profileText = "";
    const activeProfiles = profiles || ["lucas", "lola"];

    if (activeProfiles.includes("lucas") && activeProfiles.includes("lola") && luki && lola) {
      profileText = `Koche für BEIDE zusammen (Schnittmenge):
${buildProfileText(luki)}

${buildProfileText(lola)}

WICHTIG - Schnittmenge bedeutet:
- Vegetarisch (wegen Lola)
- Kombiniere die ISST NICHT Listen beider Profile
- Viel Eiweiß für beide
- Eisenreich für Lola, cholesterinbewusst für Luki
- Omega-3-reich für beide (Kerne, Nüsse, Samen — mit gesundem Fett kombinieren)
- Große Portionen (Luki hat viel Hunger)`;
    } else if (activeProfiles.includes("lucas") && luki) {
      profileText = `Koche NUR für Luki:\n${buildProfileText(luki)}\nLuki darf auch Fisch essen wenn er allein isst.`;
    } else if (activeProfiles.includes("lola") && lola) {
      profileText = `Koche NUR für Lola:\n${buildProfileText(lola)}\nLola liebt Käse (Feta, Halloumi, Mozzarella) und Oliven wenn sie allein isst.`;
    }

    // Ingredient wish
    const ingredientText = ingredient ? `\nHAUPTZUTAT: Das Rezept MUSS "${ingredient}" als zentrale Zutat enthalten. Baue das Gericht darum auf.` : "";

    const filterTexts = [];
    if (filters?.glutenfrei) filterTexts.push("GLUTENFREI (kein Weizen, Roggen, Gerste, Dinkel)");
    if (filters?.laktosefrei) filterTexts.push("LAKTOSEFREI (keine Milchprodukte)");
    if (filters?.vegan) filterTexts.push("VEGAN (keine tierischen Produkte, kein Ei, keine Milch, kein Honig)");
    if (filters?.salzarm) filterTexts.push("SALZARM (minimal Salz, keine salzigen Zutaten)");
    if (filters?.zuckerfrei) filterTexts.push("ZUCKERFREI (kein zugesetzter Zucker, kein Honig, kein Ahornsirup)");
    if (filters?.kohlenhydratarm) filterTexts.push("KOHLENHYDRATARM / LOW CARB (keine Nudeln, kein Reis, kein Brot, wenig Kartoffeln)");

    const cuisineMap = {
      asiatisch: "Asiatische Küche (Thai, Japanisch, Vietnamesisch, Koreanisch, Indonesisch, Chinesisch — wähle eine SPEZIFISCHE Subküche, nicht generisch 'asiatisch')",
      mediterran: "Mediterrane Küche (Italienisch, Griechisch, Levantinisch, Spanisch — wähle eine SPEZIFISCHE Subküche)",
      orientalisch: "Orientalische Küche (Nahöstlich, Nordafrikanisch, Persisch, Türkisch, Libanesisch — wähle eine SPEZIFISCHE Subküche)",
      oesterreichisch: "Österreichische Küche / Hausmannskost (aber in einer gesunden, leichteren Variante — Knödel, Strudel, Eintöpfe, Aufläufe, Palatschinken, Nockerl, Gemüselaibchen, Erdäpfelgerichte)",
      comfort: "Comfort Food (aber gesund und frisch, nicht deftig — z.B. Bowls, Eintöpfe, Gratins, Ofengerichte)",
      surprise: "Überrasche mich mit einer kreativen, unerwarteten Küche!"
    };

    const mealTypeMap = {
      hauptgericht: "Ein vollwertiges Hauptgericht",
      vorspeise: "Eine leichte Vorspeise oder ein frischer Salat (nicht zu sättigend, als Starter oder leichte Mahlzeit)",
      suppe: "Eine leckere Suppe (cremig, klar oder Eintopf-artig — wärmend und aromatisch)",
      dessert_gesund: "Ein gesundes Dessert (ohne raffinierten Zucker, natürlich gesüßt, z.B. Energy Balls, Datteln, Nüsse, Joghurt-Nachspeisen, Früchte)",
      dessert_ungesund: "Ein leckeres Genuss-Dessert (darf Mehl, Zucker, Eier, Mascarpone, Butter enthalten — purer Genuss!)",
      smoothie: "Ein grüner/gesunder Smoothie (mit Gemüse, Obst, Kernen, Superfoods)",
      snack: "Ein gesunder Snack (sättigend, proteinreich, für zwischendurch)"
    };

    // Variation: recent recipes to avoid
    const recentList = (recentRecipes || []).slice(0, 10);
    const avoidText = recentList.length > 0
      ? `\nVERMEIDE WIEDERHOLUNGEN — diese Rezepte wurden kürzlich vorgeschlagen, schlage etwas ANDERES vor (andere Hauptzutat, andere Zubereitungsart, anderer Charakter):
${recentList.map(t => `- ${t}`).join("\n")}`
      : "";

    const prompt = `Du bist ein kreativer, gesundheitsbewusster Koch-Assistent für ein Paar in Berlin Mitte.

${profileText}

${filterTexts.length > 0 ? `ZUSÄTZLICHE EINSCHRÄNKUNGEN:\n${filterTexts.join("\n")}` : ""}

KÜCHENSTIL: ${cuisineMap[cuisine] || "Überrasche mich!"}
MEAL-TYPE: ${mealTypeMap[mealType] || mealTypeMap.hauptgericht}
MAX. ZUBEREITUNGSZEIT: ${maxMinutes || 30} Minuten${ingredientText}
${avoidText}

REGELN FÜR DAS REZEPT:
1. MAXIMAL 8–10 Hauptzutaten (Salz, Pfeffer, Öl zählen nicht). Halte es EINFACH.
2. Kerne und Nüsse (Sonnenblumenkerne, Kürbiskerne, Walnüsse, Pinienkerne, Sesam etc.) als OPTIONALES TOPPING in den Tipps erwähnen — nicht als Hauptzutat auflisten, es sei denn sie sind zentral fürs Gericht.
3. HALTE DICH STRIKT an den gewählten Küchenstil. Kein Tahini bei italienischen Gerichten, kein Sojasauce bei österreichischen.
4. Moderate Schärfe — nicht zu scharf, aber gerne aromatisch gewürzt.
5. VARIIERE die Hauptzutaten: nicht immer Süßkartoffel, nicht immer Tahini, nicht immer Kichererbsen. Nutze die ganze Bandbreite an Gemüse, Hülsenfrüchten und Getreiden.
6. Einfach und schnell zuzubereiten.
7. Zutaten müssen in Berlin Mitte leicht erhältlich sein (Supermarkt, Biomarkt, asiatischer Laden).
8. Ausgewogen, eiweißreich, ballaststoffreich.
9. Weniger einfache Kohlenhydrate, weniger Salz, frisch und nicht hochverarbeitet.
10. Saisonales Gemüse bevorzugen (aktueller Monat: ${new Date().toLocaleString('de-DE', { month: 'long' })}).
11. Sei KREATIV — schlage Gerichte vor, die man nicht sofort auf Google findet. Überrasche uns!

Antworte AUSSCHLIESSLICH im folgenden JSON-Format (kein anderer Text):
{
  "title": "Name des Gerichts",
  "subtitle": "Kurze appetitliche Beschreibung (1 Satz)",
  "prepTime": "Zubereitungszeit in Minuten als Zahl",
  "servings": "Anzahl Portionen",
  "tags": ["tag1", "tag2", "tag3"],
  "nutrition": {
    "calories": "ca. kcal pro Portion",
    "protein": "ca. g Eiweiß pro Portion",
    "fiber": "ca. g Ballaststoffe pro Portion"
  },
  "ingredients": [
    {"amount": "Menge", "unit": "Einheit", "name": "Zutat"}
  ],
  "steps": [
    "Schritt 1",
    "Schritt 2"
  ],
  "tips": "Optionaler Tipp oder Variation (Kerne/Nüsse als Topping hier erwähnen)",
  "healthNote": "Kurzer Hinweis warum das Gericht gut für euer Profil ist"
}`;

    const { aiCall } = await import("./ai-router.js");

    let recipe, usedModel;
    try {
      const result = await aiCall("creative", prompt, 2000);
      recipe = result.recipe;
      usedModel = result.usedModel;
    } catch (e) {
      console.error("AI error:", e.message);
      return new Response(JSON.stringify({ error: "Rezept konnte nicht generiert werden", details: e.message }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(recipe), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "Interner Fehler", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/generate-recipe"
};
