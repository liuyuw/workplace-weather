const storageKey = "workplaceWeather:checkins";
const customCompaniesKey = "workplaceWeather:customCompanies";

const seedCompanies = [
  { id: "google", name: "Google", aliases: ["Alphabet", "Google LLC", "Google Cloud"], industry: "Tech", status: "seeded" },
  { id: "amazon", name: "Amazon", aliases: ["AWS", "Amazon Web Services"], industry: "Tech / Retail", status: "seeded" },
  { id: "microsoft", name: "Microsoft", aliases: ["Microsoft Corporation"], industry: "Tech", status: "seeded" },
  { id: "meta", name: "Meta", aliases: ["Facebook", "Instagram"], industry: "Tech", status: "seeded" },
  { id: "apple", name: "Apple", aliases: ["Apple Inc."], industry: "Tech / Retail", status: "seeded" },
  { id: "tesla", name: "Tesla", aliases: ["Tesla Motors"], industry: "Auto / Tech", status: "seeded" },
  { id: "oracle", name: "Oracle", aliases: ["Oracle Corporation"], industry: "Enterprise Software", status: "seeded" },
  { id: "salesforce", name: "Salesforce", aliases: ["Salesforce.com"], industry: "Enterprise Software", status: "seeded" },
  { id: "nvidia", name: "Nvidia", aliases: ["NVIDIA"], industry: "Semiconductors", status: "seeded" },
  { id: "intel", name: "Intel", aliases: ["Intel Corporation"], industry: "Semiconductors", status: "seeded" },
  { id: "walmart", name: "Walmart", aliases: ["Walmart Inc."], industry: "Retail", status: "seeded" },
  { id: "target", name: "Target", aliases: ["Target Corporation"], industry: "Retail", status: "seeded" },
  { id: "costco", name: "Costco", aliases: ["Costco Wholesale"], industry: "Retail", status: "seeded" },
  { id: "starbucks", name: "Starbucks", aliases: ["Starbucks Coffee"], industry: "Food / Retail", status: "seeded" },
  { id: "home-depot", name: "Home Depot", aliases: ["The Home Depot"], industry: "Retail", status: "seeded" },
  { id: "mcdonalds", name: "McDonald's", aliases: ["McDonalds"], industry: "Food Service", status: "seeded" },
  { id: "ups", name: "UPS", aliases: ["United Parcel Service"], industry: "Logistics", status: "seeded" },
  { id: "fedex", name: "FedEx", aliases: ["Federal Express"], industry: "Logistics", status: "seeded" },
  { id: "delta", name: "Delta Air Lines", aliases: ["Delta", "Delta Airlines"], industry: "Airline", status: "seeded" },
  { id: "united", name: "United Airlines", aliases: ["United"], industry: "Airline", status: "seeded" },
  { id: "jpmorgan", name: "JPMorgan Chase", aliases: ["JP Morgan", "Chase"], industry: "Finance", status: "seeded" },
  { id: "bank-of-america", name: "Bank of America", aliases: ["BofA"], industry: "Finance", status: "seeded" },
  { id: "wells-fargo", name: "Wells Fargo", aliases: ["Wells"], industry: "Finance", status: "seeded" },
  { id: "capital-one", name: "Capital One", aliases: ["CapitalOne"], industry: "Finance", status: "seeded" },
  { id: "deloitte", name: "Deloitte", aliases: ["Deloitte Consulting"], industry: "Consulting", status: "seeded" },
  { id: "accenture", name: "Accenture", aliases: ["Accenture Consulting"], industry: "Consulting", status: "seeded" },
  { id: "pwc", name: "PwC", aliases: ["PricewaterhouseCoopers"], industry: "Consulting", status: "seeded" },
  { id: "ey", name: "EY", aliases: ["Ernst & Young"], industry: "Consulting", status: "seeded" },
  { id: "unitedhealth", name: "UnitedHealth Group", aliases: ["UnitedHealthcare", "Optum"], industry: "Healthcare", status: "seeded" },
  { id: "cvs", name: "CVS Health", aliases: ["CVS", "Aetna"], industry: "Healthcare / Retail", status: "seeded" },
  { id: "arrow-electronics", name: "Arrow Electronics", aliases: ["Arrow", "Arrow Electronics Inc."], industry: "Electronics / Distribution", status: "seeded" }
];

