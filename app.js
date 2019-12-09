const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const expressSanitizer = require("express-sanitizer");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useFindAndModify", false);

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBrFi9RbJN0vqYeaTXtUtHvVIpTzuCBWFf1k2HIQsM-3jSCUICxg&s",
// 	body: "I'm just testing the index page man. Chill."
// });

//INDEX
app.get("/", (req, res) => {
	res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
	Blog.find({}, (err, blogs) => {
		if(err){
			console.log("ERROR!");
		} else {
			res.render("index", {blogs: blogs});
		};
	});
});

//NEW
app.get("/blogs/new", (req, res) => {
	res.render("new");
});

//CREATE
app.post("/blogs", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err, blogs) => {
		if(err){
			res.render("new");
		} else {
			res.redirect("/");
		};
	});
});

//SHOW
app.get("/blogs/:id", (req, res) => {
	Blog.findById(req.params.id, (err, blog) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: blog});
		};
	});
});

//EDIT
app.get("/blogs/:id/edit", (req, res) => {
	Blog.findById(req.params.id, (err, blog) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: blog});
		};
	});
});

//UPDATE
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, blog) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		};
	});
});

//DESTROY
app.delete("/blogs/:id", (req, res) => {
	Blog.findByIdAndRemove(req.params.id, err => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/");
		};
	});
});

app.listen(process.env.PORT || 3000, () => {
	console.log("SERVER STARTED!");
});