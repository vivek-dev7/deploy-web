import { useState } from "react";
import axios from "axios";
import { User } from "lucide-react"; // Importing icons

const EditWalletForm = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token"); // Get JWT Token
  const baseURL = import.meta.env.VITE_BASE_URL;

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const updateWallet = async () => {
    try {
      if (!amount) {
        alert("Amount cannot be empty");
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser || !currentUser.email) {
        alert("User not found. Please log in again.");
        return;
      }

      const response = await axios.put(
        `${baseURL}/api/update/wallet`,
        {
          email: currentUser.email,
          wallet: Number(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Wallet updated successfully!");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, wallet: Number(amount) })
        );
      } else {
        alert("Failed to update wallet.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error updating wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateWallet();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="relative">
        <label className="block text-gray-700 text-sm font-medium mb-1">Enter Amount</label>
        <div className="flex items-center bg-gray-100 focus-within:bg-white border-b-2 border-gray-300 focus-within:border-blue-500 transition-all duration-300 p-2 rounded-md">
          <User className="text-gray-500 mr-2" size={20} />
          <input
            type="number"
            name="amount"
            className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500"
            value={amount}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Confirm Changes Button */}
      <button
        type="submit"
        className="w-full p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all duration-300 cursor-pointer"
        disabled={loading}
      >
        {loading ? "Updating..." : "Confirm Changes"}
      </button>
    </form>
  );
};

export default EditWalletForm;
