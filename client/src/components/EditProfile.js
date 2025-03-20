import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { axiosInstance } from '../api/axios';
import './EditProfile.css';

const EditProfile = () => {
  const { user: contextUser } = useUserContext();
  const [user, setUser] = useState(contextUser);
  const [preview, setPreview] = useState(null);
 
  const navigate = useNavigate();

  useEffect(()=> {
    setUser(contextUser);
    setPreview(contextUser?.image)
  },[contextUser])

  const setUserData = (newUser) => {
    setUser((p)=> ({...p, ...newUser}));
  }

  const handleLeaveFamily = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3031/users/leave-family', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to leave family');
      }

      alert('You have left the family successfully.');
      navigate('/home'); // Redirect to home
    } catch (error) {
      console.error('Error leaving family:', error);
    }
  };

    // Handle upload
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
  
      if (selectedFile) {
        setPreview(URL.createObjectURL(selectedFile)); // Create preview URL
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile); // Convert to Base64
        
        reader.onload = () => {
            setUserData({ image: reader.result }); // Create preview URL
            setPreview(URL.createObjectURL(selectedFile)); // Create preview URL
          };
    
          reader.onerror = (error) => {
            console.error("Error converting image:", error);
          };
      }
    };
  
  

  const handleProfileChange = async () => {
      try {
        // const formData = new FormData();
        // formData.append("image", file);
    
        const result = await axiosInstance.put('/users/user', {
          ...user
        })
        alert("Profile updated successfully");

      } catch (e) {
         alert("Failed to change profile")
         console.log("Failed to change profile", e)
      }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <div className="form-group">
        <label htmlFor="name">Change Name:</label>
        <input
          type="text"
          id="name"
          value={user?.fullName}
          onChange={(e) => setUserData({fullName: e.target.value})}
          placeholder="Enter new name"
        />

        <label htmlFor="name">Change Email:</label>
        <input
          type="text"
          id="email"
          value={user?.email}
          onChange={(e) => e.target.value({email: e.target.value})}
          placeholder="Enter email"
        />

      {preview && (
        <img src={preview} alt="Preview" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }} />
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "block", marginBottom: "10px", width: "100%" }} />



        <button onClick={handleProfileChange}>Update user profile</button>
      </div>
      <button onClick={handleLeaveFamily} className="leave-family-button">
        Leave Family
      </button>
    </div>
  );
};

export default EditProfile;
