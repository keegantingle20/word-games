import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GameCard({
  href,
  title,
  description,
  status = "available",
  streak = 0,
}: {
  href: string;
  title: string;
  description: string;
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={href}
        className={cn(
          "block p-6 rounded-lg border-2 transition-all duration-200",
          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          "hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md",
          status === "won" && "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20",
          status === "lost" && "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="text-2xl ml-4 flex-shrink-0">
            {getStatusIcon()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {streak > 0 && (
              <span className="font-medium">
                Streak: {streak}
              </span>
            )}
          </div>
          <div className={cn(
            "text-sm font-semibold px-3 py-1 rounded-full",
            status === "won" && "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
            status === "lost" && "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
            status === "available" && "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          )}>
            {getStatusText()}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}