app.enable('trust proxy')

function ensureSecure(req, res, next) {
    console.log('isTLS: ' + req.secure);
    if (req.secure) {
        // Request is already secure (HTTPS)
        console.log('Using secure protocol');
        return next();
    }
    console.log('not using secure ssl, redirecting to  %s' % ('https://' + req.hostname + req.originalUrl));

    // Redirect to HTTPS version of the URL
    res.redirect('https://' + req.hostname + req.originalUrl);
}

app.use(ensureSecure);

app.get('/', function (req, res) {
    //console.log('Session data on /:', req.session.user);
    console.log("\nIncoming request from: " + req.remoteAddress);
    if (req.session.user) {
        res.redirect('/protected-route');
    } else {
        //console.log('req.session.user:', req.session.user);
        res.sendFile(path.join(__dirname, './public/home.html'));
    }
});

app.get('/signup', function (req, res) {
    res.sendFile(path.join(__dirname, './public/signup.html'));
});

app.get('/forgot-password', function (req, res) {
    res.sendFile(path.join(__dirname, './public/forgot-password.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Sign in the user with Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User logged in:', user.uid, user);
        // Retrieve user data from Firestore
        const userDoc = await db.collection('triton-users').doc(user.uid).get();
        if (!userDoc.exists) {
            throw new Error('User data not found in Firestore');
        }
        const userData = userDoc.data();

        if (!userData.emailVerified) {
            // Update email verification status
            console.log('Email not verified, checking Firebase Auth...');
            await updateEmailVerificationStatus(user);
        }

        // Store user session
        req.session.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };

        console.log('Session data set:', req.session.user);

        // Redirect to the dashboard
        res.redirect('/protected-route');
    } catch (error) {
        console.error('Error logging in user:', error);
        let errorMessage = 'Error logging in user';

        if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }

        res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
    }
});

app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        // Create user with Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with display name
        const displayName = `${firstName} ${lastName}`;
        await user.updateProfile({
            displayName: displayName
        });

        // Send email verification
        await user.sendEmailVerification();

        // Store user data in Firestore
        await db.collection('triton-users').doc(user.uid).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            emailVerified: false, // Initially set to false
            createdAt: new Date()
        });

        req.session.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };

        // res.send(`<div align='center'><h2>Signup Successful!</h2><h3>Welcome ${displayName}. Please verify your email address.</h3></div>`);
        res.redirect('/protected-route');

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});