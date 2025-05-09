const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  signup: (req, res) => {
    const { email, password } = req.body;

    User.find({ email })
      .then((users) => {
        if (users.length >= 1) {
          return res.status(409).json({
            message: 'Email exists',
          });
        }

        bcrypt.hash(password, 10, (error, hash) => {
          if (error) {
            return res.status(500).json({ error });
          }

          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            password: hash,
          });

          user
            .save()
            .then((result) => {
              res.status(201).json({ message: 'User created' });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        });
      })
      .catch((error) => res.status(500).json({ error }));
  },

  login: (req, res) => {
    const { email, password } = req.body;

    User.find({ email })
      .then((users) => {
        if (users.length === 0) {
          return res.status(401).json({ message: 'Auth failed' });
        }

        const user = users[0];

        bcrypt.compare(password, user.password, (error, result) => {
          if (error) {
            return res.status(401).json({ message: 'Auth failed' });
          }

          if (result) {
            const token = jwt.sign(
              { id: user._id, email: user.email },
              'your_jwt_secret_key', // Use `process.env.JWT_KEY` for production
              { expiresIn: '1h' }
            );

            return res.status(200).json({
              message: 'Auth successful',
              token,
            });
          }

          res.status(401).json({ message: 'Auth failed' });
        });
      })
      .catch((error) => res.status(500).json({ error }));
  },
};
