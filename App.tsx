import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Property } from './types';
import { fetchPropertiesFromGemini } from './services/geminiService';
import { exportToPdf } from './services/pdfService';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import FilterControls from './components/FilterControls';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';
import Footer from './components/Footer';

const DISCOUNT_LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5];
const ITEMS_PER_PAGE = 10;

const App: React.FC = () => {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeDiscount, setActiveDiscount] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('real-estate-gems-discount');
      return saved ? JSON.parse(saved) : DISCOUNT_LEVELS[0];
    } catch {
      return DISCOUNT_LEVELS[0];
    }
  });

  const [searchedZip, setSearchedZip] = useState<string>(() => {
    return sessionStorage.getItem('real-estate-gems-zip') || '';
  });

  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handleSearch = useCallback(async (zipCode: string) => {
    setIsLoading(true);
    setError(null);
    setAllProperties([]);
    setSearchedZip(zipCode);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on new search
    setSelectedPropertyId(null); // Reset selection on new search

    try {
      const properties = await fetchPropertiesFromGemini(zipCode);
      setAllProperties(properties);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On initial mount, load data if a zip code is saved in the session.
  useEffect(() => {
    const loadInitialData = async () => {
      if (searchedZip) {
        setIsLoading(true);
        setError(null);
        try {
          const properties = await fetchPropertiesFromGemini(searchedZip);
          setAllProperties(properties);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred.');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect should only run once on mount.
  
  // Persist relevant UI state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('real-estate-gems-zip', searchedZip);
  }, [searchedZip]);

  useEffect(() => {
    sessionStorage.setItem('real-estate-gems-discount', JSON.stringify(activeDiscount));
  }, [activeDiscount]);


  const handleExport = () => {
      exportToPdf('results-wrapper', `real-estate-gems-${searchedZip}`);
  };

  const handleDiscountChange = (discount: number) => {
    setActiveDiscount(discount);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination when filter changes
    setSelectedPropertyId(null); // Reset selection on filter change
  };
  
  const handleSelectProperty = (propertyId: string) => {
    setSelectedPropertyId(prevId => (prevId === propertyId ? null : propertyId));
  };

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const activeProperties = useMemo(() => {
    return allProperties
      .filter(p => p.isActive)
      .sort((a, b) => b.investmentScore - a.investmentScore); // Show best scores first
  }, [allProperties]);

  const filteredProperties = useMemo(() => {
    return activeProperties.filter(p => {
      const discount = (p.marketValue - p.listingPrice) / p.marketValue;
      return discount >= activeDiscount;
    });
  }, [activeProperties, activeDiscount]);

  const propertiesToDisplay = useMemo(() => {
    return filteredProperties.slice(0, visibleCount);
  }, [filteredProperties, visibleCount]);


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow">
        <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-black uppercase">Find Your Next Value Investment</h2>
            <p className="mt-2 text-md text-black">Enter a ZIP code to discover actively listed properties priced below their estimated market value, based on the timeless principles of value investing.</p>
        </div>
        
        <div className="mb-12">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        <div id="results-wrapper">
          {activeProperties.length > 0 && (
            <div className="mb-8 p-4 bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
              <FilterControls
                discountLevels={DISCOUNT_LEVELS}
                activeDiscount={activeDiscount}
                onDiscountChange={handleDiscountChange}
                onExport={handleExport}
                hasResults={propertiesToDisplay.length > 0}
              />
            </div>
          )}

          {isLoading && <Loader message={`Analyzing listings for ZIP code ${searchedZip}...`} />}
          
          {error && (
            <div className="text-center py-10 px-4 bg-red-100 border-2 border-red-500">
              <h3 className="text-lg font-bold text-red-800 uppercase">An Error Occurred</h3>
              <p className="mt-2 text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          {!isLoading && !error && searchedZip && (
             <ResultsDisplay 
                properties={propertiesToDisplay}
                selectedPropertyId={selectedPropertyId}
                onSelectProperty={handleSelectProperty}
             />
          )}

          {!isLoading && !error && visibleCount < filteredProperties.length && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                className="bg-[#FFFF00] hover:bg-black text-black hover:text-[#FFFF00] font-bold py-3 px-8 border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
              >
                Load More Gems
              </button>
            </div>
          )}

           {!isLoading && !error && !searchedZip && (
             <div className="text-center py-16 px-4">
                <svg className="mx-auto h-12 w-12 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.545M3 4.5l3 1m0 6.205l-3 1m1.5.5l1.5-.545m0 0l-9 4.091" />
                </svg>
                <h3 className="mt-2 text-xl font-bold text-black uppercase">Ready to Discover Value?</h3>
                <p className="mt-1 text-sm text-black">Enter a ZIP code above to start your search for undervalued properties.</p>
            </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;