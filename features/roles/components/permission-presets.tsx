"use client";

import { PERMISSION_PRESETS } from "@/features/roles/constants";

/** `value` es el `id` de la plantilla pulsada, o `null` tras tocar la matriz. */
export function PermissionPresets({
  value,
  onPick,
  disabled = false,
}: {
  value: string | null;
  onPick: (presetId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Plantillas de permisos"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-2.5"
    >
      {PERMISSION_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          aria-pressed={value === preset.id}
          disabled={disabled}
          onClick={() => onPick(preset.id)}
          className="flex min-h-16 cursor-pointer flex-col items-start gap-1 rounded-[10px] border border-line bg-surface px-3.5 py-3 text-left text-ink hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45 aria-pressed:border-ink aria-pressed:bg-surface-muted"
        >
          <span className="text-sm font-bold">{preset.label}</span>
          <span className="text-xs text-ink-muted">{preset.desc}</span>
        </button>
      ))}
    </div>
  );
}
