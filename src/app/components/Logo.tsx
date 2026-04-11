import { Droplet, Leaf } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <Leaf className="w-full h-full text-[#1D9E75]" fill="#1D9E75" />
        <Droplet
          className="w-1/2 h-1/2 absolute text-[#185FA5]"
          fill="#185FA5"
          style={{ top: "30%", left: "25%" }}
        />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-semibold text-[#1D9E75]`}>
          OptiIrrig
        </span>
      )}
    </div>
  );
}
