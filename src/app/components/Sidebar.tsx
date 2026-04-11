import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  History,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "./Logo";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Capteurs", href: "/sensors", icon: Radio },
  { name: "Alertes", href: "/alerts", icon: AlertTriangle },
  { name: "Historique", href: "/history", icon: History },
  { name: "Rapport", href: "/report", icon: FileText },
  { name: "Vue Coopérative", href: "/cooperative", icon: Users },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Logo size="md" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#1D9E75] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
