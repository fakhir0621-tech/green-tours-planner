import { useEffect } from "react";
import { Link } from "react-router-dom";

const TEAM = [
  {
    name: "Sarah Mitchell", role: "Founder & CEO",
    bio: "15 years leading eco-tourism adventures across 6 continents.",
    avatar: "S", color: "#16a34a",
  },
  {
    name: "James Okafor", role: "Head of Tours",
    bio: "Certified mountain guide and wildlife conservation expert.",
    avatar: "J", color: "#0891b2",
  },
  {
    name: "Priya Sharma", role: "Customer Experience",
    bio: "Dedicated to making every journey seamless and unforgettable.",
    avatar: "P", color: "#7c3aed",
  },
  {
    name: "Carlos Rivera", role: "Lead Tour Guide",
    bio: "Speaks 4 languages and has guided 500+ tours worldwide.",
    avatar: "C", color: "#db6b1f",
  },
];

const VALUES = [
  { icon: "🌿", title: "Eco First", desc: "Every tour is designed with minimal environmental impact and maximum respect for nature." },
  { icon: "🤝", title: "Community", desc: "We partner with local communities ensuring tourism benefits the people who call these places home." },
  { icon: "⭐", title: "Excellence", desc: "From planning to farewell, we obsess over every detail so you don't have to." },
  { icon: "🛡️", title: "Safety", desc: "All guides are certified professionals. Your safety is never compromised." },
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
        padding: "80px 6% 70px",
        position: "relative", overflow: "hidden", textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }} />

        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "var(--green-400)", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "16px",
        }}>
          OUR STORY
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(32px, 5vw, 58px)",
          fontWeight: "700", color: "white",
          lineHeight: "1.2", marginBottom: "20px",
        }}>
          We Believe Travel<br />
          <span style={{ color: "#86efac" }}>Changes Everything</span>
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: "16px", maxWidth: "560px",
          margin: "0 auto 36px", lineHeight: "1.8",
        }}>
          Founded in 2015, GreenTours was born from a simple belief — that
          the world's most breathtaking places deserve to be explored
          responsibly, joyfully, and with expert guidance.
        </p>
        <Link to="/tours" style={{
          background: "var(--green-500)", color: "white",
          padding: "14px 32px", borderRadius: "50px",
          fontSize: "15px", fontWeight: "500",
          boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
          display: "inline-block",
        }}>
          Explore Our Tours 🌿
        </Link>
      </div>

      {/* STATS */}
      <div style={{
        background: "white",
        display: "flex", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}>
        {[
          { num: "12,000+", label: "Happy Travelers" },
          { num: "85+",     label: "Destinations" },
          { num: "10",      label: "Years Experience" },
          { num: "4.9★",    label: "Average Rating" },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            padding: "32px 48px", textAlign: "center",
            borderRight: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none",
            flex: 1, maxWidth: "220px",
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "30px", fontWeight: "700",
              color: "var(--green-700)",
            }}>{s.num}</div>
            <div style={{
              fontSize: "13px", color: "var(--gray-400)",
              marginTop: "4px", fontWeight: "500",
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* MISSION */}
      <div style={{ padding: "80px 6%", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "60px", alignItems: "center",
        }}>
          <div>
            <p style={{
              fontSize: "11px", letterSpacing: "3px",
              color: "var(--green-600)", fontWeight: "600",
              textTransform: "uppercase", marginBottom: "14px",
            }}>
              OUR MISSION
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 3vw, 38px)",
              fontWeight: "700", color: "var(--gray-800)",
              lineHeight: "1.3", marginBottom: "20px",
            }}>
              Sustainable Travel That <span style={{ color: "var(--green-600)" }}>Gives Back</span>
            </h2>
            <p style={{
              color: "var(--gray-600)", fontSize: "15px",
              lineHeight: "1.9", marginBottom: "16px",
            }}>
              We design every itinerary with three pillars in mind: breathtaking
              experiences, environmental responsibility, and direct benefit to
              local communities.
            </p>
            <p style={{
              color: "var(--gray-600)", fontSize: "15px", lineHeight: "1.9",
            }}>
              10% of every booking goes directly to conservation projects in the
              destinations you visit. Travel with us and become part of the solution.
            </p>
          </div>

          {/* IMAGE PLACEHOLDER */}
          <div style={{
            borderRadius: "20px", overflow: "hidden",
            height: "380px", position: "relative",
          }}>
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"
              alt="Our mission"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{
              position: "absolute", bottom: "24px", left: "24px", right: "24px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "12px", padding: "16px 20px",
              backdropFilter: "blur(8px)",
            }}>
              <p style={{
                fontSize: "14px", fontWeight: "600",
                color: "var(--green-700)", marginBottom: "2px",
              }}>
                🌱 Conservation Pledge
              </p>
              <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                10% of every booking funds local conservation projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VALUES */}
      <div style={{
        background: "var(--green-900)",
        padding: "80px 6%",
      }}>
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <p style={{
            fontSize: "11px", letterSpacing: "3px",
            color: "var(--green-400)", fontWeight: "600",
            textTransform: "uppercase", marginBottom: "14px",
          }}>
            WHAT DRIVES US
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 3vw, 38px)",
            fontWeight: "700", color: "white",
          }}>
            Our Core Values
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px", maxWidth: "1100px", margin: "0 auto",
        }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "16px", padding: "32px 28px",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.10)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>{v.icon}</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700",
                color: "white", marginBottom: "10px",
              }}>{v.title}</h3>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px", lineHeight: "1.8",
              }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM */}
      <div style={{ padding: "80px 6%" }}>
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <p style={{
            fontSize: "11px", letterSpacing: "3px",
            color: "var(--green-600)", fontWeight: "600",
            textTransform: "uppercase", marginBottom: "14px",
          }}>
            THE PEOPLE BEHIND GREENTOURS
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 3vw, 38px)",
            fontWeight: "700", color: "var(--gray-800)",
          }}>
            Meet Our Team
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: "24px", maxWidth: "1100px", margin: "0 auto",
        }}>
          {TEAM.map((member) => (
            <div key={member.name} style={{
              background: "white",
              border: "1px solid var(--gray-100)",
              borderRadius: "16px", padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.3s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
              }}
            >
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: member.color,
                display: "flex", alignItems: "center",
                justifyContent: "center",
                fontSize: "28px", fontWeight: "700", color: "white",
                margin: "0 auto 16px",
              }}>
                {member.avatar}
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "4px",
              }}>{member.name}</h3>
              <p style={{
                fontSize: "12px", color: "var(--green-600)",
                fontWeight: "600", letterSpacing: "0.5px",
                textTransform: "uppercase", marginBottom: "12px",
              }}>{member.role}</p>
              <p style={{
                fontSize: "14px", color: "var(--gray-500)", lineHeight: "1.7",
              }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-600), var(--green-800))",
        padding: "64px 6%", textAlign: "center",
        margin: "0 0 0 0",
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 3vw, 40px)",
          fontWeight: "700", color: "white", marginBottom: "16px",
        }}>
          Ready to Start Your Adventure?
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: "16px", marginBottom: "32px",
        }}>
          Join 12,000+ travelers who have explored the world with GreenTours.
        </p>
        <Link to="/tours" style={{
          background: "white", color: "var(--green-700)",
          padding: "14px 36px", borderRadius: "50px",
          fontSize: "15px", fontWeight: "600",
          display: "inline-block",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          Browse All Tours →
        </Link>
      </div>
    </div>
  );
}