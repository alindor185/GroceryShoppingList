const mongoose = require('mongoose');

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
    const { name, category } = req.body;
    const { Item, History } = mongoose.models;


    const item = new Item({
      _id: new mongoose.Types.ObjectId(),
      name,
      category,
      purchased: false,
    });

    item
      .save()
      .then((savedItem) => {
        // Log the action in history
        return History.create({
          action: 'create',
          itemId: savedItem._id,
          date: new Date(),
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

    Item.findByIdAndUpdate(id, updates, { new: true })
      .then((updatedItem) => {
        if (!updatedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }
        // Log the action in history
        return History.create({
          action: 'update',
          itemId: id,
          date: new Date(),
        }).then(() => {
          res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
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
        // Log the action in history
        return History.create({
          action: 'delete',
          itemId: id,
          date: new Date(),
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
        // Log the action in history
        return History.create({
          action: 'mark_purchased',
          itemId: id,
          date: new Date(),
        }).then(() => {
          res.status(200).json({ message: 'Item marked as purchased', item: updatedItem });
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  },

  // Get change history
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
};
