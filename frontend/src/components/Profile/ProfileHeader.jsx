import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import axios from "axios";
import SettingsModal from "../settings/SettingsModal"; // Import modal

const ProfileHeader = ({ currentUser }) => {
  const [wallet, setWallet] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State to control modal
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/auth/user?email=${encodeURIComponent(currentUser.email)}`
        );
        setWallet(response.data.wallet);
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };

    if (currentUser?.email) {
      fetchWallet();
    }
  }, [currentUser?.email]);

  return (
    <div className="p-4 bg-gray-200 rounded-t-lg flex justify-between items-center">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{currentUser.name}</h2>
        <p className="text-sm font-semibold text-gray-600">Wallet: ₹{wallet.toFixed(2)}</p>
      </div>

      {/* Open Settings Modal on Click */}
      <button onClick={() => setIsSettingsOpen(true)}>
        <Settings className="cursor-pointer text-gray-600 hover:text-gray-800" />
      </button>

      {/* Show Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default ProfileHeader;
