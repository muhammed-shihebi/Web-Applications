// jshint esversion:6

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.listen(process.evn.PORT || 3000, function(){
	console.log("Server is running on port 3000");
});


app.get("/", function(req, res){
	res.sendFile(__dirname + "/signup.html");
});


app.post("/", function(req, res){
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const email = req.body.email;

	const data = {
		members:[{
			email_address: email,
			status: "subscribed",
			merg_fiels:{
				FNAME: firstName,
				LNAME: lastName
			}
		}]
	};
	var jData = JSON.stringify(data);

	const url = "https://us17.api.mailchimp.com/3.0/lists/6100a48ff9";

	const options = {
		method: "post",
		auth: "Urhin:58b7436e2d4d3f5bb26e33f8fc4e5e54-us1"
	}

	const request = https.request(url, options, function(response){

		if(response.statusCode === 200){
			response.on("data", function(data){
				console.log(JSON.parse(data));
			});
			res.sendFile(__dirname + "/success.html");
		}else{
			res.sendFile(__dirname + "/falure.html")
		}


	});

	request.write(jData);
	request.end();
});

app.post("/failure", function(req, res){
	res.redirect("/");
})
