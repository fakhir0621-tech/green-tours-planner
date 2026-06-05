import { useEffect, useRef, useState } from "react";

export default function VirtualTour({ scenes, onClose }) {
  const containerRef    = useRef(null);
  const viewerRef       = useRef(null);
  const [currentScene, setCurrentScene]   = useState(0);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [loadError, setLoadError]         = useState(false);
  const [marzipano, setMarzipano]         = useState(null);
  const [marzScenes, setMarzScenes]       = useState([]);
  const [loading, setLoading]             = useState(true);

  // ---- Load Marzipano dynamically ----
  useEffect(() => {
    let cancelled = false;

    const loadMarzipano = async () => {
      try {
        const Marzipano = (await import("marzipano")).default || (await import("marzipano"));
        if (!cancelled) setMarzipano(Marzipano);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };

    loadMarzipano();
    return () => { cancelled = true; };
  }, []);

  // ---- Init viewer once Marzipano is loaded ----
  useEffect(() => {
    if (!marzipano || !containerRef.current || !scenes?.length) return;

    // Cleanup previous viewer
    if (viewerRef.current) {
      try { viewerRef.current.destroy(); } catch {}
      viewerRef.current = null;
    }

    try {
      const viewerOpts = {
        controls: { mouseViewMode: "drag" },
        stage:    { progressive: true },
      };

      const viewer = new marzipano.Viewer(containerRef.current, viewerOpts);
      viewerRef.current = viewer;

      const limiter = marzipano.RectilinearView.limit.traditional(
        4096,
        (100 * Math.PI) / 180,
        (120 * Math.PI) / 180
      );

      const builtScenes = scenes.map((scene) => {
        const geometry = new marzipano.EquirectGeometry([{ width: 4000 }]);
        const view     = new marzipano.RectilinearView(
          { yaw: 0, pitch: 0, fov: (90 * Math.PI) / 180 },
          limiter
        );
        const source   = marzipano.ImageUrlSource.fromString(scene.imageUrl);
        return viewer.createScene({ source, geometry, view });
      });

      setMarzScenes(builtScenes);

      if (builtScenes[0]) {
        builtScenes[0].switchTo();
      }

      setLoading(false);
    } catch {
      setLoadError(true);
      setLoading(false);
    }

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch {}
        viewerRef.current = null;
      }
    };
  }, [marzipano, scenes]);

  // ---- Switch scene ----
  const switchScene = (index) => {
    if (marzScenes[index]) {
      marzScenes[index].switchTo({ transitionDuration: 1000 });
      setCurrentScene(index);
    }
  };

  // ---- Fullscreen toggle ----
  const toggleFullscreen = () => {
    const el = document.getElementById("vt-wrapper");
    if (!isFullscreen) {
      if (el?.requestFullscreen)           el.requestFullscreen();
      else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen)           document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // ---- Keyboard controls ----
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") switchScene(Math.min(currentScene + 1, scenes.length - 1));
      if (e.key === "ArrowLeft")  switchScene(Math.max(currentScene - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentScene, marzScenes, scenes]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.96)",
      zIndex: 99999,
      display: "flex", flexDirection: "column",
    }}>
      {/* ---- TOP BAR ---- */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", flexShrink: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #16a34a, #052e16)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px",
          }}>🌐</div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "white", lineHeight: 1 }}>
              Virtual 3D Tour
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
              {scenes[currentScene]?.title || `Scene ${currentScene + 1}`}
              {scenes.length > 1 && ` · ${currentScene + 1} of ${scenes.length}`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* CONTROLS HINT */}
          <div style={{
            display: "flex", gap: "12px", alignItems: "center",
            padding: "6px 14px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "50px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            {[
              { icon: "🖱️", label: "Drag to look" },
              { icon: "🔍", label: "Scroll to zoom" },
              { icon: "⌨️", label: "← → scenes" },
            ].map(h => (
              <span key={h.label} style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "4px" }}>
                {h.icon} {h.label}
              </span>
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            title="Toggle fullscreen"
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "white", width: "36px", height: "36px", borderRadius: "50%",
              fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            {isFullscreen ? "⛶" : "⛶"}
          </button>

          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)",
              color: "#f87171", width: "36px", height: "36px", borderRadius: "50%",
              fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.35)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(220,38,38,0.15)"}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ---- VIEWER ---- */}
      <div id="vt-wrapper" style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* MARZIPANO CONTAINER */}
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />

        {/* LOADING OVERLAY */}
        {loading && !loadError && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "16px",
          }}>
            <div style={{
              width: "48px", height: "48px",
              border: "4px solid rgba(22,163,74,0.3)",
              borderTop: "4px solid #16a34a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Loading 360° panorama...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ERROR STATE */}
        {loadError && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "16px",
          }}>
            <div style={{ fontSize: "52px" }}>🌐</div>
            <h3 style={{ color: "white", fontSize: "18px", fontFamily: "'Playfair Display', serif" }}>
              Could not load 3D viewer
            </h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textAlign: "center", maxWidth: "340px" }}>
              Make sure you ran <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>npm install marzipano</code> inside your client folder.
            </p>
            <button onClick={onClose} style={{
              background: "#16a34a", color: "white", border: "none",
              padding: "10px 24px", borderRadius: "50px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>
              Close
            </button>
          </div>
        )}

        {/* SCENE DESCRIPTION OVERLAY */}
        {!loading && !loadError && scenes[currentScene]?.description && (
          <div style={{
            position: "absolute", bottom: "90px", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50px",
            padding: "8px 20px",
            fontSize: "13px", color: "rgba(255,255,255,0.85)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            {scenes[currentScene].description}
          </div>
        )}
      </div>

      {/* ---- SCENE SELECTOR (bottom bar) ---- */}
      {scenes.length > 1 && (
        <div style={{
          display: "flex", gap: "10px", justifyContent: "center",
          padding: "14px 20px", flexShrink: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          overflowX: "auto",
        }}>
          {/* PREV BUTTON */}
          <button
            onClick={() => switchScene(Math.max(currentScene - 1, 0))}
            disabled={currentScene === 0}
            style={{
              background: currentScene === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: currentScene === 0 ? "rgba(255,255,255,0.2)" : "white",
              width: "36px", height: "36px", borderRadius: "50%",
              fontSize: "16px", cursor: currentScene === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >←</button>

          {/* SCENE THUMBNAILS */}
          {scenes.map((scene, i) => (
            <button
              key={i}
              onClick={() => switchScene(i)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "6px",
                background: currentScene === i
                  ? "rgba(22,163,74,0.2)"
                  : "rgba(255,255,255,0.06)",
                border: currentScene === i
                  ? "2px solid #16a34a"
                  : "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px", padding: "8px 14px",
                cursor: "pointer", transition: "all 0.2s",
                minWidth: "80px", flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (currentScene !== i) e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={e => {
                if (currentScene !== i) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <span style={{ fontSize: "18px" }}>🌐</span>
              <span style={{
                fontSize: "11px", fontWeight: currentScene === i ? "700" : "400",
                color: currentScene === i ? "#4ade80" : "rgba(255,255,255,0.6)",
                maxWidth: "80px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {scene.title || `Scene ${i + 1}`}
              </span>
            </button>
          ))}

          {/* NEXT BUTTON */}
          <button
            onClick={() => switchScene(Math.min(currentScene + 1, scenes.length - 1))}
            disabled={currentScene === scenes.length - 1}
            style={{
              background: currentScene === scenes.length - 1 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: currentScene === scenes.length - 1 ? "rgba(255,255,255,0.2)" : "white",
              width: "36px", height: "36px", borderRadius: "50%",
              fontSize: "16px", cursor: currentScene === scenes.length - 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >→</button>
        </div>
      )}
    </div>
  );
}