import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
//import BoardComponent from "./components/boardComponent";
import LoginComponent from "./components/loginComponent";

console.log("Start...");

/*
var game = new Game();
game.board.print();
console.log(game.board.getSquareByAddress("e1").piece.getMoves());
*/

ReactDOM.render(<LoginComponent />, document.getElementById("root"));

console.log("End");
