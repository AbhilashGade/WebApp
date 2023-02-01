const express = require("express");
const {healthCheck,post,get,update} =require( '../controllers/userdb-controller.js');

const router = express.Router(); // get router object

// route for 'get' (fetch all todo's) and 'post' requests on endpoint '/todo-items' 
router.route('/v1/user/:id')
      .get(get)
      .put(update)

//route for 'get', 'put' and 'delete' for single instance of todo item based on request parameter 'id'
router.route('/v1/user')
      .post(post)

router.route('/healthz')
      .get(healthCheck)

module.exports=router