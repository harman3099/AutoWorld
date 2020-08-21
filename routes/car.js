var express = require("express");
    router = express.Router();
    Cars = require("../models/car");
    middleware = require("../middleware/index");
    multer = require('multer');
;

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
    cloudinary.config({ 
    cloud_name: 'harman3099', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
    });
;

router.get("/cars", function(req, res){
    Cars.find({}, function(err, cars){
        if(err){
            console.log(err);
        } else {
            res.render("cars/cars", {Cars: cars});
        }
    })
    
});

router.get("/cars/new", middleware.isLoggedIn, function(req, res){
    res.render("cars/new");
});

router.post("/cars", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
    req.body.car.image = result.secure_url;
    req.body.car.imageId = result.public_id;
    req.body.car.author = {
        id: req.user._id,
        username: req.user.username
    }
    Cars.create(req.body.car, function(err, car) {
        if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
        }
        res.redirect('/cars/' + car.id);
    });
    });
});

router.get("/cars/:id", function(req, res){
    Cars.findById(req.params.id).populate("comments").exec(function(err, foundCar){
        if(err){
            console.log(err);
        } else {
            res.render("cars/show", {car: foundCar});
        };
    });
});

router.get("/cars/:id/edit", middleware.checkCarOwnership, function(req, res){
    Cars.findById(req.params.id, function(err, foundCar){
        if(err){
            console.log(err);
        } else {
            res.render("cars/edit", {car: foundCar});
        }
    })
});

router.put("/cars/:id", middleware.checkCarOwnership, upload.single("image"), function(req, res){
    Cars.findById(req.params.id, async function(err, car){
        if(err){
            req.flash("error", err.message);
            req.redirect("back");
        } else {
            if(req.file){
                try {
                    await cloudinary.v2.uploader.destroy(car.imageId);
                    var  result = await cloudinary.v2.uploader.upload(req.file.path);
                    car.imageID = result.public_id;
                    car.image = result.secure_url;
                } catch(err) {
                    req.flash("error", err.message);
                    return req.redirect("back");
                }
            }
            car.name = req.body.name;
            car.description = req.body.description;
            car.save();
            req.flash("success", "Successfully Updated");
            res.redirect("/cars/" + car._id);
        }
    })
});

router.delete("/cars/:id", middleware.checkCarOwnership, function(req, res){
    Cars.findById(req.params.id, async function(err, car){
        if(err){
            req.flash("error", err.message);
            return req.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(car.imageId);
            car.remove();
            req.flash("success", "Vehicle deleted");
            res.redirect("/cars");
        } catch(err) {
            req.flash("error", err.message);
            return req.redirect("back");
        }
    });
});

module.exports = router;