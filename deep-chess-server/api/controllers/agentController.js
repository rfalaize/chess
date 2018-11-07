"use strict";

var randomAgent = require("@rfalaize/deep-chess-engine/agents/randomAgent");

exports.generateMove = function(req, res) {
  // create the agent
  let agent = new randomAgent.RandomAgent();
  let move = agent.generateMove();
  //let move = { hello: "world" };
  res.json(move);
};
