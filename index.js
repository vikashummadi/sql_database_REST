const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname,"public")));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Vikash@21'
});
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//home page
app.get("/", (req, res) => {
  let q = `select count(*) from user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });

    });
  }
  catch (err) {
    console.log(err);
    res.send("some error in database");
  }

});

//Show user
app.get("/user", (req, res) => {
  let q = `select * from user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      // console.log(result);
      res.render("showuser.ejs", { users });

    });
  }
  catch (err) {
    console.log(err);
    res.send("some error in database");
  }

});

// edit username
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id='${id}'`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      let user = users[0];
      console.log(users[0]);
      res.render("edit.ejs", { user });

    });
  }
  catch (err) {
    console.log(err);
    res.send("some error in database");
  }

})
//update db 
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id='${id}'`;
  let {password: formpass,username: newUsername} = req.body;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      let user = users[0];
      if(formpass!= user.password){
        res.send("Wrong Password");
      }
      else{
        let q2 = `update user set username= '${newUsername}' where id='${id}' `;
          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
        });
        
      }
    });
  }
  catch (err) {
    console.log(err);
    res.send("some error in database");
  }

});

//delete user
app.get("/user/:id/verify",(req,res) => {
  let { id } = req.params;
  let q = `select * from user where id='${id}'`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      let user = users[0];
      console.log(users[0]);
      res.render("verify.ejs", { user });

    });
  }
  catch (err) {
    console.log(err);
    res.send("some error in database");
  }
});   

app.delete("/user/:id/delete" ,(req,res)=>{
  let {id} = req.params;
  let q = `select * from user where id ='${id}'`;
  let{email: formail, password : pass} = req.body;
  try{
    connection.query(q,(err,result)=>{
      if (err) throw err;
      let user = result[0];
      if(formail!=user.email && pass!=user.password){
        res.send("Wrong email or password");
      }
      else{
        let q2 = `delete from user where id = '${id}'`;
        connection.query(q2,(err,result)=>{
          if (err) throw err;
          res.redirect("/user");
        })
      }
  });
  }catch(err){
    console.log(err);
    res.send("some error in database");
  }
  
});

//add new user
app.post("/user/details" ,(req,res)=>{
  res.render("newuser.ejs");
});
app.post("/user/add",(req,res)=>{
  let q = `insert into user (id,username,email,password) values (?)`;
  let {username: fUsername ,email: femail,password: fpass} = req.body;
  let id = uuidv4();
  let newuser = [];
  newuser.push(id);
  newuser.push(fUsername);
  newuser.push(femail);
  newuser.push(fpass);
  try{
    connection.query(q,[newuser],(err,result)=>{
      if(err) throw err;
      res.redirect("/user");
    })
  }
  catch(err){
    console.log(err);
    res.send("Error in database");
  }
});

app.listen("8080", () => {
  console.log("server listening to 8080");
});

