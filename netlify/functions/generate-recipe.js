export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { profiles, filters, cuisine, mealType, maxMinutes } = await req.json();

    const profileDescriptions = {
      lucas: `Lucas (34, männlich, 1.93m, sehr aktiv, erhöhter Cholesterin, braucht viel Eiweiß, aktiv in Familienplanung):
ISST NICHT: jegliche Art von Käse, Oliven, Kapern, Joghurt-Saucen, Mayonnaise, Innereien, Wurst, Schweinefleisch, Fast Food, deftige Hausmannskost, hochverarbeitete Lebensmittel, Pilze (wenn zusammen mit Lola)
LIEBT: jegliche Art von Gemüse, Fisch (Lachs), Porridge, Quark, Spinat, Bolognese, Nudeln, Reis, Asiatisch, Ottolenghi-Style, ausgefallene Gerichte, Mediterran, Sushi, Curry, Suppe, Gnocchi
BRAUCHT: Große Portionen, viel Eiweiß, cholesterinbewusst (wenig gesättigte Fette), folsäurereich`,

      lola: `Lola (33, weiblich, 1.63m, aktiv, Schilddrüsenunterfunktion, Eisenmangel, niedriger Blutdruck, braucht Eiweiß, aktiv in Familienplanung):
ISST NICHT: Pilze, frittierte Lebensmittel, Fleisch & Fisch, Fast Food, hochverarbeitete Lebensmittel
LIEBT: frische Kräuter, Auberginen, Nüsse, rote Linsen, Gemüse, Oliven, Feta, Halloumi, Mozzarella, Kürbiskernöl, Knödel, Spinat, Strudel, Pesto, Reis, indische Gewürze, Curry, Ratatouille, Ofengerichte, Radicchio, Körnerbrot, Hummus
BRAUCHT: Eisenreich (Hülsenfrüchte, Spinat, Kerne), jodhaltige Lebensmittel, Eiweiß, folsäurereich`
    };

    let profileText = "";
    const activeProfiles = profiles || ["lucas", "lola"];

    if (activeProfiles.includes("lucas") && activeProfiles.includes("lola")) {
      profileText = `Koche für BEIDE zusammen (Schnittmenge):
${profileDescriptions.lucas}

${profileDescriptions.lola}

WICHTIG - Schnittmenge bedeutet:
- Vegetarisch (wegen Lola)
- KEIN Käse, KEINE Oliven, KEINE Kapern (wegen Lucas)
- KEINE Pilze (wegen Lola)
- KEINE Joghurt-Saucen, Mayo (wegen Lucas)
- Viel Eiweiß für beide
- Eisenreich für Lola, cholesterinbewusst für Lucas
- Folsäurereich für beide (Familienplanung)
- Große Portionen (Lucas hat viel Hunger)`;
    } else if (activeProfiles.includes("lucas")) {
      profileText = `Koche NUR für Lucas:\n${profileDescriptions.lucas}\nLucas darf auch Fisch essen wenn er allein isst.`;
    } else if (activeProfiles.includes("lola")) {
      profileText = `Koche NUR für Lola:\n${profileDescriptions.lola}\nLola liebt Käse (Feta, Halloumi, Mozzarella) und Oliven wenn sie allein isst.`;
    }

    const filterTexts = [];
    if (filters?.glutenfrei) filterTexts.push("GLUTENFREI (kein Weizen, Roggen, Gerste, Dinkel)");
    if (filters?.laktosefrei) filterTexts.push("LAKTOSEFREI (keine Milchprodukte)");
    if (filters?.vegan) filterTexts.push("VEGAN (keine tierischen Produkte, kein Ei, keine Milch, kein Honig)");
    if (filters?.salzarm) filterTexts.push("SALZARM (minimal Salz, keine salzigen Zutaten)");
    if (filters?.zuckerfrei) filterTexts.push("ZUCKERFREI (kein zugesetzter Zucker, kein Honig, kein Ahornsirup)");
    if (filters?.kohlenhydratarm) filterTexts.push("KOHLENHYDRATARM / LOW CARB (keine Nudeln, kein Reis, kein Brot, wenig Kartoffeln)");

    const cuisineMap = {
      asiatisch: "Asiatische Küche (Thai, Japanisch, Vietnamesisch, Koreanisch, Indisch)",
      mediterran: "Mediterrane Küche (Italienisch, Griechisch, Levantinisch)",
      orientalisch: "Orientalische Küche (Nahöstlich, Nordafrikanisch, Persisch)",
      comfort: "Comfort Food (aber gesund und frisch, nicht deftig)",
      surprise: "Überrasche mich mit einer kreativen, unerwarteten Küche!"
    };

    const mealTypeMap = {
      hauptgericht: "Ein vollwertiges Hauptgericht",
      dessert_gesund: "Ein gesundes Dessert (ohne raffinierten Zucker, natürlich gesüßt)",
      dessert_ungesund: "Ein leckeres Dessert (darf auch mal Zucker enthalten — Genuss!)",
      smoothie: "Ein grüner/gesunder Smoothie (mit Gemüse, Obst, Kernen, Superfoods)",
      snack: "Ein gesunder Snack (sättigend, proteinreich, für zwischendurch)"
    };

    const prompt = `Du bist ein kreativer, gesundheitsbewusster Koch-Assistent für ein Paar in Berlin Mitte.

${profileText}

${filterTexts.length > 0 ? `ZUSÄTZLICHE EINSCHRÄNKUNGEN:\n${filterTexts.join("\n")}` : ""}

KÜCHENSTIL: ${cuisineMap[cuisine] || "Überrasche mich!"}
MEAL-TYPE: ${mealTypeMap[mealType] || mealTypeMap.hauptgericht}
MAX. ZUBEREITUNGSZEIT: ${maxMinutes || 30} Minuten

ANFORDERUNGEN AN DAS REZEPT:
- Einfach und schnell zuzubereiten
- Zutaten müssen in Berlin Mitte leicht erhältlich sein (Supermarkt, Biomarkt, asiatischer Laden)
- Ausgewogen und gesund
- Viele Ballaststoffe, Kerne und Nüsse (wenn erlaubt)
- Weniger einfache Kohlenhydrate, weniger Salz
- Eiweißreich
- Frisch, nicht hochverarbeitet
- Saisonales Gemüse bevorzugen (aktueller Monat: ${new Date().toLocaleString('de-DE', { month: 'long' })})
- Sei KREATIV und ABWECHSLUNGSREICH — keine Standardgerichte

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
  "tips": "Optionaler Tipp oder Variation",
  "healthNote": "Kurzer Hinweis warum das Gericht gut für euer Profil ist"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(JSON.stringify({ error: "API Fehler", details: errorText }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const recipeText = data.content[0].text;

    let recipe;
    try {
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      recipe = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Rezept konnte nicht verarbeitet werden", raw: recipeText }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
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
