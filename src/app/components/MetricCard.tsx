import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string | ReactNode;
  unit?: string;
}

export function MetricCard({ icon: Icon, iconColor, label, value, unit }: MetricCardProps) {
  return (
    <div className="bg-[#F5F5F5] rounded-lg p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${iconColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {value}
          {unit && <span className="text-lg ml-1 text-gray-600">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
