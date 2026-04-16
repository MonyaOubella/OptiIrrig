import { User, Wifi, WifiOff } from "lucide-react";
import { useMqtt } from "../contexts/MqttContext";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Ahmed Bennani" }: HeaderProps) {
  const { connected } = useMqtt();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${connected ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        {connected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Réseau IoT Connecté</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-xs font-medium text-red-700">Réseau IoT Déconnecté</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">Agriculteur</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
}
