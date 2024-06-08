const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

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

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Login Page' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register Page' });
});

app.post('/register', async (req, res) => {
    try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect('/');
    } catch (err) {
    console.error(err);
    res.status(500).send('Error registering new user. Please try again.');
    }
});

app.post('/login', async (req, res) => {
    try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        res.redirect('/dashboard');
    } else {
        res.status(401).send('Invalid username or password.');
    }
    } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in. Please try again.');
    }
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});