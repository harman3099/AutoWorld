var express = require("express");
    router = express.Router();
    Cars = require("../models/car");
    Comment = require("../models/comment");
    middleware = require("../middleware/index")

;


router.get("/cars/:id/comments/new", middleware.isLoggedIn, function(req, res){
    Cars.findById(req.params.id, function(err, car){
        if(err){
            console.log(err);
        } else {
            res.render("comments/newcomm", {car: car});
        };
    });
});

router.post("/cars/:id/comments", middleware.isLoggedIn, function(req, res){
    Cars.findById(req.params.id, function(err, foundCar){
        if(err){
            console.log(err);
        } else {
            Comment.create(req.body.comment, function(err, newComment){
                if(err){
                    console.log(err);
                } else {
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    foundCar.comments.push(newComment);
                    foundCar.save();
                    res.redirect("/cars/" + foundCar._id);
                }
            })
        }
    })
});

router.get("/cars/:id/comments/:comment_id/edit", middleware.checkCommOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComm){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/editcomm", {car_id: req.params.id, comment: foundComm});
        };
    });
});

router.put("/cars/:id/comments/:comment_id", middleware.checkCommOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, newComment){
        if(err){
            console.log(err);
        } else {
            res.redirect("/cars/" + req.params.id);
        }
    })
});

router.delete("/cars/:id/comments/:comment_id", middleware.checkCommOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/cars/" + req.params.id);
        };
    });
});

module.exports = router;