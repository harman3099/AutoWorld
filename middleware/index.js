var middlewareObj = {};
    Cars = require("../models/car");
    Comment = require("../models/comment");


middlewareObj.checkCarOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Cars.findById(req.params.id, function(err, foundCar){
            if(err){
                req.flash("error", "Could not find that!");
                res.redirect("back");
            } else {
                if(foundCar.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("/cars");
                };
            };
        });
    } else {
        req.flash("error", "You need to be logged in!");
        res.redirect("/login");
    } ;
};

middlewareObj.checkCommOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("/cars");
                };
            };
        });
    } else {
        req.flash("error", "You need to be logged in!");
        res.redirect("/login");
    } ;
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    };
    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
};

module.exports = middlewareObj;