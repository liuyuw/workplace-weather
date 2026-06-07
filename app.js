const storageKey = "workplaceWeather:checkins";

const moodConfig = {
  great: { label: "Sunny", icon: "SUN", className: "sunny", score: 8, line: "Clear skies, actual morale detected." },
  okay: { label: "Mild", icon: "MILD", className: "mild", score: 34, line: "Manageable conditions with scattered meetings." },
  stressed: { label: "Cloudy", icon: "CLD", className: "cloudy", score: 62, line: "Cloud cover building around workload and priorities." },
  burned_out: { label: "Storm", icon: "STM", className: "storm", score: 88, line: "Severe burnout advisory. Avoid unnecessary syncs." }
};

const elements = {
  form: document.querySelector("#checkinForm"),
  company: document.querySelector("#companyInput"),
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
  history: document.querySelector("#historyList"),
  download: document.querySelector("#downloadBtn"),
  copy: document.querySelector("#copyBtn"),
  canvas: document.querySelector("#shareCanvas")
};

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

function normalizeCompany(value) {
  return value.trim().replace(/\s+/g, " ");
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
  return result;
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
  const company = normalizeCompany(elements.company.value);
  if (!company) return;
  const checkins = loadCheckins();
  checkins.push({
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
  if (company) renderWeather(company);
});
elements.company.addEventListener("change", function saveCompany() {
  localStorage.setItem("workplaceWeather:lastCompany", normalizeCompany(elements.company.value));
});

elements.company.value = localStorage.getItem("workplaceWeather:lastCompany") || "";
renderWeather(elements.company.value || "Acme Corp");
renderHistory();
