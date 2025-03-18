import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 text-center mt-6">
      <p>&copy; {new Date().getFullYear()} FactualAI. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
