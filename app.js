const express=require("express")

// make app an express object


const app=express()
const cors=require("cors")
const routes =require('./Api/routes/routes.js');

// establish connection to tododb app.js


//----------- load middleware functions to app -----------//
app.use(express.json()) // parse request body as json and store in req.body
app.use(cors()) // enable cross origin resource sharing
app.use(express.urlencoded()) // only parse url encodied req bodies



app.use(routes)

module.exports = app;


