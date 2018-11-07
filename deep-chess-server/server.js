var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  port = process.env.PORT || 3100;

console.log("Starting chess server...");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require("./api/routes/agentRoutes"); //importing routes
routes(app); //register the routes

app.listen(port);

console.log("Agent RESTful API server started on: " + port);
