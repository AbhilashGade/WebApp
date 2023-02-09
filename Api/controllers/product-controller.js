const base64 = require("base-64")
const bcrypt = require("bcryptjs"); 
const { response } = require("express");
const { where } = require("sequelize");
const { request } = require("../../app.js");
const {User,Product} = require( '../models/model.js');

function productPostValidation(name,description,sku,manufacturer,quantity){
    if(!name || !description || !sku || !manufacturer || !quantity || quantity<=0 || typeof quantity === 'string'|| quantity>100) return false;
    else return true;
    
}

const prodPost = async (request,response)=>{
    const {name,description,sku,manufacturer,quantity,date_added,date_last_updated,owner_user_id } = request.body;

    if (productPostValidation(name,description,sku,manufacturer,quantity)===false){
        response.status(400).send({
            message:" product cannot have empty description or less than zero quantity",})
    }
    else if(date_added || date_last_updated || owner_user_id){ response.status(400).send({
        message:" invalid parameters date added or date updated or owner_user_id",}) }
    else{
    if(!request.headers.authorization){
        response.status(400).send({
            message:"No Auth",
        });
    }
    else{
        const encodedToken = request.headers.authorization.split(" ")[1];
    
       const baseToAlpha = base64.decode(encodedToken).split(":");
       let username = baseToAlpha[0];
       let decodedPassword = baseToAlpha[1];

       User.findOne({
        where:{
            username,
        },
     })
        .then(async(user)=>{
            if(!user){
                response.status(400).send({
                    message: "Invalid User",})
            } else{
                const valid= await bcrypt.compare(decodedPassword,user.getDataValue("password"))
                if (valid===true){
                 const skuCheck = await Product.findAll({
                    where: {
                      sku: sku
                    }
                
                  });
                if (skuCheck.length!==0){
                    response.status(400).send({
                    message: "SKU exists",})}
                else{
                 Product.create({
                        
                            name:name,
                            description:description,
                            sku:sku,
                            manufacturer:manufacturer,
                            quantity:quantity,
                            date_added: new Date(),
                            date_last_edited: new Date(),
                            owner_user_id: user.getDataValue("id")


                        
                    })
                    .then((feedback)=>{
                       
                            response.status(201).send({
                                
                                name: feedback.getDataValue("name"),
                                description: feedback.getDataValue("description"),
                                sku: feedback.getDataValue("sku"),
                                manufacturer: feedback.getDataValue("manufacturer"),
                                quantity: feedback.getDataValue("quantity"),
                                date_added:feedback.getDataValue("createdAt"),
                                date_last_edited:feedback.getDataValue("updatedAt"),
                                owner_user_id: feedback.getDataValue("owner_user_id")
                              });
                        
                        
                    })
                    .catch(() => {
                        response.status(400).send({
                          message: "Bad Request",
                        });
                      });
                }}
                else{
                    response.status(401).send({
                        message: "Incorrect password",})
                }
                
            }
        })
                    }
}
}

