import React from "react";
import { useNavigate } from "react-router-dom";
import aboutUsBg from "../assets/third.jpg";
import tradingBg from "../assets/first.jpg";

const ChooseAction = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      {/* Left Half - About Us */}
      <div
        className="flex-1 flex justify-center items-center bg-cover bg-center transition-transform duration-300 hover:-translate-y-2 cursor-pointer"
        style={{ backgroundImage: `url(${aboutUsBg})` }}
        onClick={() => navigate("/about")}
      >
        <button className="px-6 py-3 text-lg font-semibold bg-white rounded-lg shadow-md hover:shadow-lg">
          About Us
        </button>
      </div>

      {/* Right Half - Start Trading */}
      <div
        className="flex-1 flex justify-center items-center bg-cover bg-center transition-transform duration-500 hover:-translate-y-2 cursor-pointer"
        style={{ backgroundImage: `url(${tradingBg})` }}
        onClick={() => navigate("/home2")}
      >
        <button className="px-6 py-3 text-lg font-semibold bg-white rounded-lg shadow-md hover:shadow-lg">
          Start Trading
        </button>
      </div>
    </div>
  );
};

export default ChooseAction;
