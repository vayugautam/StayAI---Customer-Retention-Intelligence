import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = () => {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Topbar />

      {/* Main content area — offset by sidebar width + topbar height */}
      <main
        style={{
          marginLeft: 68,
          paddingTop: 58,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ padding: 20, overflowY: "auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
