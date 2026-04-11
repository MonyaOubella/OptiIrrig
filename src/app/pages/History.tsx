import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, CheckCircle, XCircle } from "lucide-react";

const monthlyData = [
  { month: "Jan", consumption: 8500 },
  { month: "Fév", consumption: 7800 },
  { month: "Mar", consumption: 9200 },
  { month: "Avr", consumption: 8900 },
  { month: "Mai", consumption: 9800 },
  { month: "Juin", consumption: 10500 },
  { month: "Juil", consumption: 11200 },
  { month: "Août", consumption: 10800 },
  { month: "Sep", consumption: 9500 },
  { month: "Oct", consumption: 8700 },
  { month: "Nov", consumption: 8200 },
  { month: "Déc", consumption: 7900 },
];

const weeklyData = [
  { day: "Lun", consumption: 320 },
  { day: "Mar", consumption: 280 },
  { day: "Mer", consumption: 350 },
  { day: "Jeu", consumption: 290 },
  { day: "Ven", consumption: 310 },
  { day: "Sam", consumption: 270 },
  { day: "Dim", consumption: 300 },
];

interface HistoryRecord {
  id: number;
  date: string;
  volume: string;
  duration: string;
  aiFollowed: boolean;
}

const historyRecords: HistoryRecord[] = [
  {
    id: 1,
    date: "11 Avr 2026 - 06:00",
    volume: "450 L",
    duration: "45 min",
    aiFollowed: true,
  },
  {
    id: 2,
    date: "10 Avr 2026 - 06:00",
    volume: "420 L",
    duration: "42 min",
    aiFollowed: true,
  },
  {
    id: 3,
    date: "09 Avr 2026 - 06:15",
    volume: "480 L",
    duration: "48 min",
    aiFollowed: false,
  },
  {
    id: 4,
    date: "08 Avr 2026 - 06:00",
    volume: "430 L",
    duration: "43 min",
    aiFollowed: true,
  },
  {
    id: 5,
    date: "07 Avr 2026 - 06:30",
    volume: "390 L",
    duration: "39 min",
    aiFollowed: false,
  },
  {
    id: 6,
    date: "06 Avr 2026 - 06:00",
    volume: "410 L",
    duration: "41 min",
    aiFollowed: true,
  },
  {
    id: 7,
    date: "05 Avr 2026 - 06:00",
    volume: "460 L",
    duration: "46 min",
    aiFollowed: true,
  },
];

export function History() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const chartData = period === "week" ? weeklyData : monthlyData;

  const handleExport = () => {
    console.log("Exporting PDF...");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Historique de consommation</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-lg font-medium hover:bg-[#144a85] transition-colors"
        >
          <Download className="w-5 h-5" />
          Exporter PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Consommation totale</p>
          <p className="text-2xl font-semibold text-gray-900">112,300 L</p>
          <p className="text-xs text-gray-500 mt-1">Ce mois</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Économies réalisées</p>
          <p className="text-2xl font-semibold text-[#1D9E75]">18%</p>
          <p className="text-xs text-gray-500 mt-1">vs mois dernier</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">IA suivie</p>
          <p className="text-2xl font-semibold text-gray-900">71%</p>
          <p className="text-xs text-gray-500 mt-1">des recommandations</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Moyenne quotidienne</p>
          <p className="text-2xl font-semibold text-gray-900">440 L</p>
          <p className="text-xs text-gray-500 mt-1">7 derniers jours</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Consommation d'eau</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "week"
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "month"
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "year"
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Année
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={period === "week" ? "day" : "month"} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="consumption" fill="#1D9E75" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Détail des irrigations récentes</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Volume</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Durée</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Recommandation IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {historyRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-700">{record.date}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{record.volume}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{record.duration}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {record.aiFollowed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-[#1D9E75]" />
                        <span className="text-sm text-[#1D9E75] font-medium">Suivie</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500 font-medium">Non suivie</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
