import { Settings as SettingsIcon, User, Bell, Shield, Database, RefreshCw } from "lucide-react";
import { useData } from "../contexts/DataContext";

export function Settings() {
  const { resetSimulation } = useData();

  const handleReset = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données de simulation ?")) {
      resetSimulation();
      alert("Données réinitialisées avec succès !");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#1D9E75] rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          </div>
          <p className="text-gray-600 mb-4">Gérez vos informations personnelles</p>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Modifier le profil
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#185FA5] rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <p className="text-gray-600 mb-4">Configurez vos alertes et notifications</p>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Configurer
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          </div>
          <p className="text-gray-600 mb-4">Mot de passe et authentification</p>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Modifier
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Données & Simulation</h2>
          </div>
          <p className="text-gray-600 mb-4">Gestion des données locales et réinitialisation de la simulation.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Exporter CSV
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 flex items-center gap-2 bg-[#E24B4A] text-white rounded-lg font-medium hover:bg-[#d04342] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
