import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeeklyList.css'; // Optional: Use for styling if needed

const WeeklyList = () => {
  const [weeklyLists, setWeeklyLists] = useState([]); // State for weekly lists
  const [newListName, setNewListName] = useState(''); // State for new list name
  const [message, setMessage] = useState(''); // State for feedback messages
  const [isLoading, setIsLoading] = useState(false); // State to handle loading

  useEffect(() => {
    // Fetch weekly lists on component mount
    const fetchWeeklyLists = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.get('http://localhost:3031/weekly-lists', {
          headers: { Authorization: `Bearer ${token}` }, // Add token to headers for authentication
        });
        setWeeklyLists(response.data.lists || []); // Update state with fetched data
      } catch (error) {
        console.error('Error fetching weekly lists:', error);
        setMessage('Failed to fetch weekly lists. Please try again.');
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchWeeklyLists();
  }, []); // Empty dependency array means it runs once when the component mounts

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setMessage('Please enter a valid list name.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3031/weekly-lists',
        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('API Response:', response.data); // Debugging
  
      if (!response.data.list) {
        setMessage('Failed to create list. Please try again.');
        return;
      }
  
      setWeeklyLists((prevLists) => [...prevLists, response.data.list]);
      setNewListName('');
      setMessage(`Weekly list "${newListName}" created successfully!`);
    } catch (error) {
      console.error('Error creating weekly list:', error);
      if (error.response && error.response.status === 404) {
        setMessage('Error: Family not found. Please make sure you are part of a family.');
      } else if (error.response && error.response.status === 400) {
        setMessage('Error: List name is required.');
      } else {
        setMessage('Failed to create a new weekly list. Please try again.');
      }
    }
  };
  
  return (
    <div className="weekly-list-container">
      <h3>Create a New Weekly List</h3>
      <div className="create-list-form">
        <input
          type="text"
          placeholder="Enter list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)} // Update newListName state on input change
        />
        <button onClick={handleCreateList}>Create List</button>
      </div>
      {message && <p className="message">{message}</p>} {/* Display feedback messages */}
      <h4>Existing Weekly Lists</h4>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="weekly-lists">
          {weeklyLists.map((list) => (
            <li key={list._id}>{list.name}</li> // Render list names
          ))}
        </ul>
      )}
    </div>
  );
};

export default WeeklyList;
