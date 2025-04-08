const mongoose = require("mongoose");
const List = require("../models/list");
const crypto = require('crypto');

module.exports = {
  getLists: async (req, res) => {
    try {
      const isArchived = req.query.archived === 'true';
      const userId = req.user.id;
      const lists = await List.find({ members: userId, isArchived: isArchived? true: { $ne: true } }).populate('items');
      res.status(200).json({ lists: lists || [] });
    } catch (error) {
      console.error('Error fetching lists:', error);
      res.status(500).json({ message: 'Failed to fetch weekly lists', error });
    }
  },

  getListDetails: async (req, res) => {
    try {
      const { listId } = req.params;

      const list = await List.findById(listId)
        .populate({ path: 'items', populate: 'addedBy assignee' })
        .populate('history', 'action date performedBy')
        .populate('members')
        .populate({ path: 'history', populate: { path: 'performedBy', select: 'email' } });

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      res.status(200).json({ list });
    } catch (error) {
      console.error('Error fetching list details:', error);
      res.status(500).json({ message: 'Failed to fetch list details', error });
    }
  },

  createList: async (req, res) => {
    const { List, History } = mongoose.models;

    try {
      const { name, settings, imageUrl } = req.body;
      const userId = req.user.id;

      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'List name is required' });
      }
      const joinCode = crypto.randomBytes(2).toString('hex').toUpperCase();

      const list = new List({
        name: name.trim(),
        members: [userId],
        createdAt: new Date(),
        updatedAt: new Date(),
        joinCode,
        admin: userId,
        settings,
        imageUrl,
        completed: false
      });

      const savedList = await list.save();

      const historyEntry = new History({
        action: 'create',
        list: savedList._id,
        performedBy: userId,
        date: new Date(),
      });
      await historyEntry.save();

      res.status(201).json({ message: `הרשימה '${name}' נוצרה בהצלחה.`, list: savedList });
    } catch (error) {
      console.error('Error creating list:', error);
      res.status(500).json({ message: 'Failed to create list', error });
    }
  },

  checkAndMarkListCompleted: async (req, res) => {
    const { List } = mongoose.models;

    try {
      const { listId } = req.params;

      const list = await List.findById(listId).populate('items');
      if (!list) return res.status(404).json({ message: 'List not found' });

      const allPurchased = list.items.length === 0 || list.items.every(item => item.purchased);
      if (!allPurchased) return res.status(400).json({ message: 'יש ברשימה זו מוצרים שעדיין לא נרכשו.' });
      
      list.isArchived = true;

      list.save();

      res.status(200).json({
        message: "הרשימה הועברה לארכיון בהצלחה",
        completed: list.completed,
      });
    } catch (error) {
      console.error('Error checking completion:', error);
      res.status(500).json({ message: 'ארעה תקלה במהלך נסיון להעביר רשימה זו לארכיון. אנא נסה בשנית', error });
    }
  },

  // Create a new list
  createList: async (req, res) => {
    const { List, History } = mongoose.models;

    try {
      const { name, settings, imageUrl } = req.body;
      const userId = req.user.id;

      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'List name is required' });
      }
      const joinCode = crypto.randomBytes(2).toString('hex').toUpperCase();


      const list = new List({
        name: name.trim(),
        members: [userId],
        createdAt: new Date(),
        updatedAt: new Date(),
        joinCode,
        admin: userId,
        settings,
        imageUrl
      });

      const savedList = await list.save();

      const historyEntry = new History({
        action: 'create',
        list: savedList._id,
        performedBy: userId,
        date: new Date(),
      });
      await historyEntry.save();

      res.status(201).json({ message: `הרשימה '${name}' נוצרה בהצלחה.` , list: savedList });
    } catch (error) {
      console.error('Error creating list:', error);
      res.status(500).json({ message: 'Failed to create list', error });
    }
  },

  // Add an item to a list
  addItemToList: async (req, res) => {
    const { List, Item, History } = mongoose.models;

    try {
      const { listId } = req.params;
      const { name, category, quantity = 1, imageUrl, formattedPrice } = req.body;
      const userId = req.user.id;

      if (!name || !category) {
        return res.status(400).json({ message: 'Item name and category are required' });
      }

      const list = await List.findById(listId);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const newItem = new Item({
        list: listId,
        name, category, quantity, imageUrl, formattedPrice,
        addedBy: userId,
        purchased: false,
      });

      const savedItem = await newItem.save();

      list.items.push(savedItem._id);
      list.updatedAt = new Date();
      await list.save();

      const historyEntry = new History({
        action: 'add_item',
        itemId: savedItem._id,
        list: list._id,
        performedBy: userId,
        previousState: null,
        date: new Date(),
      });
      await historyEntry.save();

      res.status(201).json({ message: 'המוצר התווסף בהצלחה לרשימה.', item: savedItem });
    } catch (error) {
      console.error('Error adding item to list:', error);
      res.status(500).json({ message: 'Failed to add item to list', error });
    }
  },
  getRecommendations: async (req, res) => {
    try {
      const recommendations = []; // Placeholder for logic
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch recommendations', error });
    }
  },
  // Update an item in a list
  updateItemInList: async (req, res) => {
    const { List, Item, History } = mongoose.models;

    try {
      const { listId, itemId } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      const list = await List.findById(listId);
      if (!list || !list.items.includes(itemId)) {
        return res.status(404).json({ message: 'Item not found in the list' });
      }

      const previousState = await Item.findById(itemId).lean();
      const updatedItem = await Item.findByIdAndUpdate(itemId, updates, { new: true });

      const historyEntry = new History({
        action: 'update_item',
        itemId: updatedItem._id,
        list: list._id,
        performedBy: userId,
        previousState,
        date: new Date(),
      });
      await historyEntry.save();

      res.status(200).json({ message: 'Item updated in the list', item: updatedItem });
    } catch (error) {
      console.error('Error updating item in list:', error);
      res.status(500).json({ message: 'Failed to update item in list', error });
    }
  },// Delete an item from a list
  deleteItemFromList: async (req, res) => {
    const { List, Item, History } = mongoose.models;

    try {
      const { listId, itemId } = req.params;
      const userId = req.user.id;

      const list = await List.findById(listId);
      if (!list || !list.items.includes(itemId)) {
        return res.status(404).json({ message: 'Item not found in the list' });
      }

      // Fetch the full details of the item before deleting it
      const previousState = await Item.findById(itemId).lean();
      if (!previousState) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Remove the item from the list
      list.items = list.items.filter((id) => id.toString() !== itemId);
      list.updatedAt = new Date();
      await list.save();

      // Delete the item from the database
      await Item.findByIdAndDelete(itemId);

      // Log the deletion in the history, including previousState
      const historyEntry = new History({
        action: 'delete_item',
        itemId, // Save the ID for reference
        list: list._id,
        performedBy: userId,
        previousState, // Include the full details of the deleted item
        date: new Date(),
      });
      await historyEntry.save();

      res.status(200).json({ message: 'Item deleted from list' });
    } catch (error) {
      console.error('Error deleting item from list:', error);
      res.status(500).json({ message: 'Failed to delete item from list', error });
    }
  },

  // Mark an item as purchased in the list
  markItemPurchasedInList: async (req, res) => {
    const { List, Item, History } = mongoose.models;

    try {
      const { listId, itemId } = req.params;
      const userId = req.user.id;

      const list = await List.findById(listId);
      if (!list || !list.items.includes(itemId)) {
        return res.status(404).json({ message: 'Item not found in the list' });
      }

      const previousState = await Item.findById(itemId).lean();

      const updatedItem = await Item.findByIdAndUpdate(
        itemId,
        { purchased: true },
        { new: true }
      );

      list.updatedAt = new Date();
      await list.save();

      const historyEntry = new History({
        action: 'mark_purchased',
        itemId: updatedItem._id,
        list: list._id,
        performedBy: userId,
        previousState,
        date: new Date(),
      });
      await historyEntry.save();

      res.status(200).json({ message: 'Item marked as purchased in list', item: updatedItem });
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      res.status(500).json({ message: 'Failed to mark item as purchased', error });
    }
  },
