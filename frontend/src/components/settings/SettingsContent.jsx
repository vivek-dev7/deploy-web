import { useState } from "react";
import EditProfileForm from "./EditProfileForm";
import EditWalletForm from "./EditWalletForm"; // Import the Wallet form component

const SettingsContent = () => {
  const [selectedTab, setSelectedTab] = useState("editProfile");

  return (
    <div className="flex h-[320px]">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 bg-gray-100 rounded-l-lg">
        <button
          className={`block w-full text-left py-2 px-4 rounded-lg ${
            selectedTab === "editProfile" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setSelectedTab("editProfile")}
        >
          Edit Profile
        </button>
        <button
          className={`block w-full text-left py-2 px-4 mt-2 rounded-lg ${
            selectedTab === "editWallet" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setSelectedTab("editWallet")}
        >
          Add Wallet
        </button>
      </div>

      {/* Right Panel */}
      <div className="w-2/3 p-6">
        {selectedTab === "editProfile" && <EditProfileForm />}
        {selectedTab === "editWallet" && <EditWalletForm />} {/* Render EditWalletForm */}
      </div>
    </div>
  );
};

export default SettingsContent;
