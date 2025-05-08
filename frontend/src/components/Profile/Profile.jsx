import { useState, useEffect, useRef } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileBody from "./ProfileBody";
import ProfileFooter from "./ProfileFooter";
import "./Profile.css";

// Adding CurrentUser as a parameter to Profile function
const Profile = ({ onLogout, currentUser }) => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  
  // Generate initials from username with enhanced logic
  const getInitials = (username) => {
    if (!username) return ""; // Handle case when username is not available
    
    // Split the name and filter out any empty parts
    const nameParts = username.split(" ").filter(part => part.trim() !== "");
    
    // If only one name, return first character
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } 
    // If two names
    else if (nameParts.length === 2) {
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const lastInitial = nameParts[1].charAt(0).toUpperCase();
      
      // If first and last initials are the same (like VV), return just one letter
      if (firstInitial === lastInitial) {
        return firstInitial;
      } else {
        return `${firstInitial}${lastInitial}`;
      }
    } 
    // If three or more names
    else {
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const middleInitial = nameParts[1].charAt(0).toUpperCase();
      const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      
      // If all three initials are the same, return just one letter
      if (firstInitial === middleInitial && middleInitial === lastInitial) {
        return firstInitial;
      }
      // If first and last initials are the same, use first and middle
      else if (firstInitial === lastInitial) {
        return `${firstInitial}${middleInitial}`;
      }
      // Otherwise, use first and last
      else {
        return `${firstInitial}${lastInitial}`;
      }
    }
  };

  // Toggle profile popup on icon click
  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
  };
  
  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile]);
  
  return (
    <div className="profile-container">
      <div 
        className="profile-avatar"
        onClick={toggleProfile}
        aria-label="User profile"
      >
        <span>{currentUser?.name ? getInitials(currentUser.name) : "?"}</span>
      </div>
      
      {/* Profile Dropdown */}
      {showProfile && (
        <div
          ref={profileRef}
          className="profile-dropdown"
        >
          {/* Passing CurrentUser to ProfileHeader */}
          <ProfileHeader currentUser={currentUser}/>
          <ProfileBody />
          <ProfileFooter onLogout={onLogout} />
        </div>
      )}
    </div>
  );
};

export default Profile;