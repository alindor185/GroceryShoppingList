// const mongoose = require('mongoose');

// const familySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   joinCode: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   members: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User', // Reference to the User model
//     },
//   ],
// });

// module.exports = mongoose.models.Family || mongoose.model('Family', familySchema);
