const express = require("express");
const db = require("../models/database_setup")
const User = require("../models/User")
const passport = require("passport")
const loginRouter = express.Router();



/*loginRouter.use((req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash("info", "You have already logged in. Please logout first")
        res.redirect("/")
    }
    
    next()
})*/

loginRouter.route("/register").get((req, res) => {
    res.render("./customers/page-user-register");
}).post(async (req, res) => {
    try {
        if (req.body.repeatpassword != req.body.password) {
            req.flash("error", "Your repeat password and password are not the same!")
            return res.redirect("/register")
        }
        else if(await User.findOne({where: {email: req.body.email }})) {
            req.flash("error", "Email is not unique!")
            return res.redirect("/register")
        } 
        User.create({username: req.body.username, email: req.body.email, password: req.body.password, isStaff: false})
        req.flash("success", "Successfully registered!")
        return res.redirect("/login")
    } catch(e) {
        req.flash("error", e)
    }

})

loginRouter.route("/login-google").get( passport.authenticate("google", {scope: ['profile', 'email']}))
loginRouter.route("/login-google/callback").get(passport.authenticate('google', {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true
}), (req, res) => {
    res.redirect("/")
})


loginRouter.route("/login").get((req, res) => {
 
    res.render("./customers/page-user-login")
}).post(passport.authenticate(["local", "anonymous"], {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true
}), (req, res) => {
    req.flash("error", "No such account")
    res.redirect("/login")
})



module.exports = loginRouter;