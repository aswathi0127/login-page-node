const express = require('express');
const session = require('express-session');
const path = require('path');
const nocache = require('nocache');

const app = express();
function noCache(req, res, next) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
}



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded data from POST requests
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

app.use(nocache())
// Configure session with secure options
app.use(
    session({
        secret: 'yourSecretKey', // Use a strong secret in production
        resave: false, // Avoid unnecessary session saving
        saveUninitialized: false, // Create sessions only when needed
        cookie: {
            maxAge: 60000, // Session expiration in milliseconds (1 minute)
            httpOnly: true, // Prevent client-side script access to cookies
            secure: false, // Set to true if using HTTPS
        },
    })
);

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.UserLogged) {
        return next();
    }
    return res.redirect('/');
}

function isLoggedOut(req, res, next) {
    if (req.session && req.session.UserLogged) {
        return res.redirect("/home")
    }
    return next();
}

// Route for the homepage (login page)
app.get('/', isLoggedOut, (req, res) => {
    res.render('login', { error: null }); // Render the login page with no error initially
});

// Route to handle login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const validEmail = 'ckachutly01@gmail.com';
    const validPassword = '123456';

    if (email === validEmail && password === validPassword) {
        req.session.UserLogged = true; // Set session flag on successful login
        return res.redirect('/home');
    }
    return res.render('login', { error: 'Invalid email or password' });
});

// Route for the dashboard (protected route after login)
app.get('/home', noCache, isAuthenticated, (req, res) => {
    res.render('home');
});

// Logout route
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.redirect('/login');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

// Catch-all route for undefined routes
app.all('*', (req, res) => {
    if (req.session && req.session.UserLogged) {
        return res.redirect('/home');
    }
    return res.redirect('/');
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. Open http://localhost:${PORT}`);
});