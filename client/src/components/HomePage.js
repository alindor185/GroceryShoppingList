import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { Card, CardContent, Typography, Grid, Tooltip, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import './HomePage.css';

const HomePage = () => {
  const [family, setFamily] = useState(null);
  const [weeklyLists, setWeeklyLists] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const fetchFamilyAndLists = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in first.');
        setIsLoading(false);
        return;
      }

      try {
        const [familyResponse, listsResponse] = await Promise.all([
          axios.get('http://localhost:3031/family/details', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3031/weekly-lists', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFamily(familyResponse.data.family);
        setWeeklyLists(listsResponse.data.lists || []);
      } catch (error) {
        setMessage('Failed to fetch family or lists data.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyAndLists();
  }, []);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('Please enter a valid list name.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3031/lists', { name: newListName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setWeeklyLists([...weeklyLists, response.data.list]);
      setOpenDialog(false);
      setNewListName('');
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  return (
    <div className="homepage-container">
      <Sidebar family={family} />
      {isLoading ? (
        <p className="loading">Loading data...</p>
      ) : (
        <div className="content-container">
          <h1 className="homepage-title">Welcome to Your Dashboard</h1>
          {message && <p className="message">{message}</p>}

          <div className="section" style={{ marginBottom: '20px' }}>
            <Typography variant="h5" gutterBottom>Your Weekly Lists</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
              Create New List
            </Button>
            
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              {weeklyLists.length > 0 ? (
                weeklyLists.map((list) => (
                  <Grid item xs={12} sm={6} md={4} key={list._id}>
                    <Tooltip title="Click to view details" arrow>
                      <Card
                        onClick={() => window.location.href = `/weekly-lists/${list._id}/details`}
                        sx={{
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.05)' },
                          cursor: 'pointer',
                        }}
                      >
                        <CardContent style={{ textAlign: 'center', backgroundColor: '#f0f8ff' }}>
                          <Typography variant="h6" style={{ fontFamily: 'Cursive', color: '#333' }}>
                            {list.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </Grid>
                ))
              ) : (
                <Typography>No weekly lists found.</Typography>
              )}
            </Grid>
          </div>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Create New List</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="List Name"
                type="text"
                fullWidth
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
              <Button onClick={handleCreateList} color="primary">Create</Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default HomePage;