import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color?: string;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "purple" }: Props) {
  return (
    <div className={`bg-gradient-to-r from-${color}-500 to-${color}-600 text-white p-6 rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-white/80 text-sm">{subtitle}</p>
        </div>
        <Icon className="w-8 h-8 text-white/80" />
      </div>
    </div>
  );
}
