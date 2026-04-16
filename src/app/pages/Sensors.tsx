import { useState } from "react";
import { Plus, Filter, Activity } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useData } from "../contexts/DataContext";
import { useMqtt } from "../contexts/MqttContext";

interface Sensor {
  id: string;
  farmId: number;
  type: string;
  location: string;
  value: string;
  status: "active" | "inactive" | "warning";
  lastUpdate: string;
}

export function Sensors() {
  const { farmsData } = useData();
  const { sensorData } = useMqtt();
  const [selectedType, setSelectedType] = useState<string>("all");

  const sensors: Sensor[] = farmsData.flatMap((farm) => {
    const isOffline = farm.status === "offline";
    const statusVal = farm.status === "alert" ? "warning" : isOffline ? "inactive" : "active";
    const updateTime = isOffline ? "Déconnecté" : "À l'instant";

    const baseSensor = {
      id: `#${farm.id}-H`,
      farmId: farm.id,
      type: "Humidité du sol",
      location: farm.name + " (M)",
      value: farm.liveMoisture ? `${Math.round(farm.liveMoisture)}%` : "N/A",
      status: statusVal as "warning"|"inactive"|"active",
      lastUpdate: updateTime,
    };

    if (farm.id === 1) {
      // Primary Node injects Temp & Pressure
      return [
        baseSensor,
        {
          id: `#${farm.id}-T`,
          farmId: farm.id,
          type: "Température",
          location: farm.name + " (T)",
          value: farm.liveTemperature ? `${Math.round(farm.liveTemperature)}°C` : "N/A",
          status: statusVal,
          lastUpdate: updateTime,
        },
        {
          id: `#${farm.id}-P`,
          farmId: farm.id,
          type: "Pression",
          location: "Pompe Principale",
          value: `${sensorData.pressure.toFixed(1)} bar`,
          status: statusVal,
          lastUpdate: updateTime,
        }
      ];
    }
    return [baseSensor];
  });
  
  // Sort to ensure Primary Node (Ben Ahmed, id 1) is at the top
  sensors.sort((a, b) => {
    if (a.farmId === 1) return -1;
    if (b.farmId === 1) return 1;
    return 0;
  });

  const sensorTypes = ["all", ...Array.from(new Set(sensors.map((s) => s.type)))];

  const filteredSensors =
    selectedType === "all" ? sensors : sensors.filter((s) => s.type === selectedType);

  const statusLabels = {
    active: "Actif",
    inactive: "Inactif",
    warning: "Avertissement",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Capteurs</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#178764] transition-colors">
          <Plus className="w-5 h-5" />
          Ajouter un capteur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#EAF3DE] rounded-lg p-4">
          <p className="text-sm text-[#27500A] mb-1">Capteurs actifs</p>
          <p className="text-3xl font-semibold text-[#27500A]">
            {sensors.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-800 mb-1">Avertissements</p>
          <p className="text-3xl font-semibold text-orange-800">
            {sensors.filter((s) => s.status === "warning").length}
          </p>
        </div>
        <div className="bg-[#FCEBEB] rounded-lg p-4">
          <p className="text-sm text-[#791F1F] mb-1">Hors ligne</p>
          <p className="text-3xl font-semibold text-[#791F1F]">
            {sensors.filter((s) => s.status === "inactive").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filtrer par type :</span>
        <div className="flex gap-2 flex-wrap">
          {sensorTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? "Tous" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Sensors Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Emplacement</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valeur</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSensors.map((sensor) => (
              <tr key={sensor.id} className={`${sensor.farmId === 1 ? 'bg-[#f0f9f6]' : ''} hover:bg-gray-50 transition-colors`}>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{sensor.id}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    {sensor.type} 
                    {sensor.farmId === 1 && (
                      <span className="inline-flex items-center gap-1 bg-[#1D9E75] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        <Activity className="w-3 h-3 animate-pulse" /> Live
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{sensor.location}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{sensor.value}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={sensor.status}
                    label={statusLabels[sensor.status]}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{sensor.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
