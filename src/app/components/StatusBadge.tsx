interface StatusBadgeProps {
  status: "active" | "inactive" | "warning" | "normal";
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    active: "bg-[#EAF3DE] text-[#27500A]",
    inactive: "bg-[#FCEBEB] text-[#791F1F]",
    warning: "bg-orange-100 text-orange-800",
    normal: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}
