import React, { useState, useEffect } from 'react';
import './HistoryLog.css';

const HistoryLog = ({ listId }) => {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true); // Start loading
        setErrorMessage(''); // Reset error message

        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMessage('User is not authenticated. Please log in.');
          return;
        }

        // Construct the API endpoint based on the presence of listId
        const url = listId
          ? `http://localhost:3031/history?listId=${listId}`
          : 'http://localhost:3031/history';

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch history');
        }

        const data = await response.json();
        console.log('History data:', data.history); // Debugging
        setHistory(data.history || []); // Safeguard in case history is undefined
      } catch (error) {
        console.error('Error fetching history:', error);
        setErrorMessage(
          error.message || 'An unexpected error occurred while fetching history.'
        );
      } finally {
        setIsLoading(false); // End loading state
      }
    };

    fetchHistory();
  }, [listId]); // Re-fetch history when listId changes

  const toggleHistory = () => {
    setShowHistory((prev) => !prev); // Toggle visibility of history
  };

  return (
    <div className="history-log-container">
      <button className="history-log-button" onClick={toggleHistory}>
        {showHistory ? 'Hide History' : 'Show History'}
      </button>

      {showHistory && (
        <div className="history-log-popup">
          <h2>History Log</h2>
          {isLoading ? (
            <p>Loading history...</p>
          ) : errorMessage ? (
            <p className="error-message">{errorMessage}</p>
          ) : history.length > 0 ? (
            <ul className="history-log-list">
              {history.map((log) => (
                <li key={log._id} className="history-log-item">
                  <strong>Performed By:</strong> {log.performedBy?.email || 'Unknown'} <br />
                  <strong>Action:</strong> {log.action} <br />
                  <strong>Item Name:</strong>
                  {log.action === 'delete_item'
                    ? log.previousState?.name || 'Unknown'
                    : log.itemId?.name || 'Unknown'} <br />
                  <strong>Weekly List:</strong> {log.list?.name || 'Default'} <br />
                  <strong>Date:</strong> {log.date ? new Date(log.date).toLocaleString() : 'Unknown'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No history available for this list.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryLog;
