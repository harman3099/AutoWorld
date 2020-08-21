require('dotenv').config();
var express = require("express");
    app = express();
    bodyParser = require("body-parser");
    mongoose = require("mongoose");
    flash = require("connect-flash");
    methodOverride = require("method-override");
    passport = require("passport");
    LocalStrategy = require("passport-local");
    session = require("express-session");
    Cars = require("./models/car");
    Comment = require("./models/comment");
    User = require("./models/user");

    carRoutes = require("./routes/car");
    commentRoutes = require("./routes/comment");
    indexRoutes = require("./routes/index");

// mongoose.connect("mongodb://localhost/cars2", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.connect("mongodb+srv://harman2:"+process.env.MONGODBPASS+"@cars-5ma7e.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({
    secret: "Eagles win",
    resave: false,
    saveUninitialized: true,
}));
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(carRoutes);
app.use(commentRoutes);
app.use(indexRoutes);


app.listen(process.env.PORT || 8080, process.env.IP, function(){
    console.log("Cars server running");
});
