import { User, Power } from "lucide-react";
import { useMqtt } from "../contexts/MqttContext";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Ahmed Bennani" }: HeaderProps) {
  const { pumpActive, togglePump, connected } = useMqtt();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="flex items-center gap-6">
        
        {/* Global Pump Control */}
        <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Statut Pompe</p>
            <p className={`text-xs ${connected ? (pumpActive ? "text-[#1D9E75]" : "text-gray-500") : "text-[#E24B4A]"}`}>
              {!connected ? "Hors Ligne" : (pumpActive ? "En marche" : "Arrêtée")}
            </p>
          </div>
          <button
            onClick={() => togglePump(pumpActive ? "close" : "open")}
            disabled={!connected}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm ${
              !connected 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : pumpActive 
                  ? "bg-[#E24B4A] hover:bg-red-600 text-white" 
                  : "bg-[#1D9E75] hover:bg-green-600 text-white"
            }`}
            title={pumpActive ? "Arrêter la pompe immédiatement" : "Démarrer la pompe"}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Agriculteur</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
