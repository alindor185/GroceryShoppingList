const mongoose = require('mongoose');
const axios = require('axios');

const API_URL = "https://www.shufersal.co.il/online/he";
const DEPARTMENT = `departments:A`;

module.exports = {
  // Get all items
  getAllItems: (req, res) => {
    const { Item } = mongoose.models;

    Item.find()
      .then((items) => {
        res.status(200).json({ items });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  },

  // Create a new item
  createItem: (req, res) => {
    const { name, category, quantity, imageUrl, formattedPrice, list, assignee } = req.body;
    const { Item, History } = mongoose.models;

    const item = new Item({
      _id: new mongoose.Types.ObjectId(),
      name,
      category,
      quantity,
      imageUrl,
      formattedPrice,
      list,
      assignee,
      addedBy: req.user.id,
      purchased: false,
    });

    item
      .save()
      .then((savedItem) => {
        return History.create({
          action: 'create',
          itemId: savedItem._id,
          list: savedItem.list,
          date: new Date(),
          performedBy: req.user.id,
        }).then(() => {
          res.status(200).json({ message: 'Item created successfully', item: savedItem });
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  },

  // Update an existing item
  updateItem: (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { Item, History } = mongoose.models;

    try {
      Item.findByIdAndUpdate(id, updates, { new: true }).populate('addedBy assignee')

        .then((updatedItem) => {
          if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
          }

          return History.create({
            action: 'update',
            itemId: id,
            list: updatedItem.list,
            date: new Date(),
            performedBy: req.user?.id,
          }).then(() => {
            res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
          }).catch((error) => {
            console.log("error", error);
            res.status(500).json({ error });
          });
        })
        .catch((error) => {
          console.log("error", error);
          res.status(500).json({ error });
        });
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error });
    }
  },

  // Delete an item
  deleteItem: (req, res) => {
    const { Item, History } = mongoose.models;
    const { id } = req.params;

    Item.findByIdAndDelete(id)
      .then((deletedItem) => {
        if (!deletedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        return History.create({
          action: 'delete',
          itemId: id,
          list: deletedItem.list,
          date: new Date(),
          performedBy: req.user.id,
        }).then(() => {
          res.status(200).json({ message: 'Item deleted successfully' });
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  },

  // Mark an item as purchased
  markItemPurchased: (req, res) => {
    const { Item, History } = mongoose.models;
    const { id } = req.params;

    Item.findByIdAndUpdate(id, { purchased: true }, { new: true })
      .then((updatedItem) => {
        if (!updatedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        return History.create({
          action: 'mark_purchased',
          itemId: id,
          list: updatedItem.list,
          date: new Date(),
          performedBy: req.user.id,
        }).then(() => {
          res.status(200).json({ message: 'Item marked as purchased', item: updatedItem });
        }).catch((error) => {
          res.status(500).json({ error });
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  },

  // Get change history (fallback)
  getHistory: (req, res) => {
    const { History } = mongoose.models;

    History.find()
      .sort({ date: -1 })
      .then((history) => {
        res.status(200).json({ history });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  },

  // Check if all items in a list are purchased
  checkAndMarkListCompleted: async (req, res) => {
    const { List, Item } = mongoose.models;

    try {
      const { listId } = req.params;

      const list = await List.findById(listId).populate('items');
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const allPurchased = list.items.length > 0 && list.items.every(item => item.purchased);
      list.completed = allPurchased;
      await list.save();

      res.status(200).json({
        message: allPurchased ? "List marked as completed." : "List not completed yet.",
        completed: list.completed,
      });
    } catch (error) {
      console.error("Error checking completion status:", error);
      res.status(500).json({ message: "Failed to check list completion.", error });
    }
  },

  // Search items from Shufersal API
  searchItem: async (req, res) => {
    const { query } = req.query;

    try {
      const { data } = await axios.get(`${API_URL}/search/results?q=${query}:relevance:${DEPARTMENT}&limit=10`);
      const items = data.results;

      res.status(200).json({ items });
    } catch (error) {
      console.error("Error while fetching grocery items", error);
      res.status(500).json({ error });
    }
  }
};
