import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Sprout } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
            Bienvenue sur OptiIrrig
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Connectez-vous pour gérer votre irrigation
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#1D9E75] border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-[#1D9E75] hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1D9E75] text-white py-3 rounded-lg font-medium hover:bg-[#178764] transition-colors"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1D9E75] to-[#185FA5] items-center justify-center p-12">
        <div className="text-center text-white">
          <Sprout className="w-32 h-32 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-semibold mb-4">Irrigation Intelligente</h2>
          <p className="text-lg opacity-90 max-w-md">
            Optimisez votre consommation d'eau et surveillez vos cultures en temps réel avec OptiIrrig
          </p>
        </div>
      </div>
    </div>
  );
}
