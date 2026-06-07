export const getTravelScore = (temp, weatherMain, windSpeed = 0, humidity = 0) => {
  let score = 100;
  let warnings = [];

  // Temperature scoring
  if (temp < 0) {
    score -= 40;
    warnings.push("🥶 Freezing temperatures");
  } else if (temp < 5) {
    score -= 25;
    warnings.push("❄️ Very cold — pack heavy layers");
  } else if (temp < 10) {
    score -= 10;
    warnings.push("🧥 Cold — bring a warm jacket");
  } else if (temp > 40) {
    score -= 30;
    warnings.push("🔥 Extreme heat — stay hydrated");
  } else if (temp > 35) {
    score -= 15;
    warnings.push("☀️ Very hot — carry water");
  } else if (temp >= 18 && temp <= 30) {
    score += 5; // ideal range bonus
  }

  // Weather condition scoring
  const main = (weatherMain || "").toLowerCase();
  if (main.includes("thunderstorm")) {
    score -= 50;
    warnings.push("⛈️ Thunderstorm expected — dangerous");
  } else if (main.includes("snow")) {
    score -= 35;
    warnings.push("❄️ Snow expected — check road conditions");
  } else if (main.includes("rain")) {
    score -= 30;
    warnings.push("🌧️ Rain expected — carry rain protection");
  } else if (main.includes("drizzle")) {
    score -= 15;
    warnings.push("🌦️ Light drizzle — bring an umbrella");
  } else if (main.includes("mist") || main.includes("fog")) {
    score -= 10;
    warnings.push("🌫️ Low visibility — drive carefully");
  } else if (main.includes("cloud")) {
    score -= 5;
    warnings.push("⛅ Cloudy skies");
  } else if (main.includes("clear")) {
    score += 5;
  }

  // Wind scoring
  if (windSpeed > 50) {
    score -= 20;
    warnings.push("💨 Very strong winds");
  } else if (windSpeed > 30) {
    score -= 10;
    warnings.push("💨 Strong winds expected");
  }

  // Humidity scoring
  if (humidity > 85) {
    score -= 10;
    warnings.push("💧 Very humid conditions");
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let label, color, bg, emoji, advice;

  if (score >= 80) {
    label  = "Excellent";
    color  = "#16a34a";
    bg     = "#dcfce7";
    emoji  = "🌟";
    advice = "Perfect conditions for travel! Go ahead and book.";
  } else if (score >= 65) {
    label  = "Good";
    color  = "#15803d";
    bg     = "#f0fdf4";
    emoji  = "✅";
    advice = "Good conditions. Minor preparations advised.";
  } else if (score >= 45) {
    label  = "Moderate";
    color  = "#ca8a04";
    bg     = "#fef9c3";
    emoji  = "⚠️";
    advice = "Travel is possible but check conditions on the day.";
  } else if (score >= 25) {
    label  = "Poor";
    color  = "#dc2626";
    bg     = "#fef2f2";
    emoji  = "❌";
    advice = "Not ideal for travel. Consider rescheduling.";
  } else {
    label  = "Dangerous";
    color  = "#7f1d1d";
    bg     = "#fee2e2";
    emoji  = "🚫";
    advice = "Travel strongly discouraged. Stay safe.";
  }

  return { score, label, color, bg, emoji, advice, warnings };
};

export const getWeatherIcon = (weatherMain) => {
  const main = (weatherMain || "").toLowerCase();
  if (main.includes("thunderstorm")) return "⛈️";
  if (main.includes("snow"))         return "❄️";
  if (main.includes("rain"))         return "🌧️";
  if (main.includes("drizzle"))      return "🌦️";
  if (main.includes("mist") || main.includes("fog")) return "🌫️";
  if (main.includes("cloud"))        return "⛅";
  if (main.includes("clear"))        return "☀️";
  return "🌤️";
};