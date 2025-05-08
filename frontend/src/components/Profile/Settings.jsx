import { useState } from "react";

const Settings = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [name, setName] = useState(currentUser.name);
  const [wallet, setWallet] = useState(currentUser.wallet);
  const baseURL = import.meta.env.VITE_BASE_URL;

  const updateField = async (field, value) => {
    try {
      if (!value) {
        alert(`${field} cannot be empty`);
        return;
      }
  
      // For wallet, add to the existing amount instead of replacing
      const newValue = field === "wallet" ? currentUser.wallet + value : value;
  
      if (currentUser[field] === newValue) {
        alert(`Cannot update. ${field} must be different from the current one.`);
        return;
      }
  
      const response = await fetch(`${baseURL}/api/update/${field}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: currentUser.email, [field]: newValue }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(`Cannot update. ${data.message || "Something went wrong"}`);
        return;
      }
  
      alert(`${field} updated successfully!`);
      localStorage.setItem("user", JSON.stringify({ ...currentUser, [field]: newValue }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Error updating ${field}`);
    }
  };
  

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Settings</h1>

      <label className="block mb-2">Name:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={() => updateField("name", name)} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Update Name
      </button>

      <label className="block mb-2">Wallet (Add Amount):</label>
      <input
        type="number"
        value={wallet}
        onChange={(e) => setWallet(parseFloat(e.target.value) || 0)}
        className="border p-2 w-full mb-4"
        min="0"
        step="0.01"
      />
      <button onClick={() => updateField("wallet", wallet)} className="bg-blue-500 text-white px-4 py-2 rounded">
        Add to Wallet
      </button>

    </div>
  );
};

export default Settings;
