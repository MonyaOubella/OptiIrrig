import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, MapPin, Power, CheckCircle, Clock } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface Alert {
  id: number;
  type: "leak" | "pressure" | "sensor";
  severity: "high" | "medium" | "low";
  message: string;
  location: string;
  time: string;
  resolved: boolean;
}

export function Alerts() {
  const [showStopPump, setShowStopPump] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "leak",
      severity: "high",
      message: "Fuite détectée — Secteur B, capteur #3",
      location: "Secteur B",
      time: "Il y a 5 minutes",
      resolved: false,
    },
    {
      id: 2,
      type: "pressure",
      severity: "medium",
      message: "Pression anormalement élevée détectée",
      location: "Zone principale",
      time: "Il y a 1 heure",
      resolved: false,
    },
    {
      id: 3,
      type: "sensor",
      severity: "low",
      message: "Capteur #7 hors ligne",
      location: "Secteur C",
      time: "Il y a 3 heures",
      resolved: false,
    },
    {
      id: 4,
      type: "leak",
      severity: "high",
      message: "Fuite résolue — Secteur A",
      location: "Secteur A",
      time: "Hier 14:30",
      resolved: true,
    },
  ]);

  const handleStopPump = () => {
    console.log("Pompe arrêtée");
  };

  const handleResolveAlert = () => {
    setAlerts(alerts.map((alert) => (alert.id === 1 ? { ...alert, resolved: true } : alert)));
  };

  const activeAlert = alerts.find((a) => a.id === 1 && !a.resolved);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Alertes</h1>

      {/* Active Alert Banner */}
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#E24B4A] text-white rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertTriangle className="w-6 h-6" />
            </motion.div>
            <div>
              <p className="font-semibold text-lg">Alerte : {activeAlert.message}</p>
              <p className="text-sm opacity-90">{activeAlert.time}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStopPump(true)}
              className="px-4 py-2 bg-white text-[#E24B4A] rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Couper la pompe
            </button>
            <button
              onClick={() => setShowResolve(true)}
              className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#178764] transition-colors"
            >
              Marquer comme résolu
            </button>
          </div>
        </motion.div>
      )}

      {/* Map with leak location */}
      {activeAlert && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation de la fuite</h2>
          <div className="relative bg-green-50 rounded-lg h-96 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #1D9E75 0px, #1D9E75 2px, transparent 2px, transparent 20px),
                                  repeating-linear-gradient(90deg, #1D9E75 0px, #1D9E75 2px, transparent 2px, transparent 20px)`,
                }}
              ></div>
            </div>

            {/* Normal Sensors */}
            <div className="absolute top-12 left-16 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #1</span>
            </div>
            <div className="absolute top-32 right-20 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #2</span>
            </div>

            {/* Leak Sensor - Animated */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 4px 6px rgba(0,0,0,0.1)",
                  "0 0 20px rgba(226, 75, 74, 0.8)",
                  "0 4px 6px rgba(0,0,0,0.1)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute bottom-16 left-32 flex items-center gap-2 bg-[#E24B4A] text-white px-3 py-2 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Capteur #3 - FUITE</span>
            </motion.div>

            <div className="absolute bottom-20 right-24 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #4</span>
            </div>

            {/* Pump */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#185FA5] text-white px-4 py-2 rounded-lg shadow-lg">
              <Power className="w-5 h-5" />
              <span className="font-medium">Pompe principale</span>
            </div>

            {/* Leak indicator */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-16 left-32 w-32 h-32 bg-[#E24B4A] rounded-full -z-10 blur-2xl"
            ></motion.div>
          </div>
        </div>
      )}

      {/* Alert History */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des alertes</h2>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const severityColors = {
              high: "border-l-[#E24B4A] bg-red-50",
              medium: "border-l-orange-500 bg-orange-50",
              low: "border-l-yellow-500 bg-yellow-50",
            };

            const severityLabels = {
              high: "Critique",
              medium: "Moyenne",
              low: "Faible",
            };

            return (
              <div
                key={alert.id}
                className={`border-l-4 rounded-lg p-4 ${severityColors[alert.severity]} ${
                  alert.resolved ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {alert.resolved ? (
                        <CheckCircle className="w-5 h-5 text-[#1D9E75]" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-[#E24B4A]" />
                      )}
                      <span className="font-semibold text-gray-900">{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.severity === "high"
                          ? "bg-[#E24B4A] text-white"
                          : alert.severity === "medium"
                          ? "bg-orange-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {severityLabels[alert.severity]}
                    </span>
                    {alert.resolved && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EAF3DE] text-[#27500A]">
                        Résolu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showStopPump}
        onClose={() => setShowStopPump(false)}
        onConfirm={handleStopPump}
        title="Couper la pompe"
        message="Êtes-vous sûr de vouloir couper la pompe ? Cette action arrêtera immédiatement l'irrigation."
        confirmColor="bg-[#E24B4A]"
      />

      <ConfirmDialog
        isOpen={showResolve}
        onClose={() => setShowResolve(false)}
        onConfirm={handleResolveAlert}
        title="Marquer comme résolu"
        message="Confirmez-vous que cette alerte a été résolue ?"
        confirmColor="bg-[#1D9E75]"
      />
    </div>
  );
}
