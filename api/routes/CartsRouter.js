

const router = require("express").Router();
const controller = require('../controllers/CartsController');



// GET on FQDN/products OR FQDN/carts/
router.get("/",controller.getAll);

// POST on FQDN/products OR FQDN/carts/
 router.post("/" , controller.post);




// DELETE on FQDN/carts/ID .
router.delete("/:id" , controller.delete );

module.exports = router;