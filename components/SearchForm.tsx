import React, { useState } from 'react';
import { SearchIcon } from './IconComponents';

interface SearchFormProps {
  onSearch: (zipCode: string) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 5) {
      setZipCode(value);
      if (error) setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length === 5) {
      onSearch(zipCode);
      setError('');
    } else {
      setError('A valid 5-digit U.S. ZIP code is required.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="flex items-center bg-white p-2 border-2 border-black shadow-[4px_4px_0px_#000000]">
        <input
          className="w-full appearance-none bg-transparent border-none text-black font-bold mr-3 py-2 px-4 leading-tight focus:outline-none placeholder-gray-500"
          type="text"
          placeholder="Enter a U.S. ZIP Code..."
          aria-label="ZIP Code"
          value={zipCode}
          onChange={handleInputChange}
          pattern="\d{5}"
          title="5-digit ZIP code"
          disabled={isLoading}
        />
        <button
          className="flex-shrink-0 bg-[#FFFF00] hover:bg-black text-black hover:text-[#FFFF00] font-bold text-sm border-2 border-black py-2 px-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center uppercase"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <SearchIcon className="h-5 w-5 mr-2" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-red-600 font-bold text-sm mt-2 text-center">{error}</p>}
    </form>
  );
};

export default SearchForm;