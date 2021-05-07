

const router = require("express").Router();
const upload = require('../middlewares/uploadImg');
const controller = require('../controllers/UsersController');



// GET on FQDN/users OR FQDN/users/
router.get("/",controller.getAll);

// POST on FQDN/users OR FQDN/users/
 router.post("/" , upload.single('img') ,controller.post);

// PUT on FQDN/users/ID .
router.put("/:id", upload.single('img') , controller.put );


// DELETE on FQDN /users/ID .
router.delete("/:id", controller.delete );

module.exports = router;