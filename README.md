# assignment-1-AbhilashGade Network Structures and Cloud computing


## Goal
<span style="background-color: #FFFF00">The main goal of this assignment is to build a APIs for an User to register and retreive his details using Node.js</span>

## Features
* As a developer, I am able to create new account by providing the following fields as an input
    * Email Address
    * Password
    * First Name
    * Last Name
* As a developer, I am able to get a particular user after the user has entered his credentials by      implementing basic auth
* As a developer, I am able to edit a particular user after the user has entered his credentials by      implementing basic auth


## Requirements
* Node.js
  * express.js
* Sequelize
* Base-64
* Bcrypt js
* Jest
* Supertest
* Postman- Recommended for Testing

## Implementation
  

  ### APIs

  Available APIs in the project:
  This is built using REST API and appropriate conventions
  
  ### How to use

    Run: Node listener.js
    Test: 


  *Retreive neccesary user details by id*:
   ```sh
    GET /v1/user/:id
    

  * Create a user *:
   
    POST /v1/user
    
    
  * Update a todo-item by id *:
   
    PUT /v1/user/:id
   

  * Health Check *:
   
    GET /healthz