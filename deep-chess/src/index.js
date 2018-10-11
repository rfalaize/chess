import Game from "./game";

console.log("Start...");

var game = new Game();
game.board.print();
console.log(game.board.getSquareByAddress("e1").piece.getMoves());

console.log("End");
