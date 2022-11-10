require('dotenv').config();
require("./src/database/connect")
const express = require("express");
const path = require("path");
const app = express();
const port = 8080;
const morgan = require("morgan");
const { create } = require("domain");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Userdb = require("./src/models/signup");
const auth = require("./src/middleware/auth")

// log request in console and type of request
// app.use(morgan("tiny"));


//  in place of body-parser we use express.json and express.urlencoded
// app.use(express.json());
// app.use(express.urlencoded()); //Parse URL-encoded bodies
// above code giving thsi message in console body-parser deprecated undefined extended: provide extended option
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
// for using cookie parser as middelware as a function
app.use(cookieParser());

// set view engin
app.set("view engine","ejs"); // set  the template engine as pug
// app.set("views", path.resolve(__dirname, "views")); // set the views directory

// load assets
app.use('/css',express.static(path.resolve(__dirname,"assets/css")));
app.use('/img',express.static(path.resolve(__dirname,"assets/img")));
app.use('/js',express.static(path.resolve(__dirname,"assets/js")));


// ENDPOINTS

// app.get("/", (req, res) => {
//   res.render("index");
// });

app.get("/", (req, res) => {
  // make a get request to /api/users using axios
  axios.get('http://localhost:8080/api/users')
    .then(function(response){
      const all_users = response.data
      res.render("index",{users:all_users})
    })
    .catch(err =>{
      res.send(err)
    })
});

app.get("/update-user", (req, res) => {
  axios.get('http://localhost:8080/api/users',{params:{id:req.query.id}})
    .then(function(userdata){
      res.render('update_user',{user:userdata.data})
      
    })
    .catch(err =>{
        res.send(err)
    })

});


app.get("/sign_up", (req, res) => {
  // const params = {};
  res.render("sign_up");
});

// auth is middleware
app.get("/secret", auth, (req, res) => {
  // console.log(`this is the cookie =====>>>>>> ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/logout", auth, async(req,res)=>{

  try {
    // // for deleting current token from database also
    // console.log(req.singleUser);
    
    // req.singleUser.tokens = req.singleUser.tokens.filter((currentElement)=>{
    //   return currentElement.token != req.token
    // })


    // for deleting current token from database also
    req.singleUser.tokens = []


    // for deleting cookie from browser only
    res.clearCookie("jwt");
    
    console.log("Log Out Sucessfully");
    
    await req.singleUser.save();
    res.render("sign_in");
  } catch (error) {
    res.status(500).send(err) 
    
  }
})

// app.get("/update_user", (req, res) => {
//   // const params = {};
//   res.render("update_user");
// });

app.get("/sign_in", (req, res) => {
  const params = {};
  res.status(200).render("sign_in", params);
});


//  for signup
app.post("/sign_in", async (req, res) => {
  try {

    const email = req.body.semail;
    const password = req.body.spassword
    // console.log(`${email} and pass ${password}`);

    const useremail = await Userdb.findOne({email:email});

    // to check bcript password in sign in page
    const isMatch = await bcrypt.compare(password, useremail.password);

    // generate new token when signing this is called middelware
    const token =  await useremail.generateAuthToken();
    console.log(`generating token when signin ${token}`);

    //for generating token during signup 
    res.cookie("jwt", token, {
      expires:new Date(Date.now()+600000),
      httpOnly:true
  
    });


    // if(useremail.password === password){
      if(isMatch){
      res.status(201).redirect("secret")
    }else{
      res.send("Invalid Signin details")
    }

  } catch (error) {
    res.status(400).send("invalid signup details")
    
  }
});



// app.get("/contact", (req, res) => {
//   // const params = {}
//   res.status(200).render("contact");
// });



// start the serverwind
app.listen(port, () => {
  console.log(
    `the application started successfully on http://localhost:${port}`
    );
});





// create and save new users
// post api

app.post("/api/users", async (req, res) => {
  // validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be Empty" });
    return;
  }
  // creating new user
  const user = new Userdb({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: req.body.password,
  });

  const token =  await user.generateAuthToken();
  // console.log(`req.body  ======> ${token}`);

  // cookies
  res.cookie("jwt", token, {
    expires:new Date(Date.now()+600000),
    httpOnly:true
  }); 

  // Save user in database
  try {
    user.save(user).then((data) => {
      // res.send(data);
      res.redirect('/sign_in') // redirect the user in same page after sucessfully saving the new user
    });
  } catch (error) {
    res.status(500).send({
      message: error.meaasge || "Some error occured while creating new user",
    });
  }
});

// find all users api
app.get("/api/users", (req, res) => {
  if (req.query.id) {
    const id = req.query.id
    Userdb.findById(id)
    .then(data => {
        if (!data) {
          res.status(400).send({ message: `not found user with id = ${id}` });
        } else {
          res.send(data);
        }
      })
      .catch(err => {
        res
        .status(500)
        .send({ message: `error retrievind user with id = ${id}` });
      });
    } else {
    Userdb.find()
      .then(user => {
        res.send(user);
      })
      .catch(err => {
        res
        .status(500)
          .send({
            message:err.message || "Error occurred while retriving user information",
          });
      });
    }
});

// update existing users api
app.put("/api/users/:id", (req, res) => {
  if (!req.body) {
    return res
        .status(400)
        .send({ message: "Data to update can not be empty" })
      }
      
      const id = req.params.id;
Userdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
.then(data => {
  if (!data) {
            res.status(404).send({ message: `Cannot Update user with ${id}. Maybe user not found` })
        } else {
            res.send(data)
        }
    })
    .catch(err => {
      res.status(500).send({ message: "Error update user Information" })
    })

  });


  // Delete api
  app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;
  Userdb.findByIdAndDelete(id)
  .then((data) => {
    if (!data) {
      res
      .status(404)
      .send({ message: `Cannot Delete with id ${id}.Maybe id is wrong` });
    } else {
        res.send({
          message: "User was deleted successfully",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Could not delete user with id => ${id}`,
      });
    });
});
