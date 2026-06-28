export type LoadingOverlayProps = {
  label: string;
};

function LoadingOverlay({ label }: LoadingOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex h-full w-full items-center justify-center bg-[#fdfeff]/30 dark:bg-zinc-900/20"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className="block h-8 w-8 animate-spin rounded-full border-[3px] border-powderBlue-200 border-t-powderBlue-600 dark:border-powderBlue-600 dark:border-t-powderBlue-100"
        aria-hidden="true"
      />
    </div>
  );
}

export default LoadingOverlay;
