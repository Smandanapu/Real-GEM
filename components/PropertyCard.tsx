import React from 'react';
import { Property } from '../types';
import { formatCurrency, sqftToAcres } from '../utils/helpers';
import { BedIcon, BathIcon, AreaIcon, LocationIcon, BuildingIcon } from './IconComponents';

interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onSelect: () => void;
}

const StatBox: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`p-3 border-2 border-black ${colorClass}`}>
        <div className="flex items-center gap-2">
            {icon}
            <span className="font-bold text-sm uppercase">{label}</span>
        </div>
        <p className="font-extrabold text-2xl mt-1">{value}</p>
    </div>
);


const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSelected, onSelect }) => {
  const discount = ((property.marketValue - property.listingPrice) / property.marketValue) * 100;
  
  // Get last 5 price history entries, most recent first
  const recentPriceHistory = [...(property.priceHistory || [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div 
        className={`bg-white border-2 border-black flex flex-col cursor-pointer transition-all duration-200 ease-in-out ${isSelected ? 'shadow-[8px_8px_0px_#FFFF00]' : 'shadow-[4px_4px_0px_#000]'}`}
        onClick={onSelect}
        aria-expanded={isSelected}
    >
      <div className="relative border-b-2 border-black">
        <img className="w-full h-56 object-cover" src={property.imageUrl} alt={`Property at ${property.address}`} />
        <div className="absolute top-4 right-4 bg-red-500 text-white font-extrabold text-sm px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_#000]">
          {discount.toFixed(0)}% BELOW MARKET
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-2xl font-extrabold text-black leading-tight truncate" title={property.address}>
          {property.address}
        </h3>
        <div className="flex items-center text-sm text-black mt-1">
          <LocationIcon className="mr-1.5 w-4 h-4" />
          <span className="font-bold uppercase tracking-wider">{property.city}, {property.state} {property.zipCode}</span>
        </div>
        
        <div className="my-4">
          <span className="bg-purple-400 text-black font-extrabold text-xs px-2 py-1 border-2 border-black uppercase">
            {property.propertyType}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-black">
            <StatBox icon={<BedIcon />} label="Beds" value={property.bedrooms} colorClass="bg-cyan-300" />
            <StatBox icon={<BathIcon />} label="Baths" value={property.bathrooms} colorClass="bg-pink-400" />
            <StatBox icon={<BuildingIcon />} label="Built Sqft" value={property.livingAreaSqft > 0 ? property.livingAreaSqft.toLocaleString() : 'N/A'} colorClass="bg-orange-300" />
            <StatBox icon={<AreaIcon />} label="Lot Acres" value={sqftToAcres(property.lotSizeSqft)} colorClass="bg-lime-300" />
        </div>
      </div>

       {isSelected && (
        <div className="p-4 border-t-2 border-black bg-slate-50">
           <div className="mb-4">
                <h4 className="font-bold uppercase text-sm tracking-wider mb-2">Value Investor's Note:</h4>
                <p className="text-sm">{property.philosophy}</p>
            </div>
            <div>
                <h4 className="font-bold uppercase text-sm tracking-wider mb-2">Recent Price History:</h4>
                {recentPriceHistory.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                      {recentPriceHistory.map((entry, index) => (
                          <li key={index} className="flex justify-between">
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                              <span className="font-bold">{formatCurrency(entry.price)}</span>
                          </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Price history is not available for this listing.</p>
                )}
            </div>
        </div>
      )}

      <div className="p-4 border-t-2 border-black bg-yellow-400 flex justify-between items-center">
            <span className="font-bold text-sm uppercase">Listing Price</span>
            <span className="text-3xl font-extrabold">{formatCurrency(property.listingPrice)}</span>
      </div>
    </div>
  );
};

export default PropertyCard;