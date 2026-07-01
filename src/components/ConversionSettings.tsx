import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { QUALITY_PRESETS } from '@/config/app';
import { ConversionOptions } from '@/types/conversion';

interface ConversionSettingsProps {
  options: ConversionOptions;
  disabled: boolean;
  onChange: (options: ConversionOptions) => void;
}

const updateNumber = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(1, parsed) : fallback;
};

export const ConversionSettings: React.FC<ConversionSettingsProps> = ({ options, disabled, onChange }) => {
  const update = (patch: Partial<ConversionOptions>) => onChange({ ...options, ...patch });
  const rangeInvalid = options.pageMode === 'range' && options.endPage < options.startPage;

  return (
    <section className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 space-y-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-brand-600" />
        <h2 className="font-semibold text-slate-900">Conversion controls</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Output base name</span>
          <input
            type="text"
            value={options.outputBaseName}
            onChange={(event) => update({ outputBaseName: event.target.value })}
            placeholder="Use PDF name"
            disabled={disabled}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Quality / DPI</span>
          <select
            value={options.qualityPresetId}
            onChange={(event) => update({ qualityPresetId: event.target.value as ConversionOptions['qualityPresetId'] })}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
          >
            {QUALITY_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label} - {preset.dpi} DPI
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Pages</legend>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="page-mode"
              checked={options.pageMode === 'all'}
              onChange={() => update({ pageMode: 'all' })}
              disabled={disabled}
              className="text-brand-600 focus:ring-brand-500"
            />
            All pages
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="page-mode"
              checked={options.pageMode === 'range'}
              onChange={() => update({ pageMode: 'range' })}
              disabled={disabled}
              className="text-brand-600 focus:ring-brand-500"
            />
            Page range
          </label>
        </div>

        {options.pageMode === 'range' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Start page</span>
              <input
                type="number"
                min={1}
                value={options.startPage}
                onChange={(event) => update({ startPage: updateNumber(event.target.value, options.startPage) })}
                disabled={disabled}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">End page</span>
              <input
                type="number"
                min={1}
                value={options.endPage}
                onChange={(event) => update({ endPage: updateNumber(event.target.value, options.endPage) })}
                disabled={disabled}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
              />
            </label>
          </div>
        )}

        {rangeInvalid && (
          <p className="text-sm text-red-600">End page must be greater than or equal to the start page.</p>
        )}
      </fieldset>
    </section>
  );
};
