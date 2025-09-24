import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GameCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl p-5 sm:p-6",
        "border border-black/10 dark:border-white/10 bg-[var(--card)]",
        "shadow hover:shadow-lg hover:-translate-y-0.5 transition-all"
      )}
    >
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm opacity-70">{description}</p>
      </div>
    </Link>
  );
}
