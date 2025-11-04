import React from 'react';
import { DownloadIcon } from './IconComponents';

interface FilterControlsProps {
  discountLevels: number[];
  activeDiscount: number;
  onDiscountChange: (discount: number) => void;
  onExport: () => void;
  hasResults: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({ discountLevels, activeDiscount, onDiscountChange, onExport, hasResults }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-black mr-2">Priced at least:</span>
        {discountLevels.map(level => (
          <button
            key={level}
            onClick={() => onDiscountChange(level)}
            className={`px-3 py-1.5 text-sm font-bold border-2 border-black transition-colors duration-200 ${
              activeDiscount === level
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-yellow-300'
            }`}
          >
            {level * 100}% Below Market
          </button>
        ))}
      </div>
      <button
        onClick={onExport}
        disabled={!hasResults}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold border-2 border-black hover:bg-green-600 disabled:bg-gray-400 disabled:text-gray-800 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <DownloadIcon className="h-5 w-5" />
        Export to PDF
      </button>
    </div>
  );
};

export default FilterControls;