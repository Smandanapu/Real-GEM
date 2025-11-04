import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t-4 border-black mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-sm text-black">
          <span className="font-extrabold uppercase">Disclaimer:</span> This tool is for informational purposes only. The values presented may not be accurate. No investment decisions should be made based solely on this data. Always consult a licensed realtor.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
