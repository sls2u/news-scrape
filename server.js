  var cheerio = require("cheerio");
  var request = require("request");
  var express = require("express");
  var mongojs = require("mongojs");
  var mongoose = require('mongoose');
  var exphbs = require('express-handlebars');

  // Initialize Express
  var app = express();

  // Set the port of our application
  // process.env.PORT lets the port be set by Heroku
  var PORT = process.env.PORT || 3000;

  // Set Handlebars as the default templating engine.
  app.engine("handlebars", exphbs({ defaultLayout: "main" }));
  app.set("view engine", "handlebars");

  // Database configuration
  var databaseUrl = "scraper";
  var collections = ["scrapeData"];


  app.use(express.static("public"));
  // Hook mongojs configuration to the db variable
  var db = mongojs(databaseUrl, collections);
  db.on("error", function(error) {
    console.log("Database Error:", error);
  });
  // Main route (saved page)
  app.get("/saved", function(req, res, err) {
    console.log(err)
     res.render('saved');
  });

  // Main route (home page)
  app.get("/", function(req, res, err) {
    //res.send(index.html);
    console.log(err)
     res.render('index.html');
  });

  // Retrieve data from the db
  app.get("/all", function(req, res) {
    // Find all results from the scrapeData collection in the db
    db.scrapeData.find({}, function(error, found) {
      console.log(found);
      //throw any errors to the console
      if (error) {
        console.log(error);
      }
      //if there are no errors, send the data to the browser
      else {
        res.json(found);
      }
    })
  })

  app.get("/scrape", function(req, res) {
    scrape().then(results => {
      results.forEach(result => {
        db.scrapeData.insert(result)
      })
      res.redirect("/all");
    })
  })


  // First, tell the console what server.js is doing
  console.log("\n***********************************\n" +
    "Grabbing every thread name and link\n" +
    "from nytimes" +
    "\n***********************************\n");


  function scrape(){
    return new Promise ((resolve, reject)=>{
      request("http://nytimes.com/section/health", function(error, response, html){
        var $= cheerio.load(html);
        var results = [];
        $(".story-body").each(function(i, element){
          var title = $(element).find("h2.headline").text().trim();
          var summary = $(element).find("p.summary").text().trim();
          var url = $(element).find("a").attr("href").trim();
          results.push({
            Title: title,
            Summary: summary,
            URL: url
          });
        });
        console.log(results);
        resolve(results);
      })
    })
  }

  // Listen on port 3000
  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
