import { useState } from "react";
import { MapPin, AlertTriangle, CheckCircle, WifiOff, Droplet } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useData } from "../contexts/DataContext";

export function Cooperative() {
  const { farmsData } = useData();
  const [filter, setFilter] = useState<"all" | "alert" | "normal" | "offline">("all");

  const filteredFarms = filter === "all" ? farmsData : farmsData.filter((f) => f.status === filter);

  const totalConsumption = farmsData.reduce((sum, farm) => sum + farm.consumption, 0);
  const activeAlerts = farmsData.reduce((sum, farm) => sum + farm.alerts, 0);
  const connectedFarms = farmsData.filter((f) => f.status !== "offline").length;

  const statusIcons = {
    alert: AlertTriangle,
    normal: CheckCircle,
    offline: WifiOff,
  };

  const statusColors = {
    alert: "text-[#E24B4A]",
    normal: "text-[#1D9E75]",
    offline: "text-gray-400",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Vue Coopérative - Souss Massa</h1>

      {/* Global Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#185FA5] rounded-lg">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Consommation totale</p>
              <p className="text-2xl font-semibold text-gray-900">{(totalConsumption / 1000).toFixed(1)}k L</p>
              <p className="text-xs text-gray-500">Ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E24B4A] rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alertes actives</p>
              <p className="text-2xl font-semibold text-gray-900">{activeAlerts}</p>
              <p className="text-xs text-gray-500">Total région</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1D9E75] rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exploitations connectées</p>
              <p className="text-2xl font-semibold text-gray-900">{connectedFarms}/{farmsData.length}</p>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-600 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Zone couverte</p>
              <p className="text-2xl font-semibold text-gray-900">Souss Massa</p>
              <p className="text-xs text-gray-500">Maroc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Filters */}
      <div className="grid grid-cols-3 gap-6">
        {/* Map */}
        <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Carte de la région</h2>
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg h-96 overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #1D9E75 0px, #1D9E75 1px, transparent 1px, transparent 30px),
                                  repeating-linear-gradient(90deg, #1D9E75 0px, #1D9E75 1px, transparent 1px, transparent 30px)`,
                }}
              ></div>
            </div>

            {/* Title overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
              <p className="text-sm font-semibold text-gray-900">Région Souss Massa</p>
              <p className="text-xs text-gray-600">7 exploitations</p>
            </div>

            {/* Farm markers */}
            {filteredFarms.map((farm) => {
              const Icon = statusIcons[farm.status];
              return (
                <div
                  key={farm.id}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${farm.location.x}%`,
                    top: `${farm.location.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`p-2 bg-white rounded-full shadow-lg border-2 ${
                      farm.status === "alert"
                        ? "border-[#E24B4A]"
                        : farm.status === "normal"
                        ? "border-[#1D9E75]"
                        : "border-gray-400"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${statusColors[farm.status]}`} />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
                      <p className="font-semibold">{farm.name}</p>
                      <p className="text-xs opacity-75">{farm.owner}</p>
                      {farm.alerts > 0 && (
                        <p className="text-xs text-[#E24B4A] mt-1">{farm.alerts} alerte(s)</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="space-y-2">
            <button
              onClick={() => setFilter("all")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-[#185FA5] text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">Toutes</span>
              <span className="text-sm">{farmsData.length}</span>
            </button>
            <button
              onClick={() => setFilter("alert")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                filter === "alert"
                  ? "bg-[#E24B4A] text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">Alertes actives</span>
              <span className="text-sm">{farmsData.filter((f) => f.status === "alert").length}</span>
            </button>
            <button
              onClick={() => setFilter("normal")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                filter === "normal"
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">Normal</span>
              <span className="text-sm">{farmsData.filter((f) => f.status === "normal").length}</span>
            </button>
            <button
              onClick={() => setFilter("offline")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                filter === "offline"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">Hors ligne</span>
              <span className="text-sm">{farmsData.filter((f) => f.status === "offline").length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Farms List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des exploitations</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Exploitation</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Propriétaire</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Consommation (ce mois)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Alertes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFarms.map((farm) => (
              <tr key={farm.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{farm.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{farm.owner}</td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={farm.status === "alert" ? "inactive" : farm.status === "offline" ? "warning" : "active"}
                    label={
                      farm.status === "alert"
                        ? "Alerte"
                        : farm.status === "offline"
                        ? "Hors ligne"
                        : "Normal"
                    }
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">
                    {farm.consumption.toLocaleString()} L
                  </span>
                </td>
                <td className="px-6 py-4">
                  {farm.alerts > 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FCEBEB] text-[#791F1F] rounded-full text-sm font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      {farm.alerts}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Aucune</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
