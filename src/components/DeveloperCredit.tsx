export function DeveloperCredit() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground">Developed by</span>
      <span className="inline-flex rounded-md bg-white px-2 py-1">
        <img src="/vdart-logo.png" alt="VDart" className="h-8 w-[64px] object-contain" />
      </span>
    </div>
  );
}
