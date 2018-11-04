var assert = require("assert");
var engine = require("../engine");

describe("Engine", function() {
  let game = new engine.Game();
  describe("Game", function() {
    it("should initialize a new game", function() {
      assert.equal(2, game.colors.length);
      assert.equal(8, game.board.rows.length);
      assert.equal(8, game.board.rows[0].length);
    });

    it("should generate available player moves", function() {
      assert.equal(20, game.players["W"].getMoves().length);
    });

    it("should generate available e2 pawn moves", function() {
      let pawn = game.board.getSquareByAddress("e2").piece;
      assert.equal("P", pawn.name);
      let moves = pawn.getMoves();
      assert.equal(2, moves.length);
      assert.equal("e3", moves[0].address);
      assert.equal("e4", moves[1].address);
    });
  });
});
