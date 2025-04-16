const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');
const passport = require("passport"); // ✅ Import Passport.js
require("./api/middlewares/passport"); // ✅ Load Passport Strategies


const checkAuth = require('./api/middlewares/checkAuth');
const authRoutes = require("./api/routes/auth"); // Import Google Auth Routes
const recommendationRoutes = require('./api/routes/recommendation');


// ✅ Load models
require("./api/models/family");
require("./api/models/list");
require("./api/models/category");
require("./api/models/history");
require("./api/models/item");
require("./api/models/user");
require("./api/models/Recommendations");



// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB Connected!');
});

// ✅ Import Routes
const itemsRoutes = require('./api/routes/items');
const categoriesRoutes = require('./api/routes/categories');
const usersRoutes = require('./api/routes/users');
const historyRoutes = require('./api/routes/history');
const listsRoutes = require('./api/routes/lists');


// ✅ Middleware
app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Initialize Passport Middleware
app.use(passport.initialize());

// ✅ Routes
app.use("/auth", authRoutes); // Ensure authentication routes are used
app.use('/categories', checkAuth, categoriesRoutes);
app.use('/users', usersRoutes);
app.use('/history', historyRoutes);
app.use('/items', itemsRoutes);
app.use('/lists', listsRoutes); // All weekly lists routes (e.g., GET, POST)
app.use('/recommendation', recommendationRoutes);


// ✅ Error Handling
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: { message: error.message }
    });
});
app.use('/api/recommendation', recommendationRoutes); // Add this line


module.exports = app;