const moodConfig = {
  great: { label: "Sunny", icon: "SUN", className: "sunny", score: 8, line: "Clear skies, actual morale detected." },
  okay: { label: "Mild", icon: "MILD", className: "mild", score: 34, line: "Manageable conditions with scattered meetings." },
  stressed: { label: "Cloudy", icon: "CLD", className: "cloudy", score: 62, line: "Cloud cover building around workload and priorities." },
  burned_out: { label: "Storm", icon: "STM", className: "storm", score: 88, line: "Severe burnout advisory. Avoid unnecessary syncs." }
};

const elements = {
  form: document.querySelector("#checkinForm"),
  company: document.querySelector("#companyInput"),
  suggestions: document.querySelector("#companySuggestions"),
  shift: document.querySelector("#shiftInput"),
  card: document.querySelector("#weatherCard"),
  companyName: document.querySelector("#companyName"),
  weatherIcon: document.querySelector("#weatherIcon"),
  weatherLabel: document.querySelector("#weatherLabel"),
  burnoutScore: document.querySelector("#burnoutScore"),
  summary: document.querySelector("#weatherSummary"),
  checkinCount: document.querySelector("#checkinCount"),
  dreadIndex: document.querySelector("#dreadIndex"),
  trendLabel: document.querySelector("#trendLabel"),
  reasonBar: document.querySelector("#reasonBar"),
  unlockTitle: document.querySelector("#unlockTitle"),
  unlockText: document.querySelector("#unlockText"),
  unlockFill: document.querySelector("#unlockFill"),
  historyGrid: document.querySelector("#forecastGrid"),
  trendChart: document.querySelector("#trendChart"),
  pressureSystems: document.querySelector("#pressureSystems"),
  history: document.querySelector("#historyList"),
  download: document.querySelector("#downloadBtn"),
  copy: document.querySelector("#copyBtn"),
  canvas: document.querySelector("#shareCanvas")
};

let selectedCompany = null;

