import { User } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Ahmed Bennani" }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
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
