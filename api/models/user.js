const mongoose = require('mongoose');

// Check if model already exists before defining it again
if (!mongoose.models.User) {
  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Require password only if no Google ID
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows unique values but also allows NULL
    },
    image: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
      required: false,
    },
    lists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
      },
    ],
  });

  module.exports = mongoose.model('User', userSchema);
} else {
  module.exports = mongoose.models.User;
}
