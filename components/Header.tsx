import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#FFFF00] border-b-4 border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-black tracking-tighter sm:text-5xl uppercase">
            Real Estate Gems
          </h1>
          <p className="mt-2 text-lg text-black">
            Unearthing Value in Real Estate
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;