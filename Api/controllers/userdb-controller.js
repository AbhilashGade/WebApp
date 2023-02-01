const base64 = require("base-64")
const bcrypt = require("bcryptjs") 
const User = require( '../models/model.js');
const {validInputsForUpdate, validInputsForCreate}= require('../utils/validations.js')
const post = async (request,response)=>{
    
       const { username, password, first_name, last_name } = request.body;
       const salt = await bcrypt.genSalt(10);
       let hash = await bcrypt.hash(password, salt);
       console.log(validInputsForCreate( username, password, first_name, last_name))
      if(validInputsForCreate( username, password, first_name, last_name)===false)
      {response
        .status(400)
        .send({ message: "Oops. Invalid Details" })}
        else{
       User.findOrCreate({
        where: { username },
        defaults: {
          username: username,
          password: hash,
          first_name: first_name,
          last_name: last_name,
          account_created: new Date(),
          account_updated: new Date(),
        },
      })
        .then(([feedback, success]) => {
          if (success) {
            response.status(201).send({
              id: feedback.getDataValue("id"),
              username: feedback.getDataValue("username"),
              first_name: feedback.getDataValue("first_name"),
              last_name: feedback.getDataValue("last_name"),
              account_created: feedback.getDataValue("createdAt"),
              account_updated: feedback.getDataValue("updatedAt"),
            });
          } else {
            response
              .status(400)
              .send({ message: "Oops. Username Already Exists" });
          }
        })
        .catch(() => {
          response.status(400).send({
            message: "Bad Request",
          });
        });
       
    
    
 }}
 const get = async (request,response)=>{
    
       const id = Number(request.params.id);
       console.log(id)

       const encodedToken = request.headers.authorization.split(" ")[1];
    
       const baseToAlpha = base64.decode(encodedToken).split(":");
       let decodedUsername = baseToAlpha[0];
       let decodedPassword = baseToAlpha[1];
       
    
     if (!id){
        response.status(400).send({message:"invalid Id"})
     }

     User.findOne({
        where:{
            id:id,
        },
     })
     .then(async (user)=>{
        if(user){
            const valid=await bcrypt.compare(decodedPassword,user.getDataValue("password"))
            if (decodedUsername === user.getDataValue("username") && valid ===true)
                {
                    //200
                    response.status(200).send({
                      id: user.getDataValue("id"),
                      first_name: user.getDataValue("first_name"),
                      last_name: user.getDataValue("last_name"),
                      username: user.getDataValue("username"),
                      account_created: user.getDataValue("createdAt"),
                      account_updated: user.getDataValue("updatedAt"),
                    });
                  }
            else if (decodedUsername !== user.getDataValue("username")){
                response.status(403).send({
                    message:"Forbidden Access or not registered",
                });
                }
            else if (valid===false){
                try{

                response.status(401).send({
                    message:"invalid Password"
                })}
                catch{response.status(400).send({
                    message:"Bad Request"
                })}
            }
            else
            { try{
                response.status(400).send({
                    message:" 400. User Does not exist"
                })}
                catch{response.status(400).send({
                    message:" invalid input"
                })}
            }
          
        }
     })
     
 }

        
 
const update = async (request,response)=>{


        
        const id = Number(request.params.id);
        
 
        const encodedToken = request.headers.authorization.split(" ")[1];
        const { username,first_name,last_name,account_created, account_updated,password } = request.body;
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        
        
     if (username || account_created || account_updated) {
    //send 400 response for invalid inputs
    response.status(400).send({
      message:
        "Bad Request. Cannot update username / account_created / account_updated",
    });}
    else if(validInputsForUpdate(id, password, first_name, last_name)===false){
        response.status(400).send({ message: "Bad Request. Invalid Inputs" });

    }
    else {
        User.findOne({
            where: {
              id: id,
            },
          }).then(async (user) =>{ if (user){
    

     const valid = await bcrypt.compare(decodedPassword,user.getDataValue("password")) 
     if(valid===true && decodedUsername === user.getDataValue("username")){
        const salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        User.update(
            {
              password: hash,
              first_name: first_name,
              last_name: last_name,
              account_updated: new Date(),
            },
            {
              where: {
                id: id,

                username: decodedUsername,
              },
            })
            .then((result) => {
                response.status(204).send({});
              })
            .catch(() => {
                response.status(400).send({
                  message: "Bad Request. Incorrect inputs for Update",
                });
              })
          
        

     }    else if(valid===false || decodedUsername !== user.getDataValue("username")){
            response.status(401).send({message:"User Authentication failed"})
        
     }

    
}
    })}}

 const healthCheck = async (request,response)=>{
    try{
        response.status(200).send({ message: "All good" });
    }catch(error){
        response.status(404).send({message:"Resource not available"});
       
    }
}

module.exports={healthCheck,post,get,update};
