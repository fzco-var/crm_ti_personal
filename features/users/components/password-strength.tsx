import { TONE_DOT_CLASSES, type Tone } from "@/components/tone";
import { PASSWORD_STRENGTH_LEVELS } from "@/features/users/constants";
import { getPasswordStrength } from "@/features/users/utils";

// El texto del nivel usa el color de la barra, como en la plantilla.
const TONE_TEXT_CLASSES: Record<Tone, string> = {
  orange: "text-tone-orange-dot",
  blue: "text-tone-blue-dot",
  amber: "text-tone-amber-dot",
  green: "text-tone-green-dot",
  gray: "text-tone-gray-dot",
  red: "text-tone-red-dot",
  purple: "text-tone-purple-dot",
};

const SEGMENTS = [1, 2, 3, 4];

/** 4 segmentos ocultos al lector de pantalla; el texto del nivel es visible. */
export function PasswordStrength({
  password,
  emptyLabel,
}: {
  password: string;
  /** Texto con la contraseña vacía; por defecto, el de la plantilla de alta. */
  emptyLabel?: string;
}) {
  const strength = getPasswordStrength(password);
  const { label, tone } = PASSWORD_STRENGTH_LEVELS[strength];

  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="grid flex-1 grid-cols-4 gap-1">
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={`h-[5px] rounded-[3px] ${
              tone && segment <= strength
                ? TONE_DOT_CLASSES[tone]
                : "bg-line-soft"
            }`}
          />
        ))}
      </span>
      <span
        className={`min-w-[120px] flex-none text-compact font-semibold ${
          tone ? TONE_TEXT_CLASSES[tone] : "text-ink-muted"
        }`}
      >
        {strength === 0 && emptyLabel ? emptyLabel : label}
      </span>
    </div>
  );
}
