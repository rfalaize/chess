/*
Serve app from build folder using express and nodejs
Command to start the app: node server.js 
*/

"use strict";

const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server listening on port ", PORT, "...");
});

module.exports = app;
