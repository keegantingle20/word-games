import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GameCard({
  href,
  title,
  description,
  accent = "accent",
  status = "available",
  streak = 0,
}: {
  href: string;
  title: string;
  description: string;
  accent?: string;
  status?: "available" | "won" | "lost";
  streak?: number;
}) {
  const getStatusIcon = () => {
    switch (status) {
      case "won":
        return "✅";
      case "lost":
        return "❌";
      default:
        return "▶️";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "won":
        return "Complete";
      case "lost":
        return "Try again tomorrow";
      default:
        return "Play now";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
    >
      <Link
        href={href}
        className={cn(
          "block rounded-2xl p-5 sm:p-6",
          "border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800",
          "shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all",
          status === "won" && "ring-2 ring-green-500",
          status === "lost" && "ring-2 ring-red-500"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{description}</p>
          </div>
          <div className="text-2xl ml-2">
            {getStatusIcon()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {streak > 0 && `Streak: ${streak}`}
          </div>
          <div className={cn(
            "text-sm font-medium",
            status === "won" && "text-green-600 dark:text-green-400",
            status === "lost" && "text-red-600 dark:text-red-400",
            status === "available" && "text-blue-600 dark:text-blue-400"
          )}>
            {getStatusText()}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}