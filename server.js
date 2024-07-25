/********************************************************************************* 
* WEB700 – Assignment 05 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students. 
* 
* Name: Sampavi Shanthakumar 
* Student ID: 147633234 
* Date: 25th July 2024 
* 
* Online (Heroku) Link: ________________________________________________________ 
* 
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const collegeData = require("./modules/collegeData");
const path = require("path");
const exphbs = require("express-handlebars");

// Middleware to set active route for navigation highlighting
app.use(function(req,res,next){ 
    let route = req.path.substring(1); 
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, "")); 
    next(); 
});

// Adding the static middleware to serve files from the directory named public
app.use(express.static(path.join(__dirname, 'public')));

// Adding body-parser middleware
app.use(express.urlencoded({ extended: true }));

// Setting up Handlebars as the view engine with custom helpers
app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
    navLink: function(url, options){ 
    return '<li' + 
    ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
    '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'; 
    },
    equal: function (lvalue, rvalue, options) { 
        if (arguments.length < 3) 
        throw new Error("Handlebars Helper equal needs 2 parameters"); 
        if (lvalue != rvalue) { 
        return options.inverse(this); 
        } else { 
        return options.fn(this); 
        } 
       } 
    } 
}));
app.set('view engine', '.hbs');

// Route to handle the students data
app.get("/students",(req,res)=>{
    var course = req.query.course;
        if(course){
            collegeData.getStudentsByCourse(course).then((students) => {
                res.render("students", {students: students});
            }).catch((err) => {
                res.render("students", {message: "no results"});
            });
        }else{
            collegeData.getAllStudents().then((students) => {
                res.render("students", {students: students});
            }).catch((err) => {
                res.render("students", {message: "no results"});
            });
        }
    });

// Route to handle the courses data
app.get("/courses",(req,res)=>{
    collegeData.getCourses().then((courses) => {
        res.render("courses", {courses: courses});
    }).catch((err) => {
        res.render("courses", {message: "no results"});
    });
});

// Route to handle displaying a course by its ID
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
      .then((data) => {
        res.render("course", { course: data });
      })
      .catch((err) => {
        res.render("course", { message: err });
      });
  });

// Route to handle the specific student by the student number
app.get("/student/:num",(req,res)=>{
    var studentNum = req.params.num;
    Promise.all([
        collegeData.getStudentByNum(studentNum),
        collegeData.getCourses()
    ]).then(([student, courses]) => {
        res.render("student", { student: student, courses: courses });
    }).catch((err) => {
        res.render("students", {message: "no results"});
    });
});

// Route to handle the home page
app.get("/",(req,res)=>{
    res.render("home");
});

// Route to handle the about page
app.get("/about",(req,res)=>{
    res.render("about");
});

// Route to handle the htmlDemo page
app.get("/htmlDemo",(req,res)=>{
    res.render("htmlDemo");
});

// Route to handle the addStudent page
app.get("/students/add",(req,res)=>{
    res.render("addStudent");
});

// Route to handle adding a new student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
      .then(() => {
        res.redirect('/students');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error adding student');
    });
});

// Route to handle updating an existing student
app.post("/student/update", (req, res) => { 
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error updating student");
        });
});
  
// Error handling middleware
app.use((req,res)=>{
    res.status(404).send("Page Not THERE, Are you sure of the path?");
});

// setup http server to listen on HTTP_PORT
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT,()=>{
        console.log("server listening on port:" + HTTP_PORT);
    });
}).catch((err) => {
        console.error("Failed to initialize the data", err);
});
    

