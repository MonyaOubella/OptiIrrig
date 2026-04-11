import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react";

export function Settings() {
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
            <h2 className="text-lg font-semibold text-gray-900">Données</h2>
          </div>
          <p className="text-gray-600 mb-4">Gestion et exportation des données</p>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Gérer
          </button>
        </div>
      </div>
    </div>
  );
}
