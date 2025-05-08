import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ProfileFooter = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  
  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  // Load theme from localStorage on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-b-lg flex items-center justify-between text-sm">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      
      {/* Logout */}
      <p
        className="text-red-500 cursor-pointer hover:underline"
        onClick={onLogout}
      >
        Logout
      </p>
    </div>
  );
};

export default ProfileFooter;

