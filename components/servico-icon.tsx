import {
  Bus,
  Compass,
  Hotel,
  Map,
  Plane,
  Ship,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  plane: Plane,
  ship: Ship,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  hotel: Hotel,
  map: Map,
  compass: Compass,
  bus: Bus,
};

type Props = {
  icon: string;
  className?: string;
};

export function ServicoIcon({ icon, className }: Props) {
  const Icon = iconMap[icon.toLowerCase()] ?? Compass;
  return <Icon className={className} />;
}
