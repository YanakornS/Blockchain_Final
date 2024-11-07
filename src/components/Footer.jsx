import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import Mytoken from "../assets/Mylogo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 sm:p-6 lg:p-8 mt-8 rounded-t-xl w-full">
      <div className="container mx-auto px-6">
        {/* Footer content container */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          {/* Logo Section */}
          <div className="flex justify-center sm:justify-start items-center space-x-4 mb-4 sm:mb-0">
            <img
              src={Mytoken} // Replace with your logo URL
              alt="Logo"
              className="w-16 h-16 rounded-full"
            />
            <span className="text-2xl font-semibold">YanakornX</span>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center sm:justify-end space-x-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-600 transition-colors"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-500 transition-colors"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://www.github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400 transition-colors"
            >
              <FaGithub size={24} />
            </a>
          </div>
        </div>

        {/* Footer copyright */}
        <div className="mt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} YanakornX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
