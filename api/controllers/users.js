const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    signup: (req, res) => {
        const User = mongoose.models.User;
        const { email, password } = req.body;

        User.find({ email }).then((users) => {
            if (users.length >= 1) {
                return res.status(409).json({
                    message: 'Email exists'
                })
            }

            bcrypt.hash(password, 10, (error, hash) => {
                if (error) {
                    return res.status(500).json({
                        error
                    })
                }

                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email,
                    password: hash
                })

                user.save().then((result) => {
                    console.log(result);

                    res.status(200).json({
                        message: 'User created'
                    });
                }).catch(error => {
                    res.status(500).json({
                        error
                    })
                });
            });
        })
    },
    login: (req, res) => {
        const User = mongoose.models.User;
        const { email, password } = req.body;

        User.find({ email }).select('+password').then((users) => {
            if (users.length === 0) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            const [user] = users;

            bcrypt.compare(password, user.password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }

                if (result) {
                    const token = jwt.sign({
                        id: user._id,
                        email: user.email,
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1D"
                        });

                    delete user.password;
                    return res.status(200).json({
                        message: 'Auth successful',
                        token,
                        user
                    })
                }

                res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
    },
    userDetails: async (req, res) => {
        const User = mongoose.models.User;

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.status(200).json({ user });
        } catch (error) {
            console.log("error", error)
            res.status(500).json({
                error
            });
        }
    },
    updateUserDetails: async (req, res) => {
        const User = mongoose.models.User;
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const { email, fullName, image } = req.body;

            if (email) {
                user.email = email;
            }
            if (fullName) {
                user.fullName = fullName;
            }
            if (image) {
                user.image = image;
            }

            console.log("user", user)
            console.log({email, fullName, image})

            await user.save();

            res.status(200).json({ user });
        } catch (error) {
            console.log("error", error)
            res.status(500).json({
                error
            });
        }
    }
}
