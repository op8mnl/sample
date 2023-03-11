import { createRequire } from "module";
const require = createRequire(import.meta.url);
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "./schema/user.js";
import Outline from "./schema/outline.js";
const PdfParse = require('pdf-parse')
import fileUpload from 'express-fileupload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.json());
app.use(fileUpload());

//connecting to mongoDB
const username = "username goes here";
const password = "cluster password here";
const cluster = "cluster name/id";

mongoose.connect(
	`mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
	console.log("Connected successfully");
});

//middleware for logging
app.use((req, res, next) => {
	console.log(`${req.method} request for ${req.url}`);
	next();
});

// Endpoints ==================

router.route("/signUp")
.post(async (req, res) => {
	const data = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.pswrd,
		position: req.body.psn,
	});
	res.send(data);
	data.save(function (err, result) {
		if (err) {
			console.log(err)
		}else{
			console.log("Successfully Signed Up")
		}
	});
})

router.route("/login")
.post(async (req, res) => {
	try{
		const account = await User.find({ email: req.body.email},function (err, user) {
			if (err) {
				throw new Error("Account not found");
			}
		}).clone();
		if (account[0].password == req.body.pswrd) {
			res.send([true, account[0]]);
			console.log("Successfully logged in")
		}
		else {
			res.send(false,"Password is incorrect");
			console.log("Failed to log in")
		}
	}catch (err){
		res.status(404).send(false)
		console.log("Failed to login")
	}
})

router.route("/converter")
.post((req, res) => {
	
	if (!req.files && !req.files.pdfFile) {
		res.status(400);
		res.end();
	}
	PdfParse(req.files.pdfFile).then(result => {
		res.send(result.text);
	});
})

router.route("/createOutline")
.post(async (req,res) => {
	const data = new Outline({
		author: req.body.author,
		dateModified: req.body.date,
		outlineBody: req.body.outline,
		courseCode: req.body.code,
		courseName: req.body.name,
	});
	
	data.save(function (err, result) {
		if (err) {
			console.log(err)
		}else{
			console.log("Outline Creation")
		}
	});
	res.send(data)
})

router.route("/saveOutline")
.post(async (req, res) => {
	
	
	try {
		await Outline.updateOne(
	{ _id: req.body._id},
	{
		author: req.body.author,
		dateModified: req.body.date,
		outlineBody: req.body.outline,
		$addToSet: { ga: {$each: req.body.ga}}
	},
	function (err, result) {
	if (err) {
		console.log(err)
	}else{
		console.log("Successfully Updated Outline")
	}}
	);
	}
	catch {
		console.log("Unsuccesful")
	}
	
});

router.route("/addComment")
.post(async (req, res) => {
	var commentObj = {
		author: req.body.author,
		body: req.body.body,
		date: req.body.date,
	}
	
	try {
		await Outline.updateOne(
		{ _id: req.body._id },
		{

			$addToSet: { comments: commentObj}
		},
		function (err, result) {
			if (err) {
				console.log(err)
			}else{
				console.log("Commented Succesfully")
			}}
			)
	}
	catch {
		console.log("Unsuccesful")
	}
	
})

router.route("/:id/deleteComment")
.delete(async ( req, res) => {
	db.Outline()
})

router.route("/getComments/:_id")
.get(async (req, res) => {
	const outline = await Outline.find({_id: req.params._id});
	const allComments = outline[0].comments;
	res.send(allComments)

})

router.route("/userOutlines/:id")
.get(async (req, res) => {
	var outlineObj = await Outline.find( {author: req.params.id},function(err, result) {
		if (err) {
			console.log(err)
		}
	}).clone();
	res.send(outlineObj)
	}

)

router.route("/:id").
get(async ( req, res) => {
	getOutline})

// ==========

app.use("/api",router);

app.get("*", async (req, res) => {
	res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
