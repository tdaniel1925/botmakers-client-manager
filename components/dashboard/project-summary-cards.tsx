import { GradientCard, GradientVariant } from "@/components/ui/gradient-card";
import { FolderKanban, PlayCircle, Clock, CheckCircle2 } from "lucide-react";

interface ProjectSummaryCardsProps {
  stats: {
    total: number;
    active: number;
    planning: number;
    completed: number;
  };
}

export function ProjectSummaryCards({ stats }: ProjectSummaryCardsProps) {
  const cards = [
    {
      title: "Total Projects",
      value: stats.total,
      icon: FolderKanban,
      variant: "indigo" as GradientVariant,
      iconColor: "text-indigo-600",
    },
    {
      title: "Active Projects",
      value: stats.active,
      icon: PlayCircle,
      variant: "teal" as GradientVariant,
      iconColor: "text-teal-600",
    },
    {
      title: "In Planning",
      value: stats.planning,
      icon: Clock,
      variant: "amber" as GradientVariant,
      iconColor: "text-amber-600",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      variant: "violet" as GradientVariant,
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <GradientCard key={card.title} variant={card.variant} className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
              <span className="text-3xl font-semibold">{card.value}</span>
            </div>
            <span className="text-sm text-neutral-600">{card.title}</span>
          </GradientCard>
        );
      })}
    </div>
  );
}
