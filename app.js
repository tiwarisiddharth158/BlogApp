//order these variables by name
var bodyParser   = require("body-parser"),  
methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose         = require("mongoose"),
express          = require("express"), 
app              = express(); 

// APP CONFIG
//configure mongoose
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url); 
app.set("view engine", "ejs"); 
app.use(express.static("public")); //tells express to serve the public directory
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); 
app.use(methodOverride("_method")); //argument is what it should look for in the url

// MONGOOSE/MODEL CONFIG
//create schema for mongoose (defining a pattern for data)
var blogSchema = new mongoose.Schema({
    title: String, 
    image: String, 
    body: String,
    created: {type: Date, default: Date.now} //says its type date, and it's default is date.now
});

//compile into model so we can use all of mongoose's wonderful methods to interact with mongodb
var Blog = mongoose.model("Blog", blogSchema); 
//mongoose.model(“Name of singular version of our model”, …) – will automatically make a collection of cats in our database. And also, mongo will pluralize Cat into “cats”

// test blog
// Blog.create({
//     title: "Test Blog", 
//     image: "https://source.unsplash.com/VRLHw_rBjIw",
//     body: "HELLO THIS IS A BLOG POST!"
// });

// RESTFUL ROUTES
app.get("/", function(req, res) {
    res.redirect("/blogs"); //conventional to redirect to the index
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
    //retrieving all blogs from DB
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log("ERROR!"); 
        }
        else {
            res.render("index", {blogs: blogs}); 
        }
    });
    
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    //just render the same form over and over - easiest route
    res.render("new"); 
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
    // create blog
    
    //this bottom line basically gets rid of all <script> tags!
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
       if(err) {
           res.render("new"); 
       } else {
           // then, redirect to the index
           res.redirect("/blogs");
       }
    });
    
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog) { //2 params: id, and callback
       if (err) {
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog}); //inside the show template, foundBlog is equal to blog
       }
   });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs"); 
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
}); 

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
    //this bottom line basically gets rid of all <script> tags!
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // Use req.body to see everything that is in the input
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
       if (err) {
           res.redirect("/blogs"); 
       } else {
           res.redirect("/blogs/" + req.params.id)
       }
   });
});

// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res) {
   //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
      if (err) {
          console.log(err); 
          res.redirect("/blogs"); 
      } else {
          res.redirect("/blogs"); 
      }
  });
    // Blog.findById(req.params.id, function(err, blog) {
    //     if(err) {
    //         console.log(err); 
    //     } else {
    //         blog.remove();
    //         res.redirect("/blogs"); 
    //     }
    // });
});
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("SERVER IS RUNNING!"); 
});
