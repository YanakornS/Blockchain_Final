import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Swal from "sweetalert2";
import Mytoken from "../assets/Mylogo.png"; // Replace with your logo path

const Navbar = ({ setAccount }) => {
  const [account, setAccountState] = useState(null);

  useEffect(() => {
    // เช็คว่าเคยเชื่อมต่อ MetaMask และมีข้อมูล account ที่เก็บไว้ใน localStorage หรือไม่
    const storedAccount = localStorage.getItem("account");
    if (storedAccount) {
      setAccountState(storedAccount);
      setAccount(storedAccount);
    }
  }, []);

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);
        setAccountState(selectedAccount);

        // Store connected account in localStorage
        localStorage.setItem("account", selectedAccount);

        Swal.fire({
          title: "Connected!",
          text: `Successfully connected to MetaMask. Account: ${selectedAccount}`,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Reload the page after user closes the alert
          window.location.reload();
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Could not connect to MetaMask. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      Swal.fire({
        title: "MetaMask Not Detected",
        text: "Please install MetaMask to connect.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const disconnectFromMetaMask = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to disconnect from MetaMask?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, disconnect",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setAccount(null);
        setAccountState(null);
        localStorage.removeItem("account"); // ลบ account ที่เก็บไว้ใน localStorage

        Swal.fire({
          title: "Disconnected!",
          text: "You have successfully disconnected from MetaMask.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    });
  };

  return (
    <div className="navbar bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 rounded-lg shadow-xl p-4">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl text-white hover:bg-opacity-75 px-4 py-1 flex items-center">
          <img
            src={Mytoken} // Replace with your logo URL
            alt="Logo"
            className="w-15 h-11 rounded-full mr-2"
          /> 
          YanX
        </a>
      </div>
      <div className="navbar-end flex items-center space-x-2">
        {account ? (
          <>
            <span className="btn bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-full px-4 py-2 shadow-md text-sm sm:text-base">
              Account: {account}
            </span>
            <button
              className="btn bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-full px-4 py-2 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-800 transition duration-300 text-sm sm:text-base"
              onClick={disconnectFromMetaMask}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            className="btn bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full px-6 py-3 hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-500 transition duration-300 text-sm sm:text-base"
            onClick={connectToMetaMask}
          >
            Connect to MetaMask
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
