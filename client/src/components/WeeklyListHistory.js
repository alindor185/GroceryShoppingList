import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeeklyListHistory.css'; // Optional: Use for styling if needed

const WeeklyListHistory = () => {
  const [history, setHistory] = useState([]); // State to store history of weekly lists
  const [message, setMessage] = useState(''); // State for error or success messages
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    // Fetch history of weekly lists on component mount
    const fetchHistory = async () => {
      setIsLoading(true); // Start loading
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.get('http://localhost:3031/weekly-lists/history', {
          headers: { Authorization: `Bearer ${token}` }, // Add token to headers for authentication
        });
        setHistory(response.data.history || []); // Update state with fetched data
      } catch (error) {
        console.error('Error fetching weekly list history:', error);
        setMessage('Failed to fetch weekly list history. Please try again.');
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchHistory();
  }, []); // Empty dependency array means it runs once when the component mounts

  return (
    <div className="weekly-list-history-container">
      <h3>Weekly List History</h3>
      {message && <p className="message">{message}</p>} {/* Display error or success messages */}
      {isLoading ? (
        <p>Loading history...</p>
      ) : history.length > 0 ? (
        <ul className="history-list">
          {history.map((entry) => (
            <li key={entry._id} className="history-item">
              <strong>Action:</strong> {entry.action} <br />
              <strong>Date:</strong> {new Date(entry.date).toLocaleString()} <br />
              <strong>Performed By:</strong> {entry.performedBy?.email || 'Unknown'} <br />
              <strong>List Name:</strong> {entry.list?.name || 'Unknown'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No history available.</p>
      )}
    </div>
  );
};

export default WeeklyListHistory;
