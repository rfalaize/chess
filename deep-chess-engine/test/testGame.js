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

  describe("Serialize", function() {
    it("should deserialize a game from json", function() {
      // generate sample json moves
      let history = [{ from: "e2", to: "e4" }, { from: "e7", to: "e5" }];
      let initialJSON = JSON.stringify(history);
      // deserialize
      game.deserializeHistory(initialJSON);
      // sanity check
      let piece = game.board.getSquareByAddress("e5").piece;
      assert.notEqual(null, piece);
      assert.equal("P", piece.name);
      assert.equal("B", piece.color);
      // serialize
      let finalJSON = game.serializeHistory();
      assert.equal(initialJSON, finalJSON);
    });
  });
});
