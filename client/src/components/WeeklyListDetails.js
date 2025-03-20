import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HistoryLog from "./HistoryLog";
import "./WeeklyListDetails.css";
import WeeklyListDesign from './WeeklyListDesign';

const WeeklyListDetails = () => {
  const { listId } = useParams(); // Extract listId from the URL
  const [listDetails, setListDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]); // Recommended items state
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [updateItemId, setUpdateItemId] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Predefined categories for dropdown
  const categories = [
    "Dairy",
    "Fruits & Vegetables",
    "Meat & Fish",
    "Bakery",
    "Beverages",
    "Snacks",
    "Frozen",
    "Household Items",
    "Personal Care",
    "Other",
  ];

  // Fetch weekly list details and recommended items
  useEffect(() => {
    const fetchListDetailsAndRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const [listResponse, recommendationsResponse] = await Promise.all([
          axios.get(`http://localhost:3031/lists/${listId}/details`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3031/lists/${listId}/recommendations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Update states with list details and recommendations
        setListDetails(listResponse.data.weeklyList || null);
        setItems(listResponse.data.weeklyList.items || []);
        setRecommendedItems(recommendationsResponse.data.recommendations || []);
      } catch (error) {
        console.error("Error fetching list details or recommendations:", error);
        setErrorMessage("Failed to fetch list details or recommendations.");
      }
    };

    fetchListDetailsAndRecommendations();
  }, [listId]);

  // Add a new item
  const handleAddItem = async () => {
    if (!newItemName || !newItemCategory) {
      setMessage("Please provide both item name and category.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3031/lists/${listId}/add-item`,
        { name: newItemName, category: newItemCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems((prevItems) => [...prevItems, response.data.item]);
      setNewItemName("");
      setNewItemCategory("");
      setMessage("Item added successfully.");
    } catch (error) {
      console.error("Error adding item:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Failed to add item.");
    }
  };
  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3031/lists/${listId}/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
      setMessage("Item deleted successfully.");
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Failed to delete item.");
    }
  };
  const handleMarkAsPurchased = async (itemId) => {
  if (!itemId) {
    console.error("Invalid itemId for marking as purchased:", itemId);
    setMessage("Failed to mark as purchased: invalid item ID.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `http://localhost:3031/lists/${listId}/items/${itemId}/purchased`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? response.data.item : item
      )
    );

    setMessage("Item marked as purchased successfully.");
  } catch (error) {
    console.error("Error marking item as purchased:", error.response?.data || error.message);
    setMessage(error.response?.data?.message || "Failed to mark item as purchased.");
  }
};


  const handlePrepareUpdateItem = (item) => {
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setUpdateItemId(item._id);
  };
  const handleUpdateItem = async () => {
    if (!newItemName || !newItemCategory) {
      setMessage("Please provide both item name and category.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3031/lists/${listId}/items/${updateItemId}`,
        { name: newItemName, category: newItemCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Update response:", response.data); // Debugging

      // Update the item in the state
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === updateItemId ? response.data.item : item // Adjust this key
        )
      );

      setNewItemName("");
      setNewItemCategory("");
      setUpdateItemId(null);
      setMessage("Item updated successfully.");
    } catch (error) {
      console.error("Error updating item:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Failed to update item.");
    }
  };


  // Other CRUD actions (Update, Delete, Mark as Purchased) omitted for brevity
  const handleUndo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("User is not authenticated. Please log in.");
        return;
      }

      // Make the undo request
      const response = await axios.post(
        `http://localhost:3031/lists/undo`, // Ensure the endpoint is correct
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Set success message
      setMessage(response.data.message || "Undo successful!");

      // Fetch the updated list details after undo
      const updatedListResponse = await axios.get(
        `http://localhost:3031/lists/${listId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the state with the new list details
      setListDetails(updatedListResponse.data.list || null);
      setItems(updatedListResponse.data.list.items || []);
    } catch (error) {
      console.error("Error undoing last action:", error.response?.data || error.message);

      // Set error message
      setMessage(
        error.response?.data?.message ||
          "An error occurred while trying to undo the last action."
      );
    }
  };

  // Toggle history visibility
  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  if (errorMessage) return <p>{errorMessage}</p>;
  if (!listDetails) return <p>Loading list details...</p>;

  return (
    <div className="weekly-list-details-container">
      <h2 className="list-title">{listDetails.name}</h2>
      {message && <p className="message">{message}</p>}

      {/* Undo Button */}
      <button className="undo-button" onClick={handleUndo}>
        Undo Last Action
      </button>

      {/* History Button */}
      <button className="history-log-button" onClick={toggleHistory}>
        {showHistory ? "Hide History" : "Show History"}
      </button>

      {/* HistoryLog Component */}
      {showHistory && <HistoryLog listId={listId} />}
      {/* WeeklyListDesign Component */}
<WeeklyListDesign items={items} />

      <ul className="items-list">
  {items && items.length > 0 ? (
    items.map((item, index) =>
      item ? (
        <li key={item._id || index} className="item">
          <strong>{item.name}</strong> ({item.category || "No Category"}) -{" "}
          {item.purchased ? "Purchased" : "Not Purchased"}
          <button
            className="mark-purchased-button"
            onClick={() => handleMarkAsPurchased(item._id)}
          >
            Mark as Purchased
          </button>
          <button
            className="delete-button"
            onClick={() => handleDeleteItem(item._id)}
          >
            Delete
          </button>
          <button
            className="update-button"
            onClick={() => handlePrepareUpdateItem(item)}
          >
            Update
          </button>
        </li>
      ) : null
    )
  ) : (
    <p>No items available.</p>
  )}
</ul>





      {/* Recommended Items Section */}
      <h3 className="section-title">Recommended Items:</h3>
      {recommendedItems.length > 0 ? (
        <ul className="recommended-items-list">
          {recommendedItems.map((item, index) => (
            <li key={index} className="recommended-item">
              <strong>{item.name}</strong> ({item.category})
            </li>
          ))}
        </ul>
      ) : (
        <p>No recommendations available at the moment.</p>
      )}


      {/* Add Item Section */}
      <h3 className="section-title">Add/Update an Item:</h3>
      <div className="form-container">
        <input
          type="text"
          placeholder="Item Name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="form-input"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="form-input"
        >
          <option value="">Select a Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          onClick={updateItemId ? handleUpdateItem : handleAddItem}
          className="action-button"
        >
          {updateItemId ? "Update Item" : "Add Item"}
        </button>
      </div>
    </div>
  );
};


export default WeeklyListDetails;
