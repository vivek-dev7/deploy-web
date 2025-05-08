import React from "react";
import { useNavigate } from "react-router-dom";
import homeBg from "../assets/home.jpg"; // Import the background image

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${homeBg})` }}
    >
      <button
        className="px-8 py-4 text-xl font-semibold text-white bg-blue-600 rounded-lg shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:bg-blue-700"
        onClick={() => navigate("/choose-action")}
      >
        Get Started
      </button>
    </div>
  );
};

export default GetStarted;
