const FAVORITES = [
  // ── HAUPTGERICHTE ──
  {
    id: "vogerlsalat", title: "Vogerlsalat mit Kürbiskernöl & Knoblauch",
    subtitle: "Österreichischer Klassiker — optional mit Ei & Kartoffeln",
    tags: ["schnell", "österreichisch", "Lola+Luki"], note: "🧀 Luki ohne Käse-Topping",
    prepTime: "15", servings: "2", cuisine: "oesterreichisch", mealType: "vorspeise", link: null,
    ingredients: [
      {amount:"200",unit:"g",name:"Feldsalat (Vogerlsalat)"},{amount:"3",unit:"EL",name:"Steirisches Kürbiskernöl"},
      {amount:"2",unit:"EL",name:"Weißweinessig"},{amount:"1",unit:"",name:"Knoblauchzehe, fein gehackt"},
      {amount:"1",unit:"Prise",name:"Salz & Pfeffer"},{amount:"2",unit:"",name:"Eier (optional, hartgekocht)"},
      {amount:"300",unit:"g",name:"Kartoffeln (optional, gekocht & gewürfelt)"}
    ],
    steps: ["Feldsalat waschen und trocken schleudern.","Dressing: Kürbiskernöl, Weißweinessig, Knoblauch, Salz & Pfeffer verrühren.","Optional: Kartoffeln kochen, würfeln, noch warm zum Salat geben.","Optional: Eier hartkochen, vierteln, dazu legen.","Dressing über den Salat geben, sofort servieren."],
    tips: "Am besten mit warmem Kartoffelsalat servieren — das Kürbiskernöl entfaltet sich dann besonders gut."
  },
  {id:"pasta-alla-norma",title:"Pasta alla Norma",subtitle:"Sizilianische Auberginen-Pasta mit Ricotta Salata",tags:["mediterran","italienisch","Lola-Solo"],note:"🧀 Ricotta Salata nur für Lola — Luki ohne Käse servieren",prepTime:"30",servings:"2",cuisine:"mediterran",mealType:"hauptgericht",link:"https://www.madamecuisine.de/pasta-alla-norma/"},
  {
    id:"ratatouille",title:"Ratatouille",subtitle:"Provenzalisches Ofengemüse — bunt, gesund, aromatisch",
    tags:["mediterran","französisch","Lola+Luki","ofengericht"],prepTime:"25",servings:"2",cuisine:"mediterran",mealType:"hauptgericht",link:null,
    ingredients:[{amount:"1",unit:"",name:"Aubergine, gewürfelt"},{amount:"2",unit:"",name:"Zucchini, gewürfelt"},{amount:"1",unit:"",name:"rote Paprika, gewürfelt"},{amount:"1",unit:"",name:"gelbe Paprika, gewürfelt"},{amount:"400",unit:"g",name:"stückige Tomaten (Dose)"},{amount:"1",unit:"",name:"Zwiebel, gewürfelt"},{amount:"3",unit:"",name:"Knoblauchzehen, gehackt"},{amount:"3",unit:"EL",name:"Olivenöl"},{amount:"1",unit:"TL",name:"Herbes de Provence"},{amount:"",unit:"",name:"Frischer Basilikum, Salz, Pfeffer"}],
    steps:["Ofen auf 200°C vorheizen.","Zwiebel und Knoblauch in Olivenöl anschwitzen.","Aubergine, Zucchini, Paprika dazugeben, 5 Min anbraten.","Stückige Tomaten und Kräuter unterrühren.","In eine Auflaufform geben, 20 Min im Ofen backen.","Mit frischem Basilikum servieren."],
    tips:"Dazu passt Baguette, Reis oder Quinoa. Noch besser am nächsten Tag!"
  },
  {
    id:"rote-linsen-curry",title:"Rote Linsen Curry",subtitle:"Cremiges Dal mit Kokosmilch und Reis",
    tags:["indisch","vegan","Lola+Luki","eiweißreich"],prepTime:"25",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",
    link:"https://www.kitchenstories.com/de/rezepte/roter-linseneintopf-9be3",
    ingredients:[{amount:"200",unit:"g",name:"rote Linsen"},{amount:"400",unit:"ml",name:"Kokosmilch"},{amount:"200",unit:"ml",name:"Gemüsebrühe"},{amount:"1",unit:"",name:"Zwiebel, gewürfelt"},{amount:"2",unit:"",name:"Knoblauchzehen, gehackt"},{amount:"1",unit:"Stück",name:"Ingwer (daumengroß), gerieben"},{amount:"2",unit:"TL",name:"Currypulver"},{amount:"1",unit:"TL",name:"Kurkuma"},{amount:"1",unit:"",name:"Dose stückige Tomaten"},{amount:"2",unit:"EL",name:"Kokosöl"},{amount:"",unit:"",name:"Reis als Beilage"}],
    steps:["Rote Linsen waschen und abtropfen lassen. Reis aufsetzen.","Zwiebel, Knoblauch und Ingwer in Kokosöl anschwitzen.","Currypulver und Kurkuma kurz mitrösten.","Linsen, Tomaten, Kokosmilch und Brühe dazugeben.","15–20 Min köcheln lassen bis die Linsen weich sind.","Mit Salz, Pfeffer und Limettensaft abschmecken."],
    tips:"Extra-Eiweiß: Kichererbsen dazugeben. Für Lola: mit gerösteten Kürbiskernen toppen (Eisen!)."
  },
  {id:"pad-thai",title:"Pad Thai mit Tofu",subtitle:"Thailändischer Klassiker mit Reisnudeln und Erdnüssen",tags:["asiatisch","thai","vegan-möglich","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://www.kitchenstories.com/de/rezepte/pad-thai-salat-mit-tofu"},
  {
    id:"asiatische-gemusepfanne",title:"Asiatische Gemüsepfanne",subtitle:"Schnelles Wok-Gemüse mit Sojasauce und Sesam",
    tags:["asiatisch","schnell","vegan","Lola+Luki"],prepTime:"20",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:null,
    ingredients:[{amount:"1",unit:"",name:"Brokkoli, in Röschen"},{amount:"2",unit:"",name:"Karotten, in Streifen"},{amount:"1",unit:"",name:"Paprika, in Streifen"},{amount:"200",unit:"g",name:"Zuckerschoten oder Edamame"},{amount:"200",unit:"g",name:"Tofu, gewürfelt"},{amount:"3",unit:"EL",name:"Sojasauce"},{amount:"1",unit:"EL",name:"Sesamöl"},{amount:"1",unit:"Stück",name:"Ingwer, gerieben"},{amount:"2",unit:"",name:"Knoblauchzehen"},{amount:"",unit:"",name:"Sesam & Frühlingszwiebeln zum Toppen"},{amount:"",unit:"",name:"Reis oder Nudeln als Beilage"}],
    steps:["Tofu in Würfel schneiden und in Sesamöl knusprig anbraten, rausnehmen.","Knoblauch und Ingwer kurz anbraten.","Hartes Gemüse zuerst (Karotten, Brokkoli), dann weiches Gemüse dazu.","Mit Sojasauce ablöschen, Tofu zurück dazu.","Mit Sesam und Frühlingszwiebeln toppen, mit Reis servieren."],
    tips:"Für Luki: statt Tofu auch Garnelen oder Lachs möglich."
  },
  {
    id:"pasta-al-limone",title:"Pasta al Limone",subtitle:"Zitronige Pasta — optional mit Scampi",
    tags:["mediterran","italienisch","schnell","Lola+Luki"],note:"🦐 Scampi-Ausnahme auch für Lola!",
    prepTime:"20",servings:"2",cuisine:"mediterran",mealType:"hauptgericht",link:null,
    ingredients:[{amount:"250",unit:"g",name:"Spaghetti oder Linguine"},{amount:"2",unit:"",name:"Bio-Zitronen (Saft + Abrieb)"},{amount:"3",unit:"EL",name:"Olivenöl"},{amount:"2",unit:"",name:"Knoblauchzehen"},{amount:"200",unit:"g",name:"Scampi (optional)"},{amount:"1",unit:"Prise",name:"Chiliflocken"},{amount:"",unit:"",name:"Frischer Basilikum, Salz, Pfeffer"}],
    steps:["Pasta in Salzwasser al dente kochen, Pastawasser auffangen.","Knoblauch in Olivenöl sanft anschwitzen.","Optional: Scampi kurz anbraten, rausnehmen.","Zitronensaft, Abrieb und 2–3 EL Pastawasser in die Pfanne.","Pasta dazu, schwenken bis eine cremige Sauce entsteht.","Scampi zurück dazu, mit Basilikum und Chiliflocken servieren."],
    tips:"Für Extra-Cremigkeit: einen Schuss Hafercreme dazu."
  },
  {id:"menemen-shakshuka",title:"Menemen / Shakshuka",subtitle:"Orientalische Eierpfanne in würziger Tomatensauce",tags:["orientalisch","türkisch","schnell","Lola+Luki"],note:"🧀 Feta nur für Lola dazugeben",prepTime:"20",servings:"2",cuisine:"orientalisch",mealType:"hauptgericht",link:"https://www.fitforfun.de/rezepte/shakshuka-mit-feta"},
  {id:"chili-sin-carne",title:"Chili sin Carne mit Süßkartoffel",subtitle:"Würziges Bohnen-Chili — vegan und voller Eiweiß",tags:["vegan","eiweißreich","mexikanisch","Lola+Luki"],prepTime:"30",servings:"2",cuisine:"comfort",mealType:"hauptgericht",link:"https://www.kitchenstories.com/de/rezepte/susskartoffel-bohnen-chili"},
  {id:"soba-nudel-salat",title:"Soba-Nudel Salat mit Tofu & Miso",subtitle:"Japanisch inspirierter Nudelsalat — kalt oder warm",tags:["asiatisch","japanisch","vegan","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://www.kitchenstories.com/de/rezepte/sobanudeln-mit-tofu-in-miso-marinade-und-gemuse"},
  {id:"susskartoffel-linsen-suppe",title:"Süßkartoffel-Linsen Suppe mit Curry",subtitle:"Cremige Wohlfühlsuppe — wärmend und sättigend",tags:["indisch","suppe","vegan","Lola+Luki","eiweißreich"],prepTime:"25",servings:"2",cuisine:"asiatisch",mealType:"suppe",link:"https://www.kitchenstories.com/de/rezepte/susskartoffel-linsensuppe-mit-curry"},
  {id:"wraps-burritos",title:"Würzige Wraps / Burritos mit Avocado",subtitle:"Gefüllte Tortillas — schnell, sättigend, anpassbar",tags:["mexikanisch","schnell","Lola+Luki"],prepTime:"20",servings:"2",cuisine:"comfort",mealType:"hauptgericht",link:"https://www.kitchenstories.com/de/rezepte/wurzige-burritos-mit-avocado"},
  {id:"rote-beete-carpaccio",title:"Rote Beete Carpaccio mit Kräutern",subtitle:"Elegant, frisch und voller Nährstoffe",tags:["mediterran","schnell","vorspeise","Lola-Solo"],note:"🧀 Mit Feta für Lola. Für Luki: ohne Käse, mit Kürbiskernen",prepTime:"15",servings:"2",cuisine:"mediterran",mealType:"vorspeise",link:"https://www.slowlyveggie.de/rezepte/rote-bete-salat-mit-feta-einfach-so-lecker"},
  {id:"taboule",title:"Taboulé",subtitle:"Libanesischer Petersilien-Bulgur-Salat — frisch & zitronig",tags:["orientalisch","schnell","vegan","Lola+Luki"],prepTime:"15",servings:"2",cuisine:"orientalisch",mealType:"vorspeise",link:"https://www.kitchenstories.com/de/rezepte/tabbouleh-de"},
  {id:"nudeln-avocado-pesto",title:"Nudeln mit Avocado-Pesto",subtitle:"Cremiges Pesto ohne Käse — schnell und gesund",tags:["italienisch","schnell","vegan","Lola+Luki"],prepTime:"15",servings:"2",cuisine:"mediterran",mealType:"hauptgericht",link:"https://www.kitchenstories.com/de/rezepte/nudeln-mit-avocado-pesto-2a4a"},
  {id:"aubergine-minze-granatapfel",title:"Gebackene Aubergine mit Minze & Granatapfel",subtitle:"Ottolenghi-inspiriert — orientalisch und aromatisch",tags:["orientalisch","ottolenghi","ofengericht","Lola-Solo"],note:"🧀 Originalrezept mit Zitronenjoghurt — für Luki: Tahinisauce statt Joghurt",prepTime:"30",servings:"2",cuisine:"orientalisch",mealType:"hauptgericht",link:"https://www.bildderfrau.de/diaet-ernaehrung/article210764889/Gebackene-Aubergine-mit-Zitronenjoghurt-und-Minze.html"},
  {id:"ofenkuerbis-kichererbsen",title:"Ofenkürbis mit Kichererbsen und Avocado",subtitle:"Herbstliches Ofengericht — eiweißreich und sättigend",tags:["orientalisch","ofengericht","vegan","Lola+Luki","eiweißreich"],prepTime:"30",servings:"2",cuisine:"orientalisch",mealType:"hauptgericht",link:"https://www.fitforfun.de/rezepte/ofenkuerbis-mit-kichererbsen-und-avocado"},
  {id:"kichererbsen-linsen-salat",title:"Kichererbsen-Linsen-Salat mit Halloumi",subtitle:"Warmer Salat voller Eiweiß und Ballaststoffe",tags:["mediterran","eiweißreich","Lola-Solo"],note:"🧀 Halloumi nur für Lola — Luki: mit gerösteten Kürbiskernen statt Käse",prepTime:"25",servings:"2",cuisine:"mediterran",mealType:"hauptgericht",link:"https://www.fitforfun.de/rezepte/wuerziger-kichererbsen-linsen-salat-mit-halloumi"},
  {id:"couscous-susskartoffel-salat",title:"Couscous-Süßkartoffel-Salat",subtitle:"Bunter Salat — süß, herzhaft, sättigend",tags:["orientalisch","schnell","vegan","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"orientalisch",mealType:"hauptgericht",link:"https://www.fitforfun.de/rezepte/couscous-suesskartoffel-salat"},
  {id:"kuerbissuppe",title:"Kürbissuppe",subtitle:"Cremig, wärmend, simpel — der Herbstklassiker",tags:["suppe","vegan","schnell","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"comfort",mealType:"suppe",link:"https://www.fitforfun.de/rezepte/easy-peasy-kuerbissuppe"},
  {id:"ofengemuese-feta",title:"Ofengemüse mit Feta",subtitle:"Buntes Gemüse aus dem Ofen — einfach und aromatisch",tags:["mediterran","ofengericht","Lola-Solo"],note:"🧀 Feta nur für Lola — Luki: mit Tahini-Dressing statt Käse",prepTime:"30",servings:"2",cuisine:"mediterran",mealType:"hauptgericht",link:"https://www.slowlyveggie.de/rezepte/ofengemuese-mit-feta-einfach-schnell"},
  {id:"palak-paneer-vegan",title:"Veganes Palak Paneer",subtitle:"Indischer Spinat-Klassiker — vegan und cremig",tags:["indisch","vegan","eiweißreich","Lola+Luki"],prepTime:"30",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://www.slowlyveggie.de/rezepte/veganes-palak-paneer-so-lecker-wie-das-original"},
  {id:"thai-curry-veg",title:"Vegetarisches Thai-Curry",subtitle:"Cremiges Curry mit Kokosmilch und buntem Gemüse",tags:["asiatisch","thai","vegan","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://www.slowlyveggie.de/rezepte/vegetarisches-thai-curry-rezept-mit-gemuese-kokosmilch"},
  {id:"poke-bowl-vegan",title:"Vegane Poke Bowl",subtitle:"Bunte Bowl mit Edamame, Avocado und Sesam-Dressing",tags:["asiatisch","bowl","vegan","Lola+Luki"],prepTime:"20",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://www.slowlyveggie.de/rezepte/vegane-poke-bowl-gesund-so-einfach"},
  {id:"gefuellte-auberginen",title:"Gefüllte Auberginen",subtitle:"Orientalisch gewürzt — herzhaft und sättigend",tags:["orientalisch","ofengericht","Lola+Luki"],prepTime:"30",servings:"2",cuisine:"orientalisch",mealType:"hauptgericht",link:"https://www.slowlyveggie.de/rezepte/gefuellte-auberginen-vegetarisch-einfach-so-wuerzig"},
  {id:"nasi-goreng",title:"Vegetarisches Nasi Goreng",subtitle:"Indonesischer gebratener Reis mit Gemüse und Ei",tags:["asiatisch","indonesisch","schnell","Lola+Luki"],prepTime:"20",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://www.slowlyveggie.de/rezepte/vegetarisches-nasi-goreng-einfach-schnell"},
  {
    id:"karotten-lauch-suppe",title:"Karotten-Lauch Suppe",subtitle:"Sanfte Suppe — cremig und wärmend",
    tags:["suppe","vegan","schnell","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"comfort",mealType:"suppe",link:null,
    ingredients:[{amount:"4",unit:"",name:"große Karotten, gewürfelt"},{amount:"2",unit:"",name:"Stangen Lauch, in Ringen"},{amount:"1",unit:"",name:"Kartoffel, gewürfelt"},{amount:"750",unit:"ml",name:"Gemüsebrühe"},{amount:"1",unit:"",name:"Zwiebel"},{amount:"2",unit:"EL",name:"Olivenöl"},{amount:"1",unit:"Prise",name:"Muskatnuss"},{amount:"",unit:"",name:"Salz, Pfeffer, frische Kräuter"}],
    steps:["Zwiebel und Lauch in Olivenöl anschwitzen.","Karotten und Kartoffel dazugeben, kurz mitbraten.","Mit Gemüsebrühe aufgießen, 20 Min köcheln lassen.","Pürieren, mit Muskatnuss, Salz und Pfeffer abschmecken.","Mit Kürbiskernen und einem Schuss Kürbiskernöl servieren."],
    tips:"Für Extra-Eiweiß: rote Linsen mitkochen."
  },
  {
    id:"fenchelsalat-orangen",title:"Fenchelsalat mit Orangen & Pinienkernen",subtitle:"Frisch, knackig, mediterran — perfekt als Vorspeise",
    tags:["mediterran","schnell","vorspeise","Lola+Luki"],prepTime:"15",servings:"2",cuisine:"mediterran",mealType:"vorspeise",link:null,
    ingredients:[{amount:"2",unit:"",name:"Fenchel, fein gehobelt"},{amount:"2",unit:"",name:"Orangen, filetiert"},{amount:"2",unit:"EL",name:"Pinienkerne, geröstet"},{amount:"3",unit:"EL",name:"Olivenöl"},{amount:"1",unit:"EL",name:"Zitronensaft"},{amount:"",unit:"",name:"Fenchelgrün, Salz, Pfeffer"}],
    steps:["Fenchel waschen, halbieren und in feine Scheiben hobeln.","Orangen schälen und filetieren, Saft auffangen.","Pinienkerne in einer Pfanne ohne Öl rösten.","Dressing aus Olivenöl, Zitronensaft, Orangensaft, Salz & Pfeffer.","Alles anrichten, mit Pinienkernen und Fenchelgrün toppen."],
    tips:"Auch super als Beilage zu Pasta al Limone."
  },
  {
    id:"fenchelsuppe",title:"Fenchelsuppe",subtitle:"Sanft und aromatisch — mit einer Prise Anis",
    tags:["suppe","mediterran","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"mediterran",mealType:"suppe",link:null,
    ingredients:[{amount:"2",unit:"",name:"große Fenchel, gewürfelt"},{amount:"1",unit:"",name:"Kartoffel, gewürfelt"},{amount:"1",unit:"",name:"Zwiebel"},{amount:"600",unit:"ml",name:"Gemüsebrühe"},{amount:"100",unit:"ml",name:"Hafercreme"},{amount:"2",unit:"EL",name:"Olivenöl"},{amount:"",unit:"",name:"Salz, Pfeffer, Fenchelgrün"}],
    steps:["Zwiebel in Olivenöl anschwitzen, Fenchel und Kartoffel dazu.","Mit Gemüsebrühe aufgießen, 20 Min köcheln.","Pürieren, Hafercreme einrühren.","Mit Fenchelgrün und gerösteten Kernen servieren."],
    tips:"Ein Schuss Pernod oder Pastis gibt eine feine Anisnote."
  },
  {id:"bun-chay",title:"Bún Chay — Vietnamesischer Reisnudel-Salat",subtitle:"Frisch, kräuterig, leicht — voller Aromen",tags:["asiatisch","vietnamesisch","vegan","Lola+Luki"],prepTime:"25",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:"https://cheapandcheerfulcooking.com/bun-chay-vietnamesischer-reisnudel-salat/"},
  {
    id:"gerosteter-blumenkohl",title:"Gerösteter Blumenkohl",subtitle:"Knusprig aus dem Ofen — mit Gewürzen und Tahini",
    tags:["orientalisch","ottolenghi","ofengericht","vegan","Lola+Luki"],prepTime:"30",servings:"2",cuisine:"orientalisch",mealType:"hauptgericht",link:null,
    ingredients:[{amount:"1",unit:"",name:"großer Blumenkohl, in Röschen"},{amount:"3",unit:"EL",name:"Olivenöl"},{amount:"1",unit:"TL",name:"Kurkuma"},{amount:"1",unit:"TL",name:"Kreuzkümmel"},{amount:"1",unit:"TL",name:"Paprikapulver"},{amount:"2",unit:"EL",name:"Tahini"},{amount:"1",unit:"",name:"Zitrone"},{amount:"",unit:"",name:"Granatapfelkerne, frische Kräuter, Pinienkerne"}],
    steps:["Ofen auf 220°C vorheizen.","Blumenkohl mit Olivenöl und Gewürzen mischen.","Auf ein Backblech verteilen, 25 Min rösten bis goldbraun.","Tahini mit Zitronensaft und etwas Wasser zu einem Dressing verrühren.","Blumenkohl mit Tahini-Dressing, Granatapfelkernen und Kräutern servieren."],
    tips:"Ottolenghi-Style: mit Chermoula und Pinienkernen toppen."
  },
  {
    id:"mie-goreng",title:"Mie Goreng",subtitle:"Indonesische gebratene Nudeln — würzig und schnell",
    tags:["asiatisch","indonesisch","schnell","Lola+Luki"],prepTime:"20",servings:"2",cuisine:"asiatisch",mealType:"hauptgericht",link:null,
    ingredients:[{amount:"200",unit:"g",name:"Mie-Nudeln (oder Ramen)"},{amount:"200",unit:"g",name:"Gemüse (Pak Choi, Karotten, Paprika)"},{amount:"2",unit:"EL",name:"Kecap Manis (süße Sojasauce)"},{amount:"1",unit:"EL",name:"Sojasauce"},{amount:"1",unit:"EL",name:"Sesamöl"},{amount:"2",unit:"",name:"Knoblauchzehen"},{amount:"1",unit:"Stück",name:"Ingwer"},{amount:"2",unit:"",name:"Eier (optional)"},{amount:"",unit:"",name:"Frühlingszwiebeln, Limette"}],
    steps:["Nudeln nach Packung kochen, abgießen.","Knoblauch und Ingwer in Sesamöl anbraten.","Gemüse dazu, 3-4 Min pfannenrühren.","Nudeln, Kecap Manis und Sojasauce dazu, alles gut vermengen.","Optional: Eier in der Mitte der Pfanne verquirlen.","Mit Frühlingszwiebeln und Limette servieren."],
    tips:"Für Luki: auch mit Garnelen super. Kecap Manis gibt's im Asia-Laden."
  },
  {id:"horiatiki-hummus",title:"Griechischer Salat mit Hummus",subtitle:"Klassischer Horiatiki — frisch und sommerlich",tags:["mediterran","griechisch","schnell","Lola-Solo"],note:"🧀 Feta nur für Lola — Luki: mit extra Hummus statt Käse",prepTime:"15",servings:"2",cuisine:"mediterran",mealType:"vorspeise",link:"https://thelemonapron.com/horiatiki-salad-hummus/"},

  // ── SMOOTHIES ──
  {
    id:"evergreen-smoothie",title:"Evergreen Smoothie",subtitle:"Grüner Power-Smoothie mit Spinat, Avocado & Banane",
    tags:["vegan","schnell","eiweißreich","Lola+Luki"],prepTime:"5",servings:"2",cuisine:"comfort",mealType:"smoothie",link:null,
    ingredients:[{amount:"1",unit:"Handvoll",name:"Spinat (oder Feldsalat)"},{amount:"1",unit:"",name:"Apfel mit Schale"},{amount:"1",unit:"",name:"Banane, geschält"},{amount:"1/4",unit:"",name:"Avocado, geschält & entkernt"},{amount:"1",unit:"",name:"Orange (Saft davon)"},{amount:"1/8",unit:"",name:"Zitrone mit Schale"},{amount:"1",unit:"Daumenkuppe",name:"Ingwer mit Schale"},{amount:"200",unit:"ml",name:"Wasser"}],
    steps:["Zutaten waschen, ggf. schälen und klein schneiden.","Zuerst die weichen Zutaten wie Banane und Avocado in den Mixer geben.","Restliche Zutaten hinzufügen.","Ca. 1 Minute mixen, bis alles cremig ist."],
    tips:"Für Extra-Eiweiß: 1 EL Hanfprotein oder Chiasamen dazu. Für mehr Süße: ein paar Datteln."
  },
  {id:"gruener-smoothie-bianca",title:"Grüner Smoothie (Bianca Zapatka)",subtitle:"Vitaminbombe mit saisonalem Grünzeug",tags:["vegan","schnell","Lola+Luki"],prepTime:"5",servings:"2",cuisine:"comfort",mealType:"smoothie",link:"https://biancazapatka.com/de/gruener-smoothie/"},
  {id:"gruener-smoothie-foodboom",title:"Grüner Smoothie (Foodboom)",subtitle:"Einfacher Einstieg — mild und fruchtig",tags:["vegan","schnell","Lola+Luki"],prepTime:"5",servings:"2",cuisine:"comfort",mealType:"smoothie",link:"https://www.foodboom.de/rezeptsammlungen/gruener-smoothie-rezept"},
  {id:"gruener-smoothie-power",title:"3 Power-Smoothies für die Abwehr",subtitle:"Immunbooster — grün und voller Vitamine",tags:["vegan","schnell","Lola+Luki"],prepTime:"5",servings:"2",cuisine:"comfort",mealType:"smoothie",link:"https://www.naturallygood.de/power-fuer-die-abwehrkraefte-3-leckere-gruene-smoothie-rezepte/"},

  // ── SNACKS ──
  {
    id:"nuesse-snack",title:"Gemischte Nüsse",subtitle:"Der einfachste Protein-Snack — immer griffbereit",
    tags:["vegan","schnell","eiweißreich","Lola+Luki"],prepTime:"0",servings:"2",cuisine:"comfort",mealType:"snack",link:null,
    ingredients:[{amount:"50",unit:"g",name:"Walnüsse"},{amount:"50",unit:"g",name:"Cashews"},{amount:"30",unit:"g",name:"Mandeln"},{amount:"20",unit:"g",name:"Kürbiskerne"},{amount:"1",unit:"Prise",name:"Meersalz (optional)"}],
    steps:["Nüsse und Kerne nach Belieben mischen.","Optional: kurz in der Pfanne ohne Öl rösten für mehr Aroma.","In einem Glas aufbewahren — hält sich wochenlang."],
    tips:"Für Lola: Kürbiskerne extra dazu (Eisen!). Variante: mit getrockneten Cranberries oder Kokos-Chips."
  },
  {
    id:"banane-apfel-biskuit",title:"Banane & Apfel-Geraspel mit Löffelbiskuit",subtitle:"Schneller süßer Snack — einfach und befriedigend",
    tags:["schnell","Lola+Luki"],prepTime:"5",servings:"2",cuisine:"comfort",mealType:"snack",link:null,
    ingredients:[{amount:"2",unit:"",name:"Bananen"},{amount:"1",unit:"",name:"Apfel, fein geraspelt"},{amount:"4-6",unit:"",name:"Löffelbiskuits"},{amount:"1",unit:"Prise",name:"Zimt"}],
    steps:["Apfel waschen und fein raspeln.","Banane in Scheiben schneiden.","Mit Löffelbiskuits auf einem Teller anrichten.","Mit einer Prise Zimt bestreuen."],
    tips:"Auch lecker mit einem Klecks Quark (für Luki) oder Nussmus."
  },
  {
    id:"gruenkohl-chips",title:"Grünkohl-Chips",subtitle:"Knusprig aus dem Ofen — der gesunde Chips-Ersatz",
    tags:["vegan","Lola+Luki"],prepTime:"20",servings:"2",cuisine:"comfort",mealType:"snack",link:null,
    ingredients:[{amount:"200",unit:"g",name:"Grünkohl, gewaschen & trocken"},{amount:"1",unit:"EL",name:"Olivenöl"},{amount:"1",unit:"Prise",name:"Meersalz"},{amount:"",unit:"",name:"Optional: Paprikapulver, Knoblauchpulver, Hefeflocken"}],
    steps:["Ofen auf 150°C vorheizen.","Grünkohl in mundgerechte Stücke zupfen, dicke Stiele entfernen.","Mit Olivenöl und Gewürzen gut vermengen.","Auf ein Backblech verteilen (nicht stapeln!).","15–20 Min backen bis knusprig, nach 10 Min wenden."],
    tips:"Wichtig: wirklich gut trocknen vor dem Backen, sonst werden sie nicht knusprig. Hefeflocken geben einen käsigen Geschmack (Luki-freundlich!)."
  },

  // ── DESSERTS (gesund) ──
  {
    id:"energy-balls",title:"Energy Balls",subtitle:"Gesunde Energiekugeln — ohne Zucker, voller Power",
    tags:["vegan","schnell","zuckerfrei","eiweißreich","Lola+Luki"],prepTime:"15",servings:"12 Stück",cuisine:"comfort",mealType:"dessert_gesund",
    link:"https://emmikochteinfach.de/energy-balls/"
  }
];

const INSPIRATION_SOURCES = [
  {name:"Ottolenghi Rezepte",url:"https://ottolenghi.co.uk/recipes"},
  {name:"The Lemon Apron",url:"https://thelemonapron.com/recipes/"},
  {name:"Zucker&Jagdwurst",url:"https://www.zuckerjagdwurst.com/de"}
];