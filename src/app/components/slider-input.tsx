import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  suffix?: string;
  referenceValue?: number;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  suffix = '',
  referenceValue,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : value.toLocaleString('de-CH');
  const hasReferenceValue = typeof referenceValue === 'number' && Number.isFinite(referenceValue);
  const clampedReferenceValue = hasReferenceValue ? Math.min(Math.max(referenceValue, min), max) : null;
  const referencePosition = clampedReferenceValue === null || max === min
    ? null
    : ((clampedReferenceValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              onChange(Math.min(Math.max(newValue, min), max));
            }}
            className="w-28 rounded-lg border border-border bg-input-background px-3 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            min={min}
            max={max}
            step={step}
          />
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <SliderPrimitive.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
          {referencePosition !== null && (
            <div
              className="pointer-events-none absolute top-1/2 z-10 h-4 w-0 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${referencePosition}%` }}
              aria-hidden="true"
            >
              <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-amber-500 shadow-sm" />
            </div>
          )}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-card shadow transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue ? formatValue(min) : min.toLocaleString('de-CH')}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString('de-CH')}</span>
      </div>
    </div>
  );
}