function loadCheckins() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveCheckins(checkins) {
  localStorage.setItem(storageKey, JSON.stringify(checkins.slice(-50)));
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function loadCustomCompanies() {
  try {
    return JSON.parse(localStorage.getItem(customCompaniesKey) || "[]");
  } catch {
    return [];
  }
}

function saveCustomCompany(company) {
  const companies = loadCustomCompanies();
  if (!companies.some(function sameCompany(item) { return item.id === company.id; })) {
    companies.push(company);
    localStorage.setItem(customCompaniesKey, JSON.stringify(companies.slice(-50)));
  }
}

function allCompanies() {
  return seedCompanies.concat(loadCustomCompanies());
}

function normalizeCompany(value) {
  return value.trim().replace(/\s+/g, " ");
}

function searchableText(company) {
  return [company.name].concat(company.aliases || []).join(" ").toLowerCase();
}

function findCompanyByName(value) {
  const normalized = normalizeCompany(value).toLowerCase();
  return allCompanies().find(function exactCompany(company) {
    return company.name.toLowerCase() === normalized || (company.aliases || []).some(function exactAlias(alias) {
      return alias.toLowerCase() === normalized;
    });
  });
}

function matchingCompanies(value) {
  const query = normalizeCompany(value).toLowerCase();
  if (!query) return seedCompanies.slice(0, 6);
  return allCompanies().filter(function companyMatches(company) {
    return searchableText(company).includes(query);
  }).slice(0, 6);
}

function selectCompany(company) {
  selectedCompany = company;
  elements.company.value = company.name;
  elements.suggestions.innerHTML = "";
  localStorage.setItem("workplaceWeather:lastCompany", company.name);
  renderWeather(company.name);
}

function addWorkplace(name) {
  const companyName = normalizeCompany(name);
  if (!companyName) return null;
  const existing = findCompanyByName(companyName);
  if (existing) {
    selectCompany(existing);
    return existing;
  }
  const company = {
    id: "user-added-" + slugify(companyName),
    name: companyName,
    aliases: [],
    industry: "User added",
    status: "user_added"
  };
  saveCustomCompany(company);
  selectCompany(company);
  return company;
}

function renderCompanySuggestions() {
  const value = normalizeCompany(elements.company.value);
  const matches = matchingCompanies(value);
  const exact = value && findCompanyByName(value);
  const addRow = value && !exact
    ? "<button class=\"company-suggestion add\" type=\"button\" data-add=\"true\"><span><strong>Add \"" + escapeHtml(value) + "\"</strong><small>New workplace, pending normalization</small></span><small>user added</small></button>"
    : "";
  elements.suggestions.innerHTML = matches.map(function suggestion(company) {
    return "<button class=\"company-suggestion\" type=\"button\" data-company-id=\"" + escapeHtml(company.id) + "\"><span><strong>" + escapeHtml(company.name) + "</strong><small>" + escapeHtml((company.aliases || []).slice(0, 2).join(", ") || company.industry) + "</small></span><small>" + escapeHtml(company.status) + "</small></button>";
  }).join("") + addRow;
}

function selectedMood() {
  return new FormData(elements.form).get("mood") || "okay";
}

function selectedReasons() {
  return Array.from(document.querySelectorAll(".reason-grid input:checked")).map(function inputValue(input) {
    return input.value;
  });
}

function companyCheckins(company) {
  const normalized = company.toLowerCase();
  return loadCheckins().filter(function sameCompany(item) {
    return item.company.toLowerCase() === normalized;
  });
}

function seededCheckins(company) {
  const seed = company.split("").reduce(function sumChars(sum, char) {
    return sum + char.charCodeAt(0);
  }, 0);
  const moods = ["great", "okay", "stressed", "burned_out"];
  const reasons = ["meetings", "workload", "unclear priorities", "commute", "manager"];
  const count = 18 + (seed % 19);
  return Array.from({ length: count }, function makeSeed(_, index) {
    const mood = moods[(seed + index * 3) % moods.length];
    return {
      company: company,
      mood: mood,
      reasons: [reasons[(seed + index) % reasons.length]],
      shift: index % 2 ? "start" : "end",
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
      seeded: true
    };
  });
}

function aggregate(company) {
  const real = companyCheckins(company);
  const all = seededCheckins(company).concat(real);
  const average = all.reduce(function sumScores(sum, item) {
    return sum + moodConfig[item.mood].score;
  }, 0) / all.length;
  const topReasons = {};
  all.flatMap(function getReasons(item) {
    return item.reasons || [];
  }).forEach(function countReason(reason) {
    topReasons[reason] = (topReasons[reason] || 0) + 1;
  });
  const mood = average < 22 ? "great" : average < 48 ? "okay" : average < 74 ? "stressed" : "burned_out";
  return {
    company: company,
    count: all.length,
    average: average,
    mood: mood,
    reasons: Object.entries(topReasons).sort(function byCount(a, b) {
      return b[1] - a[1];
    }).slice(0, 4),
    realCount: real.length
  };
}

function seedFor(value) {
  return value.split("").reduce(function sumChars(sum, char) {
    return sum + char.charCodeAt(0);
  }, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function signalHistoryFor(result) {
  const seed = seedFor(result.company);
  return Array.from({ length: 7 }, function makeDay(_, index) {
    const daysAgo = 6 - index;
    const wave = Math.sin((seed + index * 19) / 13) * 11;
    const drift = (index - 3) * 1.8;
    const score = clamp(result.average + wave + drift, 4, 96);
    const mood = score < 22 ? "great" : score < 48 ? "okay" : score < 74 ? "stressed" : "burned_out";
    const date = new Date(Date.now() - daysAgo * 86400000);
    return {
      day: date.toLocaleDateString([], { weekday: "short" }),
      score: score,
      mood: mood
    };
  });
}

function pressureFor(result) {
  const counts = result.reasons.length ? result.reasons : [["meetings", 8], ["workload", 7], ["unclear priorities", 5]];
  const max = counts.reduce(function maxCount(current, entry) {
    return Math.max(current, entry[1]);
  }, 1);
  return counts.map(function makePressure(entry) {
    return {
      name: entry[0],
      value: Math.round((entry[1] / max) * 100)
    };
  });
}

function trendFor(average) {
  if (average < 32) return "improving";
  if (average < 58) return "mixed";
  if (average < 78) return "tense";
  return "critical";
}

function captionFor(result) {
  const config = moodConfig[result.mood];
  return "Today\'s workplace weather at " + result.company + ": " + config.label.toLowerCase() + " with a " + Math.round(result.average) + "% chance of burnout.";
}

function renderWeather(company) {
  const result = aggregate(company || "Your workplace");
  const config = moodConfig[result.mood];
  elements.card.className = "weather-card " + config.className;
  elements.companyName.textContent = result.company;
  elements.weatherIcon.textContent = config.icon;
  elements.weatherLabel.textContent = config.label;
  elements.burnoutScore.textContent = Math.round(result.average) + "%";
  elements.summary.textContent = config.line + " " + (result.realCount ? "Your check-in is included in the local prototype." : "Submit a check-in to add your own signal.");
  elements.checkinCount.textContent = String(result.count);
  elements.dreadIndex.textContent = (result.average / 10).toFixed(1);
  elements.trendLabel.textContent = trendFor(result.average);
  elements.reasonBar.innerHTML = result.reasons.length
    ? result.reasons.map(function reasonPill(entry) {
        return "<span class=\"reason-pill\">" + escapeHtml(entry[0]) + " · " + entry[1] + "</span>";
      }).join("")
    : "<span class=\"reason-pill\">no signals yet</span>";
  renderUnlock(result);
  renderSignalHistory(result);
  renderTrend(result);
  return result;
}

function renderUnlock(result) {
  const threshold = 50;
  const progress = Math.min(result.count, threshold);
  const remaining = Math.max(threshold - result.count, 0);
  elements.unlockFill.style.width = Math.round((progress / threshold) * 100) + "%";
  if (remaining) {
    elements.unlockTitle.textContent = remaining + " more signals to unlock public weather";
    elements.unlockText.textContent = result.company + " has " + result.count + " anonymous signals in this prototype. Real public dashboards should stay limited until the privacy threshold is met.";
  } else {
    elements.unlockTitle.textContent = "Public weather unlocked";
    elements.unlockText.textContent = result.company + " has enough anonymous signals for aggregate-only weather. Trends remain self-reported, not official company data.";
  }
}

function renderSignalHistory(result) {
  const history = signalHistoryFor(result);
  elements.historyGrid.innerHTML = history.map(function dayCard(day) {
    const config = moodConfig[day.mood];
    return "<article class=\"forecast-day\"><strong>" + escapeHtml(day.day) + "</strong><span>" + escapeHtml(config.icon) + "</span><small>" + escapeHtml(config.label) + "</small><small>" + Math.round(day.score) + "% burnout</small></article>";
  }).join("");
}

function renderTrend(result) {
  const history = signalHistoryFor(result);
  const points = history.map(function pointFor(day, index) {
    const x = 42 + index * 92;
    const y = 188 - (day.score / 100) * 150;
    return { x: x, y: y, score: day.score };
  });
  const polyline = points.map(function pointText(point) {
    return point.x + "," + point.y;
  }).join(" ");
  const circles = points.map(function circle(point) {
    return "<circle cx=\"" + point.x + "\" cy=\"" + point.y + "\" r=\"6\" fill=\"#2f6f73\"><title>" + Math.round(point.score) + "%</title></circle>";
  }).join("");
  elements.trendChart.innerHTML = [
    "<line x1=\"42\" y1=\"38\" x2=\"42\" y2=\"188\" stroke=\"#c7d0dc\" />",
    "<line x1=\"42\" y1=\"188\" x2=\"600\" y2=\"188\" stroke=\"#c7d0dc\" />",
    "<line x1=\"42\" y1=\"83\" x2=\"600\" y2=\"83\" stroke=\"#edf0f4\" />",
    "<line x1=\"42\" y1=\"128\" x2=\"600\" y2=\"128\" stroke=\"#edf0f4\" />",
    "<polyline points=\"" + polyline + "\" fill=\"none\" stroke=\"#2f6f73\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />",
    circles,
    "<text x=\"42\" y=\"24\" font-size=\"16\" font-weight=\"800\" fill=\"#5f6673\">storm risk</text>",
    "<text x=\"42\" y=\"214\" font-size=\"16\" font-weight=\"800\" fill=\"#5f6673\">past 7 days</text>"
  ].join("");

  elements.pressureSystems.innerHTML = pressureFor(result).map(function pressureRow(item) {
    return "<div class=\"pressure-system\"><span>" + escapeHtml(item.name) + "</span><div class=\"pressure-track\"><span style=\"width: " + item.value + "%\"></span></div><strong>" + item.value + "%</strong></div>";
  }).join("");
}

function renderHistory() {
  const checkins = loadCheckins().slice(-6).reverse();
  elements.history.innerHTML = checkins.length
    ? checkins.map(function historyItem(item) {
        const config = moodConfig[item.mood];
        const time = new Date(item.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
        return "<article class=\"history-item\"><div><strong>" + escapeHtml(item.company) + "</strong><small>" + escapeHtml(config.label) + " · " + escapeHtml(item.shift) + " · " + time + "</small></div><span>" + config.icon + "</span></article>";
      }).join("")
    : "<article class=\"history-item\"><div><strong>No local check-ins yet</strong><small>Your prototype history will appear here.</small></div><span>NEW</span></article>";
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function clearReasons() {
  document.querySelectorAll(".reason-grid input").forEach(function uncheck(input) {
    input.checked = false;
  });
}

function submitCheckin(event) {
  event.preventDefault();
  const companyRecord = selectedCompany || findCompanyByName(elements.company.value) || addWorkplace(elements.company.value);
  if (!companyRecord) return;
  const company = companyRecord.name;
  const checkins = loadCheckins();
  checkins.push({
    companyId: companyRecord.id,
    company: company,
    mood: selectedMood(),
    reasons: selectedReasons(),
    shift: elements.shift.value,
    createdAt: new Date().toISOString()
  });
  saveCheckins(checkins);
  localStorage.setItem("workplaceWeather:lastCompany", company);
  clearReasons();
  renderWeather(company);
  renderHistory();
}

function drawShareCard(result) {
  const canvas = elements.canvas;
  const ctx = canvas.getContext("2d");
  const config = moodConfig[result.mood];
  const palette = {
    sunny: ["#fff1bd", "#f2b84b", "#171717"],
    mild: ["#e6f6ec", "#62a87c", "#171717"],
    cloudy: ["#e4ebf3", "#607d9c", "#171717"],
    storm: ["#2e2638", "#6b557f", "#ffffff"]
  }[config.className];
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(1, palette[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = palette[2];
  ctx.font = "900 54px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("WORKPLACE WEATHER", 90, 140);

  ctx.font = "900 102px system-ui, -apple-system, Segoe UI, sans-serif";
  wrapText(ctx, result.company, 90, 300, 980, 112);

  ctx.font = "950 110px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(config.icon, 90, 560);

  ctx.font = "950 110px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(config.label, 90, 760);

  ctx.font = "950 154px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(Math.round(result.average) + "%", 90, 980);

  ctx.font = "800 48px system-ui, -apple-system, Segoe UI, sans-serif";
  wrapText(ctx, "chance of burnout · " + result.count + " anonymous signals", 90, 1080, 980, 58);

  ctx.font = "800 42px system-ui, -apple-system, Segoe UI, sans-serif";
  const reasons = result.reasons.map(function reasonName(entry) {
    return entry[0];
  }).join(" · ") || "new signal";
  wrapText(ctx, "Top pressure: " + reasons, 90, 1250, 980, 54);

  ctx.font = "900 38px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("self-reported sentiment · workplaceweather.local", 90, 1480);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  words.forEach(function addWord(word) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, y);
}

function downloadShareCard() {
  const company = normalizeCompany(elements.company.value) || elements.companyName.textContent;
  const result = renderWeather(company);
  drawShareCard(result);
  const link = document.createElement("a");
  link.download = company.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-workplace-weather.png";
  link.href = elements.canvas.toDataURL("image/png");
  link.click();
}

async function copyCaption() {
  const company = normalizeCompany(elements.company.value) || elements.companyName.textContent;
  const result = renderWeather(company);
  const caption = captionFor(result);
  try {
    await navigator.clipboard.writeText(caption);
    elements.copy.textContent = "Copied";
    setTimeout(function resetCopyButton() {
      elements.copy.textContent = "Copy caption";
    }, 1400);
  } catch {
    window.prompt("Copy caption", caption);
  }
}

elements.form.addEventListener("submit", submitCheckin);
elements.download.addEventListener("click", downloadShareCard);
elements.copy.addEventListener("click", copyCaption);
elements.company.addEventListener("input", function renderTypedCompany() {
  const company = normalizeCompany(elements.company.value);
  selectedCompany = findCompanyByName(company) || null;
  renderCompanySuggestions();
  if (company) renderWeather(selectedCompany ? selectedCompany.name : company);
});
elements.company.addEventListener("change", function saveCompany() {
  localStorage.setItem("workplaceWeather:lastCompany", normalizeCompany(elements.company.value));
});
elements.suggestions.addEventListener("click", function handleSuggestion(event) {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.add) {
    addWorkplace(elements.company.value);
    return;
  }
  const company = allCompanies().find(function byId(item) {
    return item.id === button.dataset.companyId;
  });
  if (company) selectCompany(company);
});

elements.company.value = localStorage.getItem("workplaceWeather:lastCompany") || "Acme Corp";
selectedCompany = findCompanyByName(elements.company.value) || null;
renderCompanySuggestions();
renderWeather(selectedCompany ? selectedCompany.name : elements.company.value);
renderHistory();
