/* 
Random Agent

"Anyone who uses arithmetic methods to produce random numbers is in a state of sin."
--- John von Neumann
*/

var engine = require("./../engine");

class RandomAgent {
  constructor() {
    this.game = new engine.Game();
  }

  setGameState(json) {
    this.game.deserializeHistory(json);
  }

  generateMove() {
    let currentPlayer = this.game.players[this.game.turn];
    let moves = currentPlayer.getMoves();
    let randomMove = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: randomMove.piece.square.address,
      to: randomMove.square.address
    };
  }
}

module.exports = { RandomAgent };
