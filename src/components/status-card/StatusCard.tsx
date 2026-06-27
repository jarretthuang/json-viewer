import type { AriaRole, ReactNode } from "react";

export type StatusCardProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  role?: AriaRole;
  ariaLive?: "off" | "polite" | "assertive";
  ariaLabel?: string;
  size?: "default" | "compact";
  surface?: "plain" | "muted";
  titleLevel?: 1 | 2;
};

function StatusCard({
  eyebrow,
  title,
  description,
  action,
  className,
  role,
  ariaLive,
  ariaLabel,
  size = "default",
  surface = "plain",
  titleLevel = 2,
}: StatusCardProps) {
  const sizeClassName =
    size === "compact"
      ? "max-w-[260px] rounded-2xl p-4"
      : "max-w-[360px] rounded-3xl p-5 md:rounded-2xl";
  const surfaceClassName =
    surface === "muted"
      ? "bg-white/60 ring-1 ring-slate-950/[0.06] shadow-sm dark:bg-white/[0.03] dark:ring-white/[0.08]"
      : "bg-white/55 ring-1 ring-slate-950/[0.06] shadow-sm dark:bg-white/[0.025] dark:ring-white/[0.08]";
  const cardClassName = [
    "m-auto flex w-full flex-col items-center text-center backdrop-blur",
    sizeClassName,
    surfaceClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const titleClassName =
    "text-[24px] font-semibold !text-powderBlue-600 dark:!text-powderBlue-100";

  return (
    <div
      className={cardClassName}
      role={role}
      aria-live={ariaLive}
      aria-label={ariaLabel}
    >
      {eyebrow && (
        <p className="text-[40px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {eyebrow}
        </p>
      )}
      {titleLevel === 1 ? (
        <h1 className={titleClassName}>{title}</h1>
      ) : (
        <h2 className={titleClassName}>{title}</h2>
      )}
      {description && (
        <p className="text-[16px] text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export default StatusCard;
