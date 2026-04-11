import { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Droplet, Activity, Gauge, Power, MapPin, Lightbulb, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export function Dashboard() {
  const [pumpActive, setPumpActive] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"open" | "close" | null>(null);
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

  const confirmPumpAction = () => {
    if (pendingAction === "open") {
      setPumpActive(true);
      const newAction = {
        id: actions.length + 1,
        action: "Pompe ouverte manuellement",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setActions([newAction, ...actions.slice(0, 4)]);
    } else if (pendingAction === "close") {
      setPumpActive(false);
      const newAction = {
        id: actions.length + 1,
        action: "Pompe fermée manuellement",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setActions([newAction, ...actions.slice(0, 4)]);
    }
    setPendingAction(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon={Droplet}
          iconColor="bg-[#1D9E75]"
          label="Humidité du sol"
          value="68"
          unit="%"
        />
        <MetricCard
          icon={Activity}
          iconColor="bg-[#185FA5]"
          label="Débit d'eau"
          value="4.2"
          unit="L/min"
        />
        <MetricCard icon={Gauge} iconColor="bg-orange-500" label="Pression" value="2.1" unit="bar" />
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
            <div>
              <h3 className="font-semibold text-lg mb-2">Recommandation IA</h3>
              <p className="text-sm opacity-90">
                Irriguer demain à <strong>6h00</strong>
              </p>
              <p className="text-2xl font-semibold mt-2">45 minutes</p>
              <p className="text-sm opacity-90">recommandées</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-75">
              Basé sur : prévisions météo, humidité actuelle, historique de consommation
            </p>
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
