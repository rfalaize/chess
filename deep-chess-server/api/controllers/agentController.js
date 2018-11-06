"use strict";

var randomAgent = require("@rfalaize/deep-chess-engine/agents/randomAgent");

exports.generateMove = function(req, res) {
  // create the agent
  let agent = randomAgent.randomAgent();
  let move = agent.generateMove();
  res.json(move);
};

generateMove;
