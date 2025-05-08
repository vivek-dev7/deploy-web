import { X } from "lucide-react";
import SettingsContent from "./SettingsContent";

const SettingsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-lg w-[65%] max-w-2xl shadow-xl p-6">
        {/* Close Button */}
        <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={onClose}>
          <X size={24} className="cursor-pointer" />
        </button>

        {/* Modal Content */}
        <h2 className="text-xl font-semibold text-center text-gray-800">Profile Settings</h2>
        <SettingsContent />
      </div>
    </div>
  );
};

export default SettingsModal;
