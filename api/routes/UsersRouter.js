

const router = require("express").Router();
const upload = require('../middlewares/uploadImg');
const update = require('../middlewares/updateImg');
const controller = require('../controllers/UsersController');
const auth = require('../middlewares/auth');


// GET on FQDN/users OR FQDN/users/
router.get("/", auth.isAuth ,controller.getAll); //Testing purposes only .


router.post("/login" , auth.isNotAuth , auth.authenticate('local') ,  controller.login);
router.post('/logout' , auth.isAuth , controller.logout);

// POST on FQDN/users OR FQDN/users/
 router.post("/register", auth.isNotAuth , upload.single('img') ,controller.post);

// PUT on FQDN/users/ID .
//router.put("/:id", auth.isAuth , upload.single('img') , controller.put );
router.put("/", auth.isAuth , update.single('img') , controller.put );

// DELETE on FQDN /users/ID .
//router.delete("/:id", auth.isAuth , controller.delete );
router.delete("/", auth.isAuth , controller.delete );
module.exports = router;