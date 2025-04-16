export const isAuthenticated = (req, res, next) => {
    // Check if the user is authenticated
    if (req.session && req.session.user) {
        return next();
    }
    // If not authenticated, redirect to the login page
    res.redirect('/?error=' + encodeURIComponent('Please log in to access this page.'));
}