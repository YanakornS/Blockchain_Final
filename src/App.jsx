import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Swal from "sweetalert2";
import contractABI from "./contractABI.json";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { FaEthereum, FaCoins } from "react-icons/fa";
const contractAddress = "0xdC98ac0A9d4245C6B30e2807222641fdD947718b";

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userYAXBalance, setUserYAXBalance] = useState(0);
  const [contractYAXBalance, setContractYAXBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [requestCooldown, setRequestCooldown] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const newWeb3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await newWeb3.eth.getAccounts();
          const newContract = new newWeb3.eth.Contract(
            contractABI,
            contractAddress
          );

          setWeb3(newWeb3);
          setAccount(accounts[0]);
          setContract(newContract);

          fetchBalances(newContract, accounts[0], newWeb3);
          fetchRequestCooldown(newContract, accounts[0]);

          window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0]);
            fetchBalances(newContract, accounts[0], newWeb3);
            fetchRequestCooldown(newContract, accounts[0]);
          });
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        console.error("MetaMask not detected.");
      }
    };
    initWeb3();
  }, []);

  const fetchBalances = async (contract, userAccount, web3) => {
    try {
      const userYAX = await contract.methods.balanceOf(userAccount).call();
      setUserYAXBalance(Web3.utils.fromWei(userYAX, "ether"));

      const contractYAX = await contract.methods
        .balanceOf(contractAddress)
        .call();
      setContractYAXBalance(Web3.utils.fromWei(contractYAX, "ether"));

      const ethBal = await web3.eth.getBalance(userAccount);
      setEthBalance(Web3.utils.fromWei(ethBal, "ether"));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  // Function to format the remaining time into hours, minutes, and seconds
  const formatRemainingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours} ชั่วโมง ${minutes} นาที ${remainingSeconds} วินาที`;
  };

  const fetchRequestCooldown = async (contract, account) => {
    try {
      const cooldown = await contract.methods.requestCooldown().call();
      const lastRequest = await contract.methods
        .lastRequestTime(account)
        .call();

      const requestCooldown = Number(cooldown);
      const lastRequestTime = Number(lastRequest);

      const currentTime = Math.floor(Date.now() / 1000);
      const elapsedTime = currentTime - lastRequestTime;
      const remainingTimeInSeconds =
        requestCooldown > elapsedTime ? requestCooldown - elapsedTime : 0;

      setRequestCooldown(requestCooldown);
      setLastRequestTime(lastRequestTime);
      setRemainingTime(remainingTimeInSeconds);

      if (remainingTimeInSeconds > 0) {
        const intervalId = setInterval(() => {
          setRemainingTime((prev) => {
            if (prev <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error fetching request cooldown:", error);
    }
  };
  const handleBuyTokens = async () => {
    if (contract && account && amount) {
      try {
        // Show loading alert
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we process your transaction.",
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // หารจำนวนที่กรอกด้วย 100
        const adjustedAmount = amount / 100;

        // แปลง adjustedAmount เป็น Wei
        const valueInWei = Web3.utils.toWei(adjustedAmount.toString(), "ether");

        // ส่งคำสั่งซื้อ
        await contract.methods.buy().send({ from: account, value: valueInWei });

        // อัปเดตยอดเงิน
        await fetchBalances(contract, account, web3);

        // แสดงข้อความสำเร็จ
        Swal.fire({
          title: "Success!",
          text: "You have successfully bought YAX tokens.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        // แสดงข้อความผิดพลาด
        Swal.fire({
          title: "Error",
          text: "Failed to complete the transaction. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleSellTokens = async () => {
    if (contract && account && amount) {
      try {
        // Show loading alert
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we process your transaction.",
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const amountInWei = Web3.utils.toWei(amount, "ether");
        await contract.methods.sell(amountInWei).send({ from: account });

        // Update balances
        await fetchBalances(contract, account, web3);

        // Show success message
        Swal.fire({
          title: "Success!",
          text: "You have successfully sold YAX tokens.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        // Show error message
        Swal.fire({
          title: "Error",
          text: "Failed to complete the transaction. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  // Function to request tokens
  const handleRequestTokens = async () => {
    if (contract && account) {
      try {
        // Show loading alert
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we process your request.",
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Send the request to the contract
        await contract.methods.requestTokens().send({
          from: account,
          gas: 200000,
          gasPrice: Web3.utils.toWei("20", "gwei"),
        });

        // Update balances
        await fetchBalances(contract, account, web3);

        // Fetch the updated cooldown data
        await fetchRequestCooldown(contract, account); // Fetch cooldown info after request

        // Show success message
        Swal.fire({
          title: "Success!",
          text: "You have successfully requested YAX tokens.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        // Show error message
        Swal.fire({
          title: "Error",
          text: "Failed to complete the request. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <Navbar setAccount={setAccount} />
      <div className="flex-grow flex flex-col items-center w-full px-4 sm:px-6 md:px-8">
        {!account && (
          <div className="welcome-message mt-10 text-center">
            <h1 className="text-3xl font-bold text-purple-700">
              Welcome to YanX!
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Connect your MetaMask wallet to explore and manage your YAX
              tokens.
            </p>
            <p className="text-md text-gray-500 mt-1">
              Please click "Connect to MetaMask" in the top-right corner to get
              started.
            </p>
          </div>
        )}
        {account && (
          <div className="avatar online mt-4 ">
            <div className="ring-primary ring-offset-base-100 w-24 sm:w-32 mt-3 rounded-full ring ring-offset-2 shadow-2xl ">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s" />
            </div>
          </div>
        )}
        {account && (
          <div className="bg-gradient-to-r from-[#CB9DF0] to-[#D6A3E6] p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg w-full max-w-3xl mt-8">
            <div className="bg-white shadow-xl rounded-lg p-6 w-full">
              <div className="text-center text-gray-700 mb-6">
                <p className="text-lg font-medium">
                  Cooldown Remaining:{" "}
                  <span
                    className={`text-xl font-semibold ${
                      remainingTime > 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {remainingTime > 0
                      ? formatRemainingTime(remainingTime)
                      : "Available"}
                  </span>
                </p>
              </div>

              {/* Contract Address Section */}
              <div className="flex flex-col sm:flex-row items-center py-2  border-t border-gray-200 mt-6">
                <div className="flex items-center mb-4 sm:mb-0 ">
                  <FaEthereum className="text-xl text-gray-800 mr-2" />
                  <div className="text-xl font-semibold mr-1 text-gray-700">
                    Contract Address:
                  </div>
                </div>

                <div className="text-lg text-gray-800 mb-4 sm:mb-0 font-semibold">
                  0xdC98ac0A9d4245C6B30e2807222641fdD947718b
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-gradient-to-r from-[#CB9DF0] to-[#D6A3E6] p-6 sm:p-8 lg:p-10 rounded-xl shadow-2xl w-full max-w-3xl mt-8">
          <div className="bg-white shadow-2xl rounded-lg w-full p-4">
            <h2 className="text-2xl text-center font-semibold mb-6">
              Wallet Balance
            </h2>
            {account && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaCoins className="text-xl mr-2" />
                    <div className="text-sm font-medium text-gray-700">
                      Your YAX Balance
                    </div>
                  </div>
                  <div className="text-sm text-gray-800">
                    {account ? userYAXBalance : "0"} YAX
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaCoins className="text-xl mr-2" />
                    <div className="text-sm font-medium text-gray-700">
                      Contract YAX Balance
                    </div>
                  </div>
                  <div className="text-sm text-gray-800">
                    {account ? parseFloat(contractYAXBalance).toFixed(2) : "0"}{" "}
                    YAX
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaEthereum className="text-xl mr-2" />
                    <div className="text-sm font-medium text-gray-700">
                      Your ETH Balance
                    </div>
                  </div>
                  <div className="text-sm text-gray-800">
                    {account ? ethBalance : "0"} ETH
                  </div>
                </div>

                {/* Example for showing the percentage change */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaCoins className="text-xl mr-2" />
                    <div className="text-sm font-medium text-gray-700">
                      YAX Balance Change
                    </div>
                  </div>
                  <div className="text-sm text-gray-800 text-green-500">
                    +5% {/* You can replace this with dynamic data */}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaEthereum className="text-xl mr-2" />
                    <div className="text-sm font-medium text-gray-700">
                      ETH Balance Change
                    </div>
                  </div>
                  <div className="text-sm text-gray-800 text-red-500">
                    -2% {/* You can replace this with dynamic data */}
                  </div>
                </div>
              </div>
            )}
            <div className="bg-purple-100 inline-block text-sm font-semibold px-2 py-1  mt-4 border border-purple-300 rounded mb-1">
              1 YAX = 4 USD$
            </div>
            <div className="mt-1 space-y-4">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Quantity you want to buy"
                className="input input-bordered w-full max-w-xs mb-4"
              />
              <button
                className="btn bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full px-6 py-3 hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-500 w-full"
                onClick={handleBuyTokens}
              >
                Buy YAX
              </button>
              <button
                className="btn bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full px-6 py-3 hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-500 mt-2 w-full"
                onClick={handleSellTokens}
              >
                Sell YAX
              </button>
              <button
                className="btn bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full px-6 py-3 hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-500 mt-2 w-full"
                onClick={handleRequestTokens}
              >
                Request YAX
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