// Undo the last action
undoLastAction: async (req, res) => {
  const { List, Item, History } = mongoose.models;

  try {
    const userId = req.user.id;
    const { listId } = req.params;
    // Fetch the most recent action for this
    const lastAction = await History.findOne({ list: listId }).sort({ date: -1 });
    if (!lastAction) {
      return res.status(404).json({ message: 'No actions to undo' });
    }

    const { action, itemId, previousState, list } = lastAction;

    // Log the action for debugging
    console.log('Undoing last action:', { action, itemId, previousState, list });

    // Perform undo logic based on the action type
    if (action === 'add_item') {
      // Undo adding an item by deleting it
      if (itemId) {
        await Item.findByIdAndDelete(itemId);
      } else {
        throw new Error('No itemId found for action: add_item');
      }
    } else if (action === 'delete_item') {
      // Undo deleting an item by restoring it from previousState
      if (previousState) {
        const restoredItem = new Item({ ...previousState });
        await restoredItem.save();

        // Re-add the restored item to the list
        if (list) {
          const list = await List.findById(list);
          if (list) {
            list.items.push(restoredItem._id);
            await list.save();
          }
        }
      } else {
        throw new Error('No previousState found for action: delete_item');
      }
    } else if (action === 'update_item') {
      // Undo updating an item by restoring its previous state
      if (itemId && previousState) {
        await Item.findByIdAndUpdate(itemId, previousState);
      } else {
        throw new Error('No itemId or previousState found for action: update_item');
      }
    } else if (action === 'mark_purchased') {
      // Undo marking an item as purchased
      if (itemId && previousState) {
        await Item.findByIdAndUpdate(itemId, { purchased: previousState.purchased });
      } else {
        throw new Error('No itemId or previousState found for action: mark_purchased');
      }
    } else {
      // Unsupported action
      return res.status(400).json({ message: `Undo not supported for action: ${action}` });
    }

    // Remove the history entry after successfully undoing the action
    await History.findByIdAndDelete(lastAction._id);

    res.status(200).json({ message: `Undo successful for action: ${action}` });
  } catch (error) {
    console.error('Error undoing last action:', error);
    res.status(500).json({ message: 'Failed to undo last action', error: error.message });
  }
},
// Fetch recommended items based on user's previous lists
getRecommendations: async (req, res) => {
  const { List } = mongoose.models;

  try {
    const userId = req.user.id;
    const { listId } = req.params;

    const currentList = await List.findById(listId);

    if (!currentList) {
      return res.status(404).json({ message: 'Current list not found' });
    }
  // Assume currentList is the current list document and it has an items array:
  const currentListItemIds = currentList.items.map(id => new mongoose.Types.ObjectId(id));


  const recommendations = await List.aggregate([
        // 1. Match lists where the user is a member and exclude the current list.
          {
            $match: {
              members: new mongoose.Types.ObjectId(userId),
              _id: { $ne: new mongoose.Types.ObjectId(listId) }
            }
          },
          // 2. Lookup the actual item documents.
          {
            $lookup: {
              from: 'items', // ensure this matches your items collection name
              localField: 'items',
              foreignField: '_id',
              as: 'itemsData'
            }
          },
          // 3. Unwind the joined items.
          { $unwind: '$itemsData' },
          // 4. Exclude items that already exist in your current list.
          {
            $match: {
              'itemsData._id': { $nin: currentListItemIds }
            }
          },
          // 5. Sort: first by isArchived (archived lists prioritized) and then by latest added items.
          // Using the _id field of the item as a proxy for creation time (ObjectIds are roughly time-ordered).
          {
            $sort: {
              isArchived: -1,
              'itemsData._id': -1
            }
          },
          // 6. Limit to top 5 items.
          { $limit: 5 },
          // 7. Project the desired output fields.
          {
            $project: {
              item: '$itemsData',
              _id: 0
            }
          }
    ]);

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations', error });
  }
},
getTopItemsInLists: async (req, res) => {
  const { Item } = mongoose.models;
  try {
    const topItems = await Item.aggregate([
      // 1. Filter for items that are purchased and have a valid imageUrl.
          { 
            $match: { 
              purchased: true, 
              imageUrl: { $exists: true, $ne: null } 
            } 
          },
          // 2. Group by a unique identifier (e.g., name) and count occurrences.
          {
            $group: {
              _id: "$name",
              count: { $sum: 1 },
              // Grab a representative document from each group.
              item: { $first: "$$ROOT" }
            }
          },
          // 3. Sort the groups by purchase count in descending order.
          { $sort: { count: -1 } },
          // 4. Limit the result to the top 5 groups.
          { $limit: 5 },
          // 5. Project the desired fields.
          {
            $project: {
              _id: 0,
              name: "$_id",
              purchaseCount: "$count",
              item: 1
            }
          }

    ]);
    
    res.status(200).json({ topItems });
  } catch (error) {
    console.error('Error fetching top items:', error);
    res.status(500).json({ message: 'Failed to fetch top items', error });
  }
},
  editListDetails: async (req, res) => {
    const { List, History } = mongoose.models;

    try {
      const { listId } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      const list = await List.findById(listId);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const previousState = list.toObject();
      const updatedList = await List.findByIdAndUpdate(listId, updates, { new: true })
        .populate({ path: 'items', populate: 'addedBy assignee' })
        .populate('history', 'action date performedBy')
        .populate('members')
        .populate({ path: 'history', populate: { path: 'performedBy', select: 'email' } });
;

      const historyEntry = new History({
        action: 'update_list_settings',
        list: updatedList._id,
        performedBy: userId,
        previousState,
        date: new Date(),
      });
      await historyEntry.save();

      res.status(200).json({ message: `הצטרפת לרשימה "${list.name}" בהצלחה!`, list: updatedList });
    } catch (error) {
      console.error('Error updating list details:', error);
      res.status(500).json({ message: 'Failed to update list details', error });
    }
  },
  joinList: async (req, res) => {
    const { List, History } = mongoose.models;
    try {
      const { joinCode } = req.body;
      const userId = req.user.id;

      if (!joinCode) {
        return res.status(400).json({ message: 'Join code is required' });
      }

      console.log("joinCode, ", joinCode)
      const list = await List.findOneAndUpdate(
        { joinCode },
        { $addToSet: { members: userId } },
        { new: true }
      );

      if (!list) {
        return res.status(404).json({ message: 'לא נמצאה רשימה עם קוד הצטרפות זה.' });
      }

      const historyEntry = new History({
        action: 'join_list',
        list: list._id,
        performedBy: userId,
        date: new Date(),
      });

      await historyEntry.save();

      res.status(200).json({ message: 'Joined list successfully', list });

    } catch(e) {
      console.error('Error joining list:', e);
      res.status(500).json({ message: 'Failed to join list', error: e });
    }
  }
};