const prodGet = async(request,response)=>{ 
    const id = Number(request.params.id)
    if(!id || typeof id === "string"){
        response.status(400).send({message:"invalid Id"})
    }
    else
    {
        Product.findOne(
            {
                where:{
                    id:id,
                },
            }
        )
        .then((prod)=> {
            if(prod){
                response.status(200).send({
                    
                        id: prod.getDataValue("id"),
                        name: prod.getDataValue("name"),
                        description: prod.getDataValue("description"),
                        sku: prod.getDataValue("sku"),
                        manufacturer: prod.getDataValue("manufacturer"),
                        quantity: prod.getDataValue("quantity"),
                        date_added: prod.getDataValue("date_added"),
                        date_last_updated: prod.getDataValue("date_last_updated"),
                        owner_user_id: prod.getDataValue("owner_user_id")
                      
                })
            }
            else
            {
                response.status(404).send({
                    message:"Id does not exist"
                })
            }
        })
        .catch(()=>{
            response.status(400).send({
                message:"invalid "
            })
        })
    }

}
const prodPatch = async(request,response)=>{
    const id = Number(request.params.id);
    console.log(id)
   if (!request.headers.authorization){
     response.status(400).send({
       message:"No Auth",
   });
   }

   else if(!id || typeof id === "string"){
    response.status(400).send({message:"invalid Id"})
   }

   else{
        const encodedToken = request.headers.authorization.split(" ")[1];
        const {name,description,sku,manufacturer,quantity,date_added,date_last_updated,owner_user_id} = request.body;
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        if (date_added || date_last_updated || owner_user_id){
            response.status(400).send({
                message: "Invalid entry date updated || date added",
              })
        }
       else if(name===""|| description === "" || sku === "" || manufacturer === "" || quantity === "" || typeof quantity === 'string'|| quantity<0 || quantity>100){
            response.status(400).send({
                message: "Invalid entry",
              })
        }
        else{
        User.findOne({
            where: {
              username: decodedUsername,
            },
          })
        .then(
            async (user)=>{
            const valid = await bcrypt.compare(decodedPassword,user.getDataValue("password")) 
           if(valid===true && decodedUsername === user.getDataValue("username")){
            Product.findOne({
                where:{
                    id:id,
                },
            })
            .then(
                async (product)=>{
                    if (!product){
                        response.status(404).send({
                            message: "Product Not available",
                          })
                    }
                    else if (product.getDataValue("owner_user_id")!== user.getDataValue("id")){
                        response.status(403).send({
                            message: "Forbidden access",
                          })}
                    else{
                    if(product.getDataValue("owner_user_id")===user.getDataValue("id")){
                            product.update(
                                {
                                   name:name,
                                   description:description,
                                   sku:sku,
                                   manufacturer:manufacturer,
                                   quantity:quantity,
                                   date_last_updated: new Date()
                                }
                            )
                            .then((result) => {
                                response.status(204).send({
                                    });
                              })
                            .catch(() => {
                                response.status(400).send({
                                  message: "Bad Request. Incorrect inputs for Update",
                                });
                              })
                    }else{response.status(400).send({
                        message: "Invalid product Id",
                      });}
                }
            }
            )

            } else{response.status(401).send({
                message: "Invalid Password",
              });

            }}
        )
   }}
    
}
const prodDelete= async(request,response)=>
{
    const id = Number(request.params.id);
    console.log(id)
   if (!request.headers.authorization){
     response.status(400).send({
       message:"No Auth",
   });
   }

   else if(!id || typeof id === "string"){
    response.status(400).send({message:"invalid Id"})
   }

   else{
        const encodedToken = request.headers.authorization.split(" ")[1];
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        User.findOne({
            where: {
              username: decodedUsername,
            },
          })
          .then(async (user)=>{
            const valid = await bcrypt.compare(decodedPassword,user.getDataValue("password")) 
           if(valid===true && decodedUsername === user.getDataValue("username")){
            Product.findOne({
                where:{
                    id:id,
                },
            })
            .then(async (product)=>{
                if (product.getDataValue("owner_user_id")!== user.getDataValue("id")){
                    response.status(403).send({
                        message: "Unauthorized access",
                      })}
                else{
                    Product.destroy({
                        where:{
                        id:id,
                    },
                })
                .then((val)=>{
                    if(val){
                        response.status(204).send({})
                    }
                })
                }
                


            })
            .catch((val)=>{
                console.log(val)
                response.status(404).send({
                    message: "Product Not available",
                  })
            })
        }
        else{
            response.status(401).send({
                message: "Wrong credentials",
              })   
        }
    })
    .catch(()=>{
        response.status(400).send({
            message: "Bad Request",
          })
    })

}

}


const prodPut = async(request,response)=>{
    const id = Number(request.params.id);
    console.log(id)
   if (!request.headers.authorization){
     response.status(400).send({
       message:"No Auth",
   });
   }

   else if(!id || typeof id === "string"){
    response.status(400).send({message:"invalid Id"})
   }

   else{
        const encodedToken = request.headers.authorization.split(" ")[1];
        const {name,description,sku,manufacturer,quantity,date_added,date_last_updated,owner_user_id} = request.body;
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        if (date_added || date_last_updated || owner_user_id){
            response.status(400).send({
                message: "Invalid entry date updated || date added || owner_user_id",
              })
        }
       else if ( !productPostValidation(name,description,sku,manufacturer,quantity)){
            response.status(400).send({
                message: "Please add all details ",
              });}

       else if(name===""|| description === "" || sku === "" || manufacturer === "" || quantity === "" || typeof quantity === 'string' || quantity <=0 || quantity>100 ){
            response.status(400).send({
                message: "Invalid entry",
              })
        }
        else{
        User.findOne({
            where: {
              username: decodedUsername,
            },
          })
        .then(
            async (user)=>{
            const valid = await bcrypt.compare(decodedPassword,user.getDataValue("password")) 
           if(valid===true && decodedUsername === user.getDataValue("username")){
            Product.findOne({
                where:{
                    id:id,
                },
            })
            .then(
                async (product)=>{
                    if (!product){
                        response.status(404).send({
                            message: "Product Not available",
                          })
                    }
                    else if (product.getDataValue("owner_user_id")!== user.getDataValue("id")){
                        response.status(403).send({
                            message: "Unauthorized access",
                          })}
                    else{
                    if(product.getDataValue("owner_user_id")===user.getDataValue("id")){
                            product.update(
                                {
                                   name:name,
                                   description:description,
                                   sku:sku,
                                   manufacturer:manufacturer,
                                   quantity:quantity,
                                   date_last_updated: new Date()
                                }
                            )
                            .then((result) => {
                                response.status(204).send({
                                    });
                              })
                            .catch(() => {
                                response.status(400).send({
                                  message: "Bad Request. Incorrect inputs for Update",
                                });
                              })
                    }else{response.status(400).send({
                        message: "Invalid product Id",
                      });}
                }
            }
            )

            } else{response.status(401).send({
                message: "Invalid Password",
              });

            }}
        )
   }}
    
}

module.exports = {prodPost,prodGet,prodPatch,prodDelete,prodPut}