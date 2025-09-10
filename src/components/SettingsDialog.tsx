import React, { useState, useEffect } from 'react';
import { Settings, LayoutMode, VariationLevel } from '../types';

interface SettingsDialogProps {
  settings: Settings;
  onSubmit: (settings: Settings) => void;
  onCancel: () => void;
}

// FIX: Define a specific type for numeric keys for better type safety.
type NumericSettingKey = 'pageW' | 'pageH' | 'mTop' | 'mBot' | 'mIn' | 'mOut' |
    'gridCols' | 'gridRows' | 'gridGap' | 'cCols' | 'cGap' | 'cRows' | 'target';

// FIX: Use the specific NumericSettingKey type for the array.
const numericFieldKeys: NumericSettingKey[] = [
    'pageW', 'pageH', 'mTop', 'mBot', 'mIn', 'mOut',
    'gridCols', 'gridRows', 'gridGap', 'cCols', 'cGap', 'cRows', 'target'
];

// FIX: Add a type guard to check if a key is a numeric setting key.
function isNumericSettingKey(key: string): key is NumericSettingKey {
    return (numericFieldKeys as readonly string[]).includes(key);
}

type FormState = {
  [K in keyof Settings]: Settings[K] extends (number | null | boolean) ? (Settings[K] extends boolean ? boolean : string) : Settings[K];
};

const settingsToFormState = (settings: Settings): FormState => {
    const formState = {} as FormState;
    for (const key in settings) {
        const typedKey = key as keyof Settings;
        if (isNumericSettingKey(typedKey)) {
            const value = settings[typedKey];
            formState[typedKey] = value === null ? '' : String(value);
        } else if (typedKey === 'heroMode') {
            formState[typedKey] = settings[typedKey];
        } else if (typedKey === 'mode') {
            formState[typedKey] = settings[typedKey];
        } else if (typedKey === 'varLevel') {
            formState[typedKey] = settings[typedKey];
        }
    }
    return formState;
};


const SettingsDialog: React.FC<SettingsDialogProps> = ({ settings, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState<FormState>(() => settingsToFormState(settings));

  useEffect(() => {
    setFormState(settingsToFormState(settings));
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const key = name as keyof FormState;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        // @ts-ignore - This is safe as we handle checkbox separately
        setFormState(prev => ({ ...prev, [key]: checked }));
    } else {
        setFormState(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSettings = { ...settings };

    for (const key of numericFieldKeys) {
        const stringValue = formState[key] as string;
        if (key === 'target') {
            finalSettings[key] = stringValue.trim() === '' ? null : parseFloat(stringValue) || null;
        } else {
            finalSettings[key] = parseFloat(stringValue) || 0;
        }
    }
    finalSettings.mode = formState.mode;
    finalSettings.varLevel = formState.varLevel;
    finalSettings.heroMode = formState.heroMode;

    onSubmit(finalSettings);
  };
  
  const InputRow: React.FC<{label: string, name: NumericSettingKey, help?: string }> = ({ label, name, help }) => {
      return (
        <div className="grid grid-cols-2 gap-2 items-center mb-2" title={help}>
            <label htmlFor={name} className="text-sm text-gray-300 justify-self-start">{label}:</label>
            <input 
                id={name} 
                name={name} 
                type="text"
                inputMode={"decimal"}
                value={formState[name]}
                onChange={handleChange} 
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-right" 
            />
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold p-4 bg-gray-900 text-cyan-400 rounded-t-lg sticky top-0">Layout-Einstellungen</h2>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Column */}
            <div>
              <div className="p-4 border border-gray-700 rounded-lg mb-6">
                 <h3 className="font-semibold mb-3 text-lg">Dokument</h3>
                 <InputRow label="Seitenbreite (mm)" name="pageW" />
                 <InputRow label="Seitenhöhe (mm)" name="pageH" />
                 <InputRow label="Rand oben (mm)" name="mTop" />
                 <InputRow label="Rand unten (mm)" name="mBot" />
                 <InputRow label="Rand innen (mm)" name="mIn" />
                 <InputRow label="Rand aussen (mm)" name="mOut" />
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg">
                <h3 className="font-semibold mb-3 text-lg">Modus</h3>
                <div className="flex items-center mb-2">
                    <input type="radio" id="modeCluster" name="mode" value={LayoutMode.CLUSTER} checked={formState.mode === LayoutMode.CLUSTER} onChange={handleChange} className="mr-2"/>
                    <label htmlFor="modeCluster">Cluster (Collage)</label>
                </div>
                <div className="flex items-center">
                    <input type="radio" id="modeGrid" name="mode" value={LayoutMode.GRID} checked={formState.mode === LayoutMode.GRID} onChange={handleChange} className="mr-2"/>
                    <label htmlFor="modeGrid">Raster (Spalten × Zeilen)</label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className={`p-4 border border-gray-700 rounded-lg mb-6 transition-opacity duration-300 ${formState.mode === LayoutMode.GRID ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <h3 className="font-semibold mb-3 text-lg">Raster-Optionen</h3>
                <InputRow label="Spalten" name="gridCols" />
                <InputRow label="Zeilen" name="gridRows" />
                <InputRow label="Abstand (mm)" name="gridGap" />
              </div>
              
              <div className={`p-4 border border-gray-700 rounded-lg mb-6 transition-opacity duration-300 ${formState.mode === LayoutMode.CLUSTER ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 <h3 className="font-semibold mb-3 text-lg">Cluster-Optionen</h3>
                 <InputRow label="Spalten" name="cCols" help="Spaltenanzahl des Clusters"/>
                 <InputRow label="Spaltenabstand (mm)" name="cGap" help="Abstand horizontal/vertikal"/>
                 <InputRow label="Zeilen pro Seite" name="cRows" help="Feinraster (kleinste Einheit)"/>
                 <InputRow label="Ziel Bilder/Seite (±2)" name="target" help="Steuert mittlere Kachelgröße. Leer lassen für Automatik."/>
                 <div className="grid grid-cols-2 gap-2 items-center mb-2">
                    <label htmlFor="varLevel" className="text-sm text-gray-300 justify-self-start">Variationsgrad:</label>
                    <select id="varLevel" name="varLevel" value={formState.varLevel} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1">
                        <option value={VariationLevel.NIEDRIG}>niedrig</option>
                        <option value={VariationLevel.MITTEL}>mittel</option>
                        <option value={VariationLevel.HOCH}>hoch</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-2 items-center mt-3 pt-3 border-t border-gray-700">
                    <label htmlFor="heroMode" className="text-sm text-gray-300 justify-self-start" title="Erstes Bild pro Seite wird größer dargestellt">Hero-Bild aktivieren:</label>
                    <div className="flex justify-end">
                      <input type="checkbox" id="heroMode" name="heroMode" checked={formState.heroMode} onChange={handleChange} className="form-checkbox h-5 w-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600"/>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
            <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 mr-4 rounded-lg">Abbrechen</button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg">Generieren</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsDialog;