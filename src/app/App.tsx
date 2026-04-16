import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Alerts } from "./pages/Alerts";
import { Sensors } from "./pages/Sensors";
import { History } from "./pages/History";
import { Report } from "./pages/Report";
import { Cooperative } from "./pages/Cooperative";
import { Settings } from "./pages/Settings";
import { MqttProvider } from "./contexts/MqttContext";
import { DataProvider } from "./contexts/DataContext";

export default function App() {
  return (
    <MqttProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/sensors"
              element={
                <Layout>
                  <Sensors />
                </Layout>
              }
            />
            <Route
              path="/alerts"
              element={
                <Layout>
                  <Alerts />
                </Layout>
              }
            />
            <Route
              path="/history"
              element={
                <Layout>
                  <History />
                </Layout>
              }
            />
            <Route
              path="/report"
              element={
                <Layout>
                  <Report />
                </Layout>
              }
            />
            <Route
              path="/cooperative"
              element={
                <Layout>
                  <Cooperative />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </MqttProvider>
  );
}