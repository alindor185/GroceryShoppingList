import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button,
  Typography,
  Modal,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditIcon from "@mui/icons-material/Edit";
import { useUserContext } from "../context/UserContext";

const Sidebar = ({ user }) => {
  const { user: contextUser } = useUserContext()

  const [weeklyLists, setWeeklyLists] = useState([]);
  const [family, setFamily] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const navigate = useNavigate();

  // Fetch weekly lists
  useEffect(() => {
    const fetchWeeklyLists = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3031/lists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWeeklyLists(response.data.lists || []);
      } catch (error) {
        console.error("Error fetching weekly lists:", error);
      }
    };

    fetchWeeklyLists();
  }, []);

  // Fetch family details
  useEffect(() => {
    const fetchFamilyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3031/family/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFamily(response.data.family);
      } catch (error) {
        console.error("Error fetching family details:", error);
      }
    };

    fetchFamilyDetails();
  }, []);

  const handleJoinFamily = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3031/family/join",
        { joinCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Successfully joined family!");
      setFamily(response.data.family);
    } catch (error) {
      console.error("Error joining family:", error);
      alert("Failed to join family. Please check the join code.");
    }
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim()) {
      alert("Please provide a name for the new list.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3031/weekly-lists",
        { name: newListName, sharedWith: selectedMembers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`New Weekly List Created: ${response.data.lists.name}`);
      setWeeklyLists((prev) => [...prev, response.data.lists]);
      setIsModalOpen(false);
      setNewListName("");
      setSelectedMembers([]);
    } catch (error) {
      console.error("Error creating weekly list:", error);
      alert("Failed to create new weekly list. Please try again.");
    }
  };

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Drawer variant="permanent" sx={{ width: 280, flexShrink: 0 }}>
      <Box
        sx={{
          width: 280,
          display: "flex",
          flexDirection: "column",
          // justifyContent: "space-between",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Box sx={{ padding: 2, textAlign: "center" }}>
          <Avatar
            style={contextUser?.image ? { backgroundColor: "white "} : null}
            src={contextUser?.image || `http://localhost:3031/${(user?.profilePicture || "uploads/default-profile.png").replace(/\\/g, "/")}`}
            alt="Profile"
            sx={{ width: 80, height: 80, margin: "0 auto", cursor: "pointer" }}
            onClick={() => navigate("/edit-profile")}
          />
          <Typography variant="h6" sx={{ marginTop: 1 }}>
            {contextUser?.fullName || contextUser?.email || "User"}
          </Typography>
        </Box>

        <List>
          {/* <ListItem button onClick={() => setIsModalOpen(true)}>
            <ListItemIcon>
              <AddCircleOutlineIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Create New Weekly List" />
          </ListItem> */}

          {/* <Typography variant="subtitle1" sx={{ paddingLeft: 2, marginTop: 2 }}>
            Your Weekly Lists
          </Typography>
          {weeklyLists.length > 0 ? (
            weeklyLists.map((list) => (
              <ListItem
                button
                key={list._id}
                onClick={() => navigate(`/weekly-lists/${list._id}/details`)}
              >
                <ListItemIcon>
                  <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary={list.name} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" sx={{ paddingLeft: 2 }}>
              No weekly lists found.
            </Typography>
          )}
 */}
          <Typography variant="subtitle1" sx={{ paddingLeft: 2, marginTop: 2 }}>
            Family
          </Typography>
          {family ? (
            <>
              <ListItem>
                <ListItemIcon>
                  <FamilyRestroomIcon />
                </ListItemIcon>
                <ListItemText primary={`Family: ${family.name}`} />
              </ListItem>
              <Typography variant="body2" sx={{ paddingLeft: 2 }}>
                Members:
              </Typography>
              {family.members.map((member) => (
                <ListItem key={member.id} sx={{ paddingLeft: 4 }}>
                  <Avatar
                    style={member.image ? { backgroundColor: "white "} : null}
                    src={member.image || `http://localhost:3031/${(member.profilePicture || "uploads/default-profile.png").replace(/\\/g, "/")}`}
                    sx={{ width: 32, height: 32, marginRight: 1 }}
                  />
                  <ListItemText primary={member.fullName || member.email} />
                </ListItem>
              ))}
            </>
          ) : (
            <Box sx={{ padding: 2 }}>
              <TextField
                label="Enter Join Code"
                fullWidth
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ marginTop: 1 }}
                onClick={handleJoinFamily}
              >
                Join Family
              </Button>
            </Box>
          )}
        </List>

        <Button
          variant="contained"
          sx={{ margin: 2 }}
          startIcon={<EditIcon />}
          onClick={() => navigate("/edit_profile")}
        >
          Edit Profile
        </Button>
      </Box>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Weekly List
          </Typography>
          <TextField
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom>
            Share With:
          </Typography>
          {family && family.members.length > 0 ? (
            family.members.map((member) => (
              <FormControlLabel
                key={member.id}
                control={
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberSelection(member.id)}
                  />
                }
                label={member.email}
              />
            ))
          ) : (
            <Typography>No members available to share with.</Typography>
          )}
          <Box sx={{ marginTop: 2, display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" onClick={handleCreateNewList}>
              Create List
            </Button>
            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Drawer>
  );
};

export default Sidebar;
