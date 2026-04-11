import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

interface Sensor {
  id: string;
  type: string;
  location: string;
  value: string;
  status: "active" | "inactive" | "warning";
  lastUpdate: string;
}

const sensorsData: Sensor[] = [
  {
    id: "#1",
    type: "Humidité du sol",
    location: "Secteur A - Nord",
    value: "68%",
    status: "active",
    lastUpdate: "Il y a 2 min",
  },
  {
    id: "#2",
    type: "Débit d'eau",
    location: "Conduite principale",
    value: "4.2 L/min",
    status: "active",
    lastUpdate: "Il y a 1 min",
  },
  {
    id: "#3",
    type: "Humidité du sol",
    location: "Secteur B - Est",
    value: "45%",
    status: "warning",
    lastUpdate: "Il y a 3 min",
  },
  {
    id: "#4",
    type: "Pression",
    location: "Pompe principale",
    value: "2.1 bar",
    status: "active",
    lastUpdate: "Il y a 1 min",
  },
  {
    id: "#5",
    type: "Température",
    location: "Secteur C - Sud",
    value: "28°C",
    status: "active",
    lastUpdate: "Il y a 5 min",
  },
  {
    id: "#6",
    type: "Humidité du sol",
    location: "Secteur A - Sud",
    value: "72%",
    status: "active",
    lastUpdate: "Il y a 2 min",
  },
  {
    id: "#7",
    type: "Débit d'eau",
    location: "Secteur B",
    value: "0 L/min",
    status: "inactive",
    lastUpdate: "Il y a 3h",
  },
  {
    id: "#8",
    type: "Pression",
    location: "Zone secondaire",
    value: "1.8 bar",
    status: "active",
    lastUpdate: "Il y a 4 min",
  },
];

export function Sensors() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sensors] = useState<Sensor[]>(sensorsData);

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
              <tr key={sensor.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{sensor.id}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{sensor.type}</td>
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
