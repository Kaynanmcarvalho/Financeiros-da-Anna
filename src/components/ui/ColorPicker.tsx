import { useState } from 'react';

const PRESET_COLORS = [
  '#FF9B9B', '#FFB5B5', '#FDCFE8', '#F9D5E5', '#E891B9',
  '#D4A5C7', '#C3B1E1', '#B088C9', '#9B72B0', '#E8D5F5',
  '#A8D8EA', '#88B0C9', '#7298B0', '#D5E8F5', '#B5EAD7',
  '#88C9B0', '#72B098', '#D5F5E8', '#FFD6A5', '#F7DC6F',
  '#F0B27A', '#E59866', '#D4D4D8', '#A1A1AA', '#71717A',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  return (
    <div className="color-picker">
      {label && <span className="input-label">{label}</span>}
      <div className="color-picker-grid">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-picker-item ${value === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Cor ${color}`}
            aria-pressed={value === color}
          />
        ))}
      </div>
      <div className="color-picker-custom">
        <label htmlFor="custom-color" className="color-picker-custom-label">
          Cor personalizada:
        </label>
        <input
          id="custom-color"
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onChange(e.target.value);
          }}
          className="color-picker-custom-input"
        />
        <span className="color-picker-hex">{value}</span>
      </div>
    </div>
  );
}
