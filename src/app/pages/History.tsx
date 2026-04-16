import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, CheckCircle, XCircle } from "lucide-react";

// Removed static mock data arrays.

import { useData } from "../contexts/DataContext";

export function History() {
  const { historyRecords, waterConsumptionData } = useData();
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  // Derive dynamic chart data from the live simulation
  const totalWeekConsumption = waterConsumptionData.reduce((sum, item) => sum + item.consumption, 0);

  const chartData = period === "week" ? waterConsumptionData : period === "month" ? [
    { label: "Sem 1", consumption: totalWeekConsumption },
    { label: "Sem 2", consumption: Math.round(totalWeekConsumption * 0.95) },
    { label: "Sem 3", consumption: Math.round(totalWeekConsumption * 1.05) },
    { label: "Sem 4", consumption: Math.round(totalWeekConsumption * 1.1) }
  ] : [
    { label: "Jan", consumption: totalWeekConsumption * 4 },
    { label: "Fév", consumption: totalWeekConsumption * 3.8 },
    { label: "Mar", consumption: totalWeekConsumption * 4.2 },
    { label: "Avr", consumption: totalWeekConsumption * 4.5 },
  ];

  const totalConsumption = chartData.reduce((sum, item) => sum + item.consumption, 0);
  const aiFollowedCount = historyRecords.filter(r => r.aiFollowed).length;
  const aiFollowedPct = historyRecords.length > 0 ? Math.round((aiFollowedCount / historyRecords.length) * 100) : 0;
  const dailyAverage = Math.round(totalConsumption / chartData.length);

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
          <p className="text-2xl font-semibold text-gray-900">{totalConsumption} L</p>
          <p className="text-xs text-gray-500 mt-1">Sur la période</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Économies (vs normale)</p>
          <p className="text-2xl font-semibold text-[#1D9E75]">18%</p>
          <p className="text-xs text-gray-500 mt-1">Estimées par IA</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">IA suivie</p>
          <p className="text-2xl font-semibold text-gray-900">{aiFollowedPct}%</p>
          <p className="text-xs text-gray-500 mt-1">des recommandations</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Moyenne journalière</p>
          <p className="text-2xl font-semibold text-gray-900">{dailyAverage} L</p>
          <p className="text-xs text-gray-500 mt-1">Sur la période</p>
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
            <XAxis dataKey={period === "week" ? "label" : "month"} stroke="#6b7280" />
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
        {historyRecords.length === 0 && (
          <p className="text-gray-500 italic p-6 text-center border-t border-gray-200">Aucun historique d'irrigation trouvé.</p>
        )}
      </div>
    </div>
  );
}
