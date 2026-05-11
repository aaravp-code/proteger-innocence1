const START_BILLES = 10;

let stopIndex = 0;
let billes = START_BILLES;

const screens = {
  intro: document.getElementById("intro-screen"),
  map: document.getElementById("map-screen"),
  stop: document.getElementById("stop-screen"),
  result: document.getElementById("result-screen")
};

const stops = [
  {
    title: "Paris",
    bg: "stop-1-paris",
    scene: "Les nazis ont fait de Paris un endroit dangereux. Joseph et Maurice doivent quitter Paris.",
    choices: [
      ["Rester avec la famille", "caught"],
      ["Partir avec Maurice avec presque rien", "safe", 1],
      ["Partir avec Maurice avec les affaires personelles", "safe", 3],
      ["Partir sans écouter le père", "safe", 4]
    ]
  },
  {
    title: "Dax / Interrogation",
    bg: "stop-2-dax",
    scene: "Les nazis montent dans le train. Ils doivent cacher leur vraie identité.",
    choices: [
      ["Dire la vérité pour éviter les risques", "caught"],
      ["Paniquer et trop parler", "caught"],
      ["Mentir calmement", "safe", 3],
      ["Laisser Maurice répondre", "safe", 4],
      ["Répondre avec colère pour sembler fort", "safe", 5]
    ]
  },
  {
    title: "Ligne de démarcation",
    bg: "stop-3-ligne-demarcation",
    scene: "Ils sont arrivés à la frontière pour fuir la zone occupée. Ils doivent traverser sans être vu.",
    choices: [
      ["Courir sans attendre", "caught"],
      ["Suivre le passeur en silence", "safe", 2],
      ["Attendre plus longtemps", "safe", 3],
      ["Se séparer pour aller plus vite", "safe", 4],
      ["Aider d’autres personnes", "safe", 5]
    ]
  },
  {
    title: "Hôtel Excelsior / Nice",
    bg: "stop-4-hotel-excelsior",
    scene: "Ils sont au cœur du danger. Ils ont été arrêtés et sont actuellement interrogés",
    choices: [
      ["Admettre leur identité pour éviter une punition sévère", "caught"],
      ["Refuser de partir sans les parents", "caught"],
      ["Continue à mentir, accepter l’aide, et partir", "safe", 3],
      ["Fuir seul", "safe", 4],
      ["Chercher les parents", "safe", 5]
    ]
  },
  {
    title: "Retour à Paris",
    bg: "stop-5-retour-paris",
    scene: "Ils ont survécu, mais tout a changé à leur retour.",
    choices: [
      ["Faire comme si tout était normal", "safe", 3],
      ["Garder le souvenir", "win", 1],
      ["Oublier pour ne plus souffrir", "bad", 2],
      ["Rester bloqué dans le passé", "bad", 4]
    ]
  }
];

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function bg(id, name) {
  const element = document.getElementById(id);
  const formats = ["jpg", "jpeg", "png"];
  let found = false;

  formats.forEach(format => {
    if (found) return;

    const img = new Image();
    img.onload = () => {
      if (!found) {
        found = true;
        element.style.backgroundImage = `url("assets/backgrounds/${name}.${format}?v=${Date.now()}")`;
      }
    };
    img.src = `assets/backgrounds/${name}.${format}?v=${Date.now()}`;
  });
}

function updateBilles() {
  const counters = [
    document.getElementById("billes-counter"),
    document.getElementById("stop-billes-counter")
  ];

  counters.forEach(counter => {
    counter.innerHTML = "";
    for (let i = 0; i < START_BILLES; i++) {
      const img = document.createElement("img");
      img.src = "assets/icons/bille-full.png";
      img.className = i < billes ? "bille" : "bille lost";
      counter.appendChild(img);
    }
  });
}

function updateMap() {
  bg("map-bg", "main-map");
  updateBilles();

  stops.forEach((stop, i) => {
    const point = document.getElementById(`point-${i}`);
    point.disabled = i !== stopIndex;
    point.className = "map-point";

    if (i < stopIndex) point.classList.add("completed");
    else if (i === stopIndex) point.classList.add("current");
    else point.classList.add("locked");
  });

  document.getElementById("map-instruction").textContent =
    `Prochaine étape: ${stops[stopIndex]?.title || "terminé"}`;

  show("map");
}

function openStop(i) {
  if (i !== stopIndex) return;

  const stop = stops[i];

  bg("stop-bg", stop.bg);
  updateBilles();

  document.getElementById("stop-number").textContent = `Étape ${i + 1} / 5`;
  document.getElementById("stop-title").textContent = stop.title;
  document.getElementById("stop-scene").textContent = stop.scene;

  const box = document.getElementById("choices-container");
  box.innerHTML = "";

  stop.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice[0];
    btn.onclick = () => choose(choice);
    box.appendChild(btn);
  });

  show("stop");
}

function choose(choice) {
  const [text, type, cost = 0] = choice;

  if (type === "caught") {
    return result("Vous avez été découvert.", "Une seule erreur peut tout changer.", true);
  }

  billes -= cost;

  if (billes < 0) {
    return result("Il ne reste plus de billes.", "L’enfance est déjà brisée.", true);
  }

  if (type === "win") {
    return result("Vous avez survécu!", `Billes restantes : ${billes}. Mais l'enfance est perdue.`, true);
  }

  if (type === "bad") {
    return result("Vous avez perdu", "Vous survivez, mais quelque chose reste brisé.", true);
  }

  stopIndex++;
  result(`${cost} bille${cost > 1 ? "s" : ""} perdue${cost > 1 ? "s" : ""}`, "Vous continuez le voyage.", false);
}

function result(title, message, restart) {
  bg("result-bg", "main-map");

  document.getElementById("result-eyebrow").textContent = "Résultat";
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-message").textContent = message;
  document.getElementById("result-extra").textContent = "";

  const btn = document.getElementById("result-btn");
  btn.textContent = restart ? "Recommencer" : "Retour à la carte";
  btn.onclick = restart ? reset : updateMap;

  updateBilles();
  show("result");
}

function reset() {
  stopIndex = 0;
  billes = START_BILLES;
  show("intro");
}

document.getElementById("start-btn").onclick = updateMap;
document.getElementById("back-to-map-btn").onclick = updateMap;

for (let i = 0; i < stops.length; i++) {
  document.getElementById(`point-${i}`).onclick = () => openStop(i);
}

reset();