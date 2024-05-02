const express = require('express');
const router = express.Router();
const passport = require("passport")
const upload = require("./multer")
const userModel = require("./users")
const taskModel = require("./tasks")
const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()));
const path = require("path")
const uploadsPath = path.join(__dirname, "uploads");
router.use("/uploads", express.static(uploadsPath));

router.get('/', function (req, res) {
    res.render('regi');
});
router.get('/login', function (req, res, next) {
    res.render('login', { error: req.flash('error') });
});

router.get('/home', isLoggedIn, async function (req, res, next) {
    const user = req.user;
    res.render('home', { user });
});

//  ---------------- Create  task -------------- 
router.get('/addtask', isLoggedIn, async function (req, res, next) {
    const user = req.user;
    res.render('addtask', { user });
});
router.post('/addtask', isLoggedIn, async function (req, res, next) {
    const { task, term, date } = req.body;
    const newtask = await taskModel.create({ task, term, date });
    res.redirect('/tasklist');
});

//  ----------------  Read  task --------------
router.get('/tasklist', isLoggedIn, async function (req, res) {
    const user = req.user;
    const tasks = await taskModel.find();
    res.render('tasklist', { user, tasks });
});

//  ----------------  update  task --------------
router.get('/update/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const task = await taskModel.findOne({ _id: id });
    res.render('update', { task });
});

router.post('/updatetask/:id', isLoggedIn, async function (req, res) {
    const { task, term, date } = req.body;
    const id = req.params.id;
    await taskModel.findByIdAndUpdate(id,  { task, term, date },  { new: true});
    const tasks = await taskModel.find();
    res.redirect('/tasklist', { tasks });
});


//  ----------------  delete  task --------------
router.get('/delete/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    await taskModel.deleteOne({ _id: id });
    const tasks = await taskModel.find();
    res.redirect('/tasklist', { tasks });
});


router.post("/register", upload.single('image'), function (req, res) {
    const { username, email, password, confirm } = req.body;
    const imagefile = req.file ? req.file.filename : null;
    const userdata = new userModel({ username, email, password, confirm, image: imagefile })

    userModel.register(userdata, req.body.password)
        .then(function (registereduser) {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home")
            })
        });
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
}));
router.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

module.exports = router;
