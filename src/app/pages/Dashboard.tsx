import { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Droplet, Activity, Gauge, Power, MapPin, Lightbulb, Clock, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMqtt } from "../contexts/MqttContext";

const AI_API_URL = import.meta.env.VITE_AI_API_URL ?? "http://127.0.0.1:8001";

const waterConsumptionData = [
  { day: "Lun", consumption: 320 },
  { day: "Mar", consumption: 280 },
  { day: "Mer", consumption: 350 },
  { day: "Jeu", consumption: 290 },
  { day: "Ven", consumption: 310 },
  { day: "Sam", consumption: 270 },
  { day: "Dim", consumption: 300 },
];

interface Action {
  id: number;
  action: string;
  time: string;
}

interface AiRecommendation {
  irrigate: boolean;
  confidence: number;
  recommended_liters: number;
  recommended_duration_min: number;
  reason: string;
}

export function Dashboard() {
  const { sensorData, pumpActive, togglePump } = useMqtt();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"open" | "close" | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [actions, setActions] = useState<Action[]>([
    { id: 5, action: "Pompe fermée manuellement", time: "14:30" },
    { id: 4, action: "Pompe ouverte (programmée)", time: "06:00" },
    { id: 3, action: "Pompe fermée manuellement", time: "Hier 18:45" },
    { id: 2, action: "Pompe ouverte (recommandation IA)", time: "Hier 06:15" },
    { id: 1, action: "Pompe fermée automatiquement", time: "Avant-hier 19:00" },
  ]);

  const handlePumpAction = (action: "open" | "close") => {
    setPendingAction(action);
    setShowConfirm(true);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecommendation() {
      try {
        setAiLoading(true);
        setAiError(null);

        const response = await fetch(`${AI_API_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
         body: JSON.stringify({
            soil_moisture_pct: 30,
            air_temperature_c: 15,
            air_humidity_pct: 55,
            pressure_hpa: 1013,
            line: 1,
            hour: 9,
            day_of_week: 1,
            month: 5,
          }),

        });

        if (!response.ok) {
          throw new Error("Impossible de recuperer la recommandation IA.");
        }

        const data: AiRecommendation = await response.json();
        setAiRecommendation(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setAiError(error instanceof Error ? error.message : "Une erreur est survenue.");
      } finally {
        setAiLoading(false);
      }
    }

    loadRecommendation();

    return () => controller.abort();
  }, []);

  const confirmPumpAction = () => {
    if (pendingAction === "open") {
      togglePump("open");
      const newAction = {
        id: actions.length + 1,
        action: "Commande PUMP_ON envoyée",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setActions([newAction, ...actions.slice(0, 4)]);
    } else if (pendingAction === "close") {
      togglePump("close");
      const newAction = {
        id: actions.length + 1,
        action: "Commande PUMP_OFF envoyée",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setActions([newAction, ...actions.slice(0, 4)]);
    }
    setPendingAction(null);
    setShowConfirm(false);
  };

  const roundedDuration = aiRecommendation ? Math.max(1, Math.round(aiRecommendation.recommended_duration_min)) : null;
  const roundedLiters = aiRecommendation ? Math.max(0, Math.round(aiRecommendation.recommended_liters)) : null;
  const confidencePercent = aiRecommendation ? Math.round(aiRecommendation.confidence * 100) : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon={Droplet}
          iconColor="bg-[#1D9E75]"
          label="Humidité du sol"
          value={sensorData.soilMoisture.toFixed(1)}
          unit="%"
        />
        <MetricCard
          icon={Thermometer}
          iconColor="bg-[#185FA5]"
          label="Température"
          value={sensorData.temperature.toFixed(1)}
          unit="°C"
        />
        <MetricCard icon={Gauge} iconColor="bg-orange-500" label="Pression" value={sensorData.pressure.toString()} unit="raw" />
        <MetricCard
          icon={Power}
          iconColor="bg-[#1D9E75]"
          label="Statut pompe"
          value={<StatusBadge status={pumpActive ? "active" : "inactive"} label={pumpActive ? "Active" : "Inactive"} />}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Water Consumption Chart */}
        <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Consommation d'eau (7 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={waterConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="consumption" stroke="#1D9E75" strokeWidth={3} dot={{ fill: "#1D9E75", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-br from-[#1D9E75] to-[#178764] rounded-lg p-6 text-white">
          <div className="flex items-start gap-3 mb-4">
            <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h3 className="font-semibold text-lg mb-2">Recommandation IA</h3>
              {aiLoading && (
                <>
                  <p className="text-sm opacity-90">Analyse des donnees capteurs en cours...</p>
                  <p className="text-2xl font-semibold mt-2">Chargement...</p>
                  <p className="text-sm opacity-90">prediction en preparation</p>
                </>
              )}
              {!aiLoading && aiError && (
                <>
                  <p className="text-sm opacity-90">Connexion a l'API IA impossible</p>
                  <p className="text-xl font-semibold mt-2">Service indisponible</p>
                  <p className="text-sm opacity-90">{aiError}</p>
                </>
              )}
              {!aiLoading && !aiError && aiRecommendation && (
                <>
                  <p className="text-sm opacity-90">
                    {aiRecommendation.irrigate ? "Irrigation recommandee maintenant" : "Pas d'irrigation immediate"}
                  </p>
                  <p className="text-2xl font-semibold mt-2">{roundedDuration} minutes</p>
                  <p className="text-sm opacity-90">{roundedLiters} litres recommandes</p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            {!aiLoading && !aiError && aiRecommendation && (
              <>
                <p className="text-xs opacity-90">Confiance: {confidencePercent}%</p>
                <p className="text-xs opacity-75">Raison: {aiRecommendation.reason}</p>
              </>
            )}
            {!aiLoading && aiError && (
              <p className="text-xs opacity-75">Lance l'API FastAPI pour afficher la recommandation en direct.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Parcel Map */}
        <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Carte de la parcelle</h2>
          <div className="relative bg-green-50 rounded-lg h-80 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `repeating-linear-gradient(0deg, #1D9E75 0px, #1D9E75 2px, transparent 2px, transparent 20px),
                                  repeating-linear-gradient(90deg, #1D9E75 0px, #1D9E75 2px, transparent 2px, transparent 20px)`
              }}></div>
            </div>

            {/* Sensors */}
            <div className="absolute top-12 left-16 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #1</span>
            </div>
            <div className="absolute top-32 right-20 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #2</span>
            </div>
            <div className="absolute bottom-16 left-32 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #3</span>
            </div>
            <div className="absolute bottom-20 right-24 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-sm font-medium">Capteur #4</span>
            </div>

            {/* Pump location */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#185FA5] text-white px-4 py-2 rounded-lg shadow-lg">
              <Power className="w-5 h-5" />
              <span className="font-medium">Pompe principale</span>
            </div>
          </div>
        </div>

        {/* Pump Control */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contrôle pompe à distance</h2>

          <div className="mb-4">
            <StatusBadge status={pumpActive ? "active" : "inactive"} label={pumpActive ? "Active" : "Inactive"} />
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-600">Débit actuel</p>
              <p className="text-xl font-semibold text-gray-900">{pumpActive ? "4.2" : "0"} L/min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Durée active</p>
              <p className="text-xl font-semibold text-gray-900">{pumpActive ? "2h 15min" : "0min"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handlePumpAction("open")}
              disabled={pumpActive}
              className={`w-full py-3 rounded-lg font-medium transition-opacity ${
                pumpActive
                  ? "bg-[#1D9E75] text-white opacity-40 cursor-not-allowed"
                  : "bg-[#1D9E75] text-white hover:bg-[#178764]"
              }`}
            >
              Ouvrir la pompe
            </button>
            <button
              onClick={() => handlePumpAction("close")}
              disabled={!pumpActive}
              className={`w-full py-3 rounded-lg font-medium transition-opacity ${
                !pumpActive
                  ? "bg-[#E24B4A] text-white opacity-40 cursor-not-allowed"
                  : "bg-[#E24B4A] text-white hover:bg-[#d04342]"
              }`}
            >
              Fermer la pompe
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Dernières actions
            </h3>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="text-xs text-gray-600">
                  <span className="font-medium">{action.time}</span> - {action.action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmPumpAction}
        title="Confirmer l'action"
        message={`Êtes-vous sûr de vouloir ${pendingAction === "open" ? "ouvrir" : "fermer"} la pompe ?`}
        confirmColor={pendingAction === "open" ? "bg-[#1D9E75]" : "bg-[#E24B4A]"}
      />
    </div>
  );
}
