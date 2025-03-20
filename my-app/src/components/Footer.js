import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-3 text-center z-50 shadow-inner">
      <p className="text-sm">&copy; {new Date().getFullYear()} FactualAI. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
