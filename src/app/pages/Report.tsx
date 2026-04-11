import { FileText, Download, Calendar } from "lucide-react";

export function Report() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Rapports</h1>

      <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Section Rapports</h2>
        <p className="text-gray-600 mb-6">Générez et téléchargez vos rapports d'irrigation</p>
        <div className="flex gap-4 justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#178764] transition-colors">
            <Calendar className="w-5 h-5" />
            Rapport mensuel
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#185FA5] text-white rounded-lg font-medium hover:bg-[#144a85] transition-colors">
            <Download className="w-5 h-5" />
            Rapport annuel
          </button>
        </div>
      </div>
    </div>
  );
}
