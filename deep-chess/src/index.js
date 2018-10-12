import React from "react";
import ReactDOM from "react-dom";
//import "bootstrap/";
import BoardComponent from "./components/boardComponent";

console.log("Start...");

/*
var game = new Game();
game.board.print();
console.log(game.board.getSquareByAddress("e1").piece.getMoves());
*/

ReactDOM.render(<BoardComponent />, document.getElementById("root"));

console.log("End");
