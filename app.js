const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/thesis', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Session configuration
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: secure should be true in production with HTTPS
}));

// User Schema and Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Middleware to check if user is authenticated
app.use('/main', (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
});

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        // If user is logged in, redirect to main page
        return res.redirect('/main');
    }
    // If user is not logged in, render the main page
    res.render('main', { title: 'Main' });
});

app.get('/main', (req, res) => {
    res.render('dashboard-main', { title: 'Dashboard' });
});




// Add a route for rendering the login page
app.get('/login', (req, res) => {
    res.render('index', { title: 'Login Page', error: null });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register Page', error: null });
});

app.post('/register', async (req, res) => {
    try {
        const { name, address, username, password } = req.body;

        if (!name || !address || !username || !password) {
            return res.render('register', { title: 'Register Page', error: 'All fields are required.' });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.render('register', { title: 'Register Page', error: 'Username already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, address, username, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).render('register', { title: 'Register Page', error: 'Error registering new user. Please try again.' });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('index', { title: 'Login Page', error: 'All fields are required.' });
        }

        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id; // Save user ID in session
            res.redirect('/main');
        } else {
            res.status(401).render('index', { title: 'Login Page', error: 'Invalid username or password.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('index', { title: 'Login Page', error: 'Error logging in. Please try again.' });
    }
});


app.post('/signout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error signing out. Please try again.');
        }
        res.redirect('/');
    });
});

app.get('/main', (req, res) => {
    res.render('main', { title: 'Main' });
});

app.listen(PORT, () => {
    console.log(`Server is running`);
});

