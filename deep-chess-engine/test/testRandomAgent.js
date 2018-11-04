var assert = require("assert");
var engine = require("../engine");
var RandomAgent = require("../agents/randomAgent").RandomAgent;

describe("Agents", function() {
  describe("RandomAgent", function() {
    let agent = new RandomAgent();
    it("should generate a random move", function() {
      let move = agent.generateMove();
      assert.notEqual(null, move);
      assert.notEqual("", move.from);
      assert.notEqual("", move.to);
    });
  });
});
