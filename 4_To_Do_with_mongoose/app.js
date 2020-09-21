// =========================================================== INIT

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); 
mongoose.set('useFindAndModify', false);
const app = express();
app.set('view engine', 'ejs');

// this is to make body parser do stuff in the code
app.use(bodyParser.urlencoded({ extended: true }));

// this is for sending static files using express
app.use(express.static("public"));

// this is for heruku
let port = process.env.PORT; 
if(port == null || port == ""){
	port = 3000; 
}

app.listen(port, function () {
	console.log("Server started on port 3000");
});

// =========================================================== DATABASE 

mongoose.connect("mongodb+srv://admin-nour:toPCUuIZTtw3aljE@cluster0.edkcc.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
	name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = Item({ name: "Welcome to the ToDo list App" });
const item2 = Item({ name: "<-- use this box to delete items" });
const item3 = Item({ name: "use the + sign to add items" });

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log("All Items were added successfully");
// 	}
// });

const listSchema = {
	name: String,
	items: [itemsSchema] // this is list containing items
}

const List = mongoose.model("List", listSchema);


// =========================================================== 

app.get("/", function (req, res) {
	Item.find(function (err, todos) {
		if (err) {
			console.log(err);
		} else {
			if (todos.length === 0) {
				Item.insertMany(defaultItems, function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log("All Items were added successfully");
					}
				})
				res.redirect("/");
			} else {
				res.render("list", {
					listTitle: "Today",
					newListItems: todos
				});
			}
		}
	});
});

app.post("/", function (req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;
	const item = Item({ name: itemName });

	if (listName === "Today") {
		item.save();
		res.redirect("/");
	} else {
		List.findOne({ name: listName }, function (err, foundList) {
			if (!err) {
				foundList.items.push(item);
				foundList.save();
				res.redirect("/" + listName);
			}
		})
	}
});


app.get("/about", function (req, res) {
	res.render("about");
});

app.post("/delete", function (req, res) {
	const checkedItemId = new mongoose.mongo.ObjectID(req.body.checkbox);
	const listName = req.body.listName.slice(0, req.body.listName.length -1);

	if (listName === "Today") {
		Item.findByIdAndRemove(checkedItemId, function (err) {
			if (err) {
				console.log(err);
			} else {
				res.redirect("/");
			}
		});
	} else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
			if (!err) {
				res.redirect("/" + listName);
			}
		});
	}
});



app.get("/:listType", function (req, res) {
	const _listType = req.params.listType;
	if(_listType === "favicon.ico"){
		return; 
	}
	const listType= _.startCase(_.toLower(_listType));

	List.findOne({ name: listType }, function (err, foundList) {
		if (!err) {
			if (foundList === null) {
				const list = new List({
					name: listType,
					items: defaultItems
				});
				list.save();
				res.render("list", {
					listTitle: listType,
					newListItems: defaultItems
				});
			} else {
				res.render("list", {
					listTitle: foundList.name,
					newListItems: foundList.items
				});
			}
		}
	});
});