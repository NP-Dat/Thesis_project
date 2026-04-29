"use client";

interface RadioOptionProps {
  label: string;
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
}

export default function RadioOption({
  label,
  value,
  selected,
  onSelect,
}: RadioOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left px-5 py-4 rounded-lg border transition-all cursor-pointer font-sans text-base ${
        selected
          ? "border-terracotta bg-terracotta/10 text-near-black shadow-[#c96442_0px_0px_0px_2px]"
          : "border-border-warm bg-ivory text-olive-gray hover:border-ring-warm hover:bg-warm-sand/40"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            selected ? "border-terracotta" : "border-stone-gray"
          }`}
        >
          {selected && (
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          )}
        </span>
        {label}
      </span>
    </button>
  );
}
