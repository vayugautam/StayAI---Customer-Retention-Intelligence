import React, { Suspense, useEffect, Component } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";

/* ── Lazy-loaded pages ── */
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Customer360 = React.lazy(() => import("./pages/Customer360"));
const Campaigns = React.lazy(() => import("./pages/Campaigns"));

/* ── Scroll to top on route change ── */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/* ── Error boundary for network / chunk errors ── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "100vh", background: "var(--bg-base)",
            gap: 16, padding: 40,
          }}
        >
          <div
            style={{
              width: 48, height: 48, borderRadius: 12,
              background: "var(--red-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--red)">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          </div>
          <h2 className="ff-disp" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--txt)" }}>
            Something went wrong
          </h2>
          <p className="ff-body" style={{ margin: 0, fontSize: 13, color: "var(--txt3)", textAlign: "center", maxWidth: 360 }}>
            A network or rendering error occurred. Please reload the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="ff-mono"
            style={{
              padding: "8px 24px", borderRadius: 8, border: "none",
              background: "var(--amber)", color: "#080c12",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.4px",
              cursor: "pointer", transition: "filter 150ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ── Full-screen loading fallback with amber spinner ── */
const LoadingFallback = () => (
  <div
    style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg-base)",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 36, height: 36,
        border: "3px solid rgba(245,166,35,0.15)",
        borderTop: "3px solid var(--amber)",
        borderRadius: "50%",
        animation: "app-spin 0.8s linear infinite",
      }}
    />
    <span className="ff-mono" style={{ fontSize: 10, letterSpacing: "1.2px", color: "var(--txt3)", textTransform: "uppercase" }}>
      Loading
    </span>
    <style>{`
      @keyframes app-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/* ── App Root ── */
const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customer/:id" element={<Customer360 />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
