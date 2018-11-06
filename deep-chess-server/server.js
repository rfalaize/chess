var express = require("express"),
  app = express(),
  port = process.env.PORT || 3100;

console.log("Starting chess server...");

app.listen(port);

console.log("Agent RESTful API server started on: " + port);
