import React from "react";
import { useDwellClick } from "../hooks/useDwellClick";

interface VirtualKeyboardProps {
  onKey: (key: string) => void;
  dwellEnabled: boolean;
  dwellTime: number;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

interface KeyButtonProps {
  label: string;
  onKey: (key: string) => void;
  dwellEnabled: boolean;
  dwellTime: number;
  wide?: boolean;
}

function KeyButton({
  label,
  onKey,
  dwellEnabled,
  dwellTime,
  wide,
}: KeyButtonProps) {
  const { progressRef, handlers } = useDwellClick({
    dwellTime,
    enabled: dwellEnabled,
    onDwell: () => onKey(label),
  });

  return (
    <button
      onClick={() => !dwellEnabled && onKey(label)}
      {...(dwellEnabled ? handlers : {})}
      className={`relative overflow-hidden rounded-md border border-border bg-card hover:bg-accent transition-colors font-mono font-semibold text-sm select-none min-touch flex items-center justify-center ${
        wide ? "px-4 py-3 min-w-[80px]" : "w-10 h-10 sm:w-11 sm:h-11"
      }`}
    >
      {label === "SPACE" ? "⎵ Space" : label === "BACK" ? "⌫" : label}
      {dwellEnabled && (
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 h-1 bg-primary transition-none rounded-b-md"
          style={{ width: "0%" }}
        />
      )}
    </button>
  );
}

export default function VirtualKeyboard({
  onKey,
  dwellEnabled,
  dwellTime,
}: VirtualKeyboardProps) {
  return (
    <div className="space-y-2 select-none">
      {ROWS.map((row) => (
        <div
          key={row.join("-")}
          className="flex justify-center gap-1 flex-wrap"
        >
          {row.map((key) => (
            <KeyButton
              key={key}
              label={key}
              onKey={onKey}
              dwellEnabled={dwellEnabled}
              dwellTime={dwellTime}
            />
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-2">
        <KeyButton
          label="SPACE"
          onKey={() => onKey(" ")}
          dwellEnabled={dwellEnabled}
          dwellTime={dwellTime}
          wide
        />
        <KeyButton
          label="BACK"
          onKey={() => onKey("BACK")}
          dwellEnabled={dwellEnabled}
          dwellTime={dwellTime}
          wide
        />
      </div>
    </div>
  );
}
