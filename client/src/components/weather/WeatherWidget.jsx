import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTravelScore, getWeatherIcon } from "./weatherUtils";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Popular Pakistani/Kashmir destinations for quick select
const QUICK_CITIES = [
  "Hunza", "Skardu", "Murree", "Naran", "Swat",
  "Gilgit", "Chitral", "Lahore", "Islamabad", "Karachi",
];

export default function WeatherWidget({ defaultCity = "" }) {
  const navigate = useNavigate();
  const [city, setCity]       = useState(defaultCity);
  const [date, setDate]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const today    = new Date().toISOString().split("T")[0];
  const maxDate  = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const checkWeather = async () => {
    if (!city.trim()) { setError("Please enter a destination."); return; }
    if (!date)        { setError("Please select a travel date."); return; }
    setError(""); setLoading(true); setResult(null);

    try {
      const res  = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric&cnt=40`
      );
      const data = await res.json();

      if (data.cod !== "200" && data.cod !== 200) {
        setError(`City "${city}" not found. Try a nearby major city.`);
        setLoading(false);
        return;
      }

      // Find forecast closest to selected date
      const selectedDate = new Date(date);
      selectedDate.setHours(12, 0, 0, 0); // noon of selected day

      let closest    = null;
      let closestDiff = Infinity;

      data.list.forEach(item => {
        const itemDate = new Date(item.dt * 1000);
        const diff     = Math.abs(itemDate - selectedDate);
        if (diff < closestDiff) {
          closestDiff = diff;
          closest     = item;
        }
      });

      if (!closest) {
        setError("No forecast data for that date. Try within 5 days.");
        setLoading(false);
        return;
      }

      const temp        = Math.round(closest.main.temp);
      const feelsLike   = Math.round(closest.main.feels_like);
      const humidity    = closest.main.humidity;
      const windSpeed   = Math.round(closest.wind.speed * 3.6); // m/s to km/h
      const weatherMain = closest.weather[0].main;
      const weatherDesc = closest.weather[0].description;
      const rainChance  = closest.pop ? Math.round(closest.pop * 100) : 0;
      const icon        = getWeatherIcon(weatherMain);
      const analysis    = getTravelScore(temp, weatherMain, windSpeed, humidity);

      setResult({
        city:     data.city.name,
        country:  data.city.country,
        temp, feelsLike, humidity, windSpeed,
        weatherMain, weatherDesc, rainChance,
        icon, ...analysis,
        forecastDate: new Date(closest.dt * 1000).toLocaleDateString("en-PK", {
          weekday: "long", month: "long", day: "numeric",
        }),
      });
    } catch {
      setError("Failed to fetch weather. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate("/tours", { state: { prefillLocation: city } });
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 4px 24px var(--shadow)",
      marginBottom: "36px",
    }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #15803d 100%)",
        padding: "20px 24px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", flexShrink: 0,
        }}>🌦️</div>
        <div>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px", fontWeight: "700", color: "white",
            marginBottom: "2px",
          }}>
            Trip Weather Checker
          </h3>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
            Check conditions before you book · Up to 5 days ahead
          </p>
        </div>
      </div>

      <div style={{ padding: "22px 24px" }}>

        {/* QUICK CITY CHIPS */}
        <div style={{
          display: "flex", gap: "6px", flexWrap: "wrap",
          marginBottom: "16px",
        }}>
          <span style={{
            fontSize: "11px", color: "var(--text-muted)",
            fontWeight: "600", alignSelf: "center",
            marginRight: "4px", whiteSpace: "nowrap",
          }}>
            Quick:
          </span>
          {QUICK_CITIES.map(c => (
            <button
              key={c}
              onClick={() => { setCity(c); setError(""); setResult(null); }}
              style={{
                padding: "4px 12px",
                borderRadius: "50px",
                border: city === c
                  ? "1.5px solid var(--green-500)"
                  : "1.5px solid var(--border)",
                background: city === c ? "var(--green-50)" : "transparent",
                color: city === c ? "var(--green-700)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: city === c ? "600" : "400",
                cursor: "pointer", transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* INPUTS ROW */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: "10px",
          alignItems: "end",
        }}>
          {/* CITY INPUT */}
          <div>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: "600", color: "var(--text-secondary)",
              marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              📍 Destination
            </label>
            <input
              type="text"
              value={city}
              onChange={e => { setCity(e.target.value); setError(""); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && checkWeather()}
              placeholder="e.g. Hunza, Skardu..."
              style={{
                width: "100%", padding: "11px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "10px", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#16a34a"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* DATE INPUT */}
          <div>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: "600", color: "var(--text-secondary)",
              marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              📅 Travel Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setError(""); setResult(null); }}
              min={today}
              max={maxDate}
              style={{
                width: "100%", padding: "11px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "10px", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#16a34a"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* CHECK BUTTON */}
          <button
            onClick={checkWeather}
            disabled={loading}
            style={{
              background: loading ? "var(--green-400)" : "var(--green-600)",
              color: "white", border: "none",
              padding: "11px 22px", borderRadius: "10px",
              fontSize: "14px", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "7px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#15803d"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "var(--green-600)"; }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "14px", height: "14px",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                Checking...
              </>
            ) : (
              <>🔍 Check</>
            )}
          </button>
        </div>

        {/* DATE NOTE */}
        <p style={{
          fontSize: "11px", color: "var(--text-muted)",
          marginTop: "8px",
        }}>
          ℹ️ OpenWeather provides accurate forecasts up to 5 days ahead.
        </p>

        {/* ERROR */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#dc2626", padding: "10px 14px",
            borderRadius: "10px", fontSize: "13px",
            marginTop: "14px", display: "flex",
            alignItems: "center", gap: "8px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div style={{
            marginTop: "20px",
            background: result.bg,
            border: `1.5px solid ${result.color}30`,
            borderRadius: "14px",
            overflow: "hidden",
          }}>

            {/* RESULT HEADER */}
            <div style={{
              padding: "16px 20px",
              background: `${result.color}10`,
              borderBottom: `1px solid ${result.color}20`,
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "10px",
            }}>
              <div>
                <p style={{
                  fontSize: "16px", fontWeight: "700",
                  color: "var(--text-primary)", marginBottom: "2px",
                  fontFamily: "'Playfair Display', serif",
                }}>
                  {result.city}, {result.country}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {result.forecastDate}
                </p>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: result.color, color: "white",
                padding: "6px 16px", borderRadius: "50px",
              }}>
                <span style={{ fontSize: "16px" }}>{result.emoji}</span>
                <span style={{ fontSize: "13px", fontWeight: "700" }}>
                  {result.label}
                </span>
                <span style={{ fontSize: "13px", fontWeight: "700", opacity: 0.85 }}>
                  {result.score}/100
                </span>
              </div>
            </div>

            {/* WEATHER STATS GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "0",
              padding: "16px 20px",
              borderBottom: `1px solid ${result.color}15`,
            }}>
              {[
                { icon: result.icon,  label: "Condition",   val: result.weatherDesc },
                { icon: "🌡️",        label: "Temperature", val: `${result.temp}°C` },
                { icon: "🤔",        label: "Feels Like",  val: `${result.feelsLike}°C` },
                { icon: "🌧️",        label: "Rain Chance", val: `${result.rainChance}%` },
                { icon: "💨",        label: "Wind",        val: `${result.windSpeed} km/h` },
                { icon: "💧",        label: "Humidity",    val: `${result.humidity}%` },
              ].map((s, i, arr) => (
                <div key={s.label} style={{
                  textAlign: "center", padding: "10px 8px",
                  borderRight: i < arr.length - 1 ? `1px solid ${result.color}15` : "none",
                }}>
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
                  <div style={{
                    fontSize: "11px", color: "var(--text-muted)",
                    marginBottom: "3px", fontWeight: "500",
                  }}>{s.label}</div>
                  <div style={{
                    fontSize: "13px", fontWeight: "700",
                    color: "var(--text-primary)",
                    textTransform: "capitalize",
                  }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* ADVICE + WARNINGS */}
            <div style={{ padding: "14px 20px" }}>
              <p style={{
                fontSize: "14px", fontWeight: "600",
                color: result.color, marginBottom: "8px",
              }}>
                {result.emoji} {result.advice}
              </p>
              {result.warnings.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {result.warnings.map((w, i) => (
                    <span key={i} style={{
                      fontSize: "11px", padding: "3px 10px",
                      borderRadius: "50px",
                      background: `${result.color}15`,
                      color: result.color, fontWeight: "500",
                      border: `1px solid ${result.color}25`,
                    }}>
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            {result.score >= 45 && (
              <div style={{
                padding: "14px 20px",
                borderTop: `1px solid ${result.color}15`,
                display: "flex", gap: "10px",
                alignItems: "center", flexWrap: "wrap",
              }}>
                <p style={{
                  fontSize: "13px", color: "var(--text-muted)",
                  flex: 1, minWidth: "160px",
                }}>
                  Ready to explore {result.city}?
                </p>
                <button
                  onClick={handleBookNow}
                  style={{
                    background: result.color, color: "white",
                    border: "none", padding: "10px 22px",
                    borderRadius: "50px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer",
                    boxShadow: `0 4px 12px ${result.color}40`,
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  🌿 Browse Tours in {result.city}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}