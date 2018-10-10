import Game from "./game";

console.log("Start...");

var game = new Game();
game.board.print();
console.log(game.board.getSquareByAddress("b2").piece.getMoves()[0].address);

console.log("End");
