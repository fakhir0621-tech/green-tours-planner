import { useState, useEffect, useRef } from "react";

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    tag: "FEATURED DESTINATION",
    headline: "Explore the World",
    sub: "with Green Tour Planners",
    description: "Discover breathtaking landscapes and create memories that last a lifetime.",
    cta: "Plan Your Journey",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
    tag: "ADVENTURE AWAITS",
    headline: "Into the Wild",
    sub: "Untamed Natural Beauty",
    description: "From misty forests to golden savannas — nature's finest chapters await you.",
    cta: "Explore Adventures",
  },
  {
    id: 3,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLTsq9fbKwz6ESl_wDV0NCsDNNmCSGWfcho3KWh6sEmw&s=10",
    tag: "OCEAN ESCAPES",
    headline: "Where Mountains Meets Sky",
    sub: "Mountains All Over Pakistan",
    description: "Snow-covered peaks, lush green valleys, and breathtaking horizons that touch the clouds.",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1675078141644-77d71379c8ae?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGFraXN0YW4lMjBhbmNpZW50JTIwd29uZGVyc3xlbnwwfHwwfHx8MA%3D%3D",
    tag: "CULTURAL JOURNEYS",
    headline: "Ancient Wonders",
    sub: "Living History & Heritage",
    description: "Walk through centuries of history in destinations that shaped the world.",
    cta: "Browse Culture Tours",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(true);
  const intervalRef = useRef(null);

  const startAutoplay = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAnimating(false);
      setTimeout(() => {
        setActive((s) => (s + 1) % heroSlides.length);
        setAnimating(true);
      }, 100);
    }, 5500);
  };

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (idx) => {
    setAnimating(false);
    setTimeout(() => {
      setActive(idx);
      setAnimating(true);
    }, 100);
    startAutoplay();
  };

  const slide = heroSlides[active];

  return (
    <div style={{
      position: "relative",
      height: "100vh",
      minHeight: "600px",
      overflow: "hidden",
      marginTop: "70px",
    }}>

      {/* BACKGROUND IMAGES */}
      {heroSlides.map((s, i) => (
        <div key={s.id} style={{
          position: "absolute", inset: 0,
          opacity: i === active ? 1 : 0,
          transition: "opacity 0.9s ease-in-out",
          zIndex: 0,
        }}>
          <img src={s.image} alt={s.headline} style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            transform: i === active ? "scale(1)" : "scale(1.06)",
            transition: "transform 8s ease-out",
          }} />
        </div>
      ))}

      {/* DARK OVERLAY */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)",
        zIndex: 1,
      }} />

      {/* SLIDE CONTENT */}
      <div style={{
        position: "absolute",
        top: "50%", left: "8%",
        transform: "translateY(-50%)",
        zIndex: 2,
        maxWidth: "580px",
      }}>

        {/* TAG */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "white",
          fontSize: "11px", letterSpacing: "2px", fontWeight: "600",
          padding: "6px 14px", borderRadius: "50px",
          marginBottom: "20px",
          opacity: animating ? 1 : 0,
          transform: animating ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s ease 0.1s",
        }}>
          <span style={{
            width: "6px", height: "6px",
            background: "var(--green-400)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "pulse 2s infinite",
          }} />
          {slide.tag}
        </div>

        {/* HEADLINE */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(42px, 6vw, 72px)",
          fontWeight: "700",
          color: "white",
          lineHeight: "1.1",
          opacity: animating ? 1 : 0,
          transform: animating ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease 0.3s",
        }}>
          {slide.headline}
        </h1>

        {/* SUB HEADING */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(18px, 2.5vw, 26px)",
          color: "#86efac",
          fontStyle: "italic",
          marginTop: "6px",
          marginBottom: "16px",
          opacity: animating ? 1 : 0,
          transform: animating ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease 0.45s",
        }}>
          {slide.sub}
        </p>

        {/* DESCRIPTION */}
        <p style={{
          fontSize: "16px",
          color: "rgba(255,255,255,0.82)",
          lineHeight: "1.7",
          maxWidth: "420px",
          opacity: animating ? 1 : 0,
          transform: animating ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s ease 0.6s",
        }}>
          {slide.description}
        </p>

        {/* BUTTONS */}
        <div style={{
          marginTop: "32px",
          display: "flex", gap: "16px", alignItems: "center",
          opacity: animating ? 1 : 0,
          transform: animating ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s ease 0.75s",
        }}>
          <button style={{
            background: "var(--green-500)",
            color: "white",
            padding: "14px 30px",
            borderRadius: "50px",
            fontSize: "15px", fontWeight: "500",
            border: "none",
            boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.target.style.background = "var(--green-700)"}
            onMouseLeave={e => e.target.style.background = "var(--green-500)"}
          >
            {slide.cta} →
          </button>

          <button style={{
            color: "white",
            border: "1.5px solid rgba(255,255,255,0.5)",
            padding: "13px 26px",
            borderRadius: "50px",
            fontSize: "15px", fontWeight: "500",
            background: "transparent",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >
            ▶ Watch Video
          </button>
        </div>
      </div>

      {/* LEFT ARROW */}
      <button onClick={() => goTo((active - 1 + heroSlides.length) % heroSlides.length)}
        style={{
          position: "absolute", top: "50%", left: "24px",
          transform: "translateY(-50%)",
          zIndex: 3,
          width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white", fontSize: "22px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
      >‹</button>

      {/* RIGHT ARROW */}
      <button onClick={() => goTo((active + 1) % heroSlides.length)}
        style={{
          position: "absolute", top: "50%", right: "24px",
          transform: "translateY(-50%)",
          zIndex: 3,
          width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white", fontSize: "22px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
      >›</button>

      {/* DOTS */}
      <div style={{
        position: "absolute", bottom: "32px", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: "10px",
        zIndex: 3,
      }}>
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === active ? "28px" : "8px",
            height: "8px",
            borderRadius: "4px",
            background: i === active ? "var(--green-400)" : "rgba(255,255,255,0.4)",
            border: "none",
            transition: "all 0.3s",
            padding: 0,
          }} />
        ))}
      </div>

      {/* PULSE ANIMATION */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}