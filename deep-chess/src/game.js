/* 
    Chess game classes
*/
import React, { Component } from "react";

export default class Game extends Component {
  constructor() {
    super();
    this.board = new Board();
  }

  initialize() {
    //white
    this.board.rows[0][0].setPiece(new Rook("W"));
    var j;
    for (j = 0; j < 8; j++) {
      this.board.rows[1][j].setPiece(new Pawn("W"));
    }
    //black
  }

  render() {
    return <div>Sss</div>;
  }
}

export class Board {
  constructor() {
    this.rownames = ["1", "2", "3", "4", "5", "6", "7", "8"];
    this.colnames = ["a", "b", "c", "d", "e", "f", "g", "h"];
    this.rows = new Array(8);
    var i, j;
    for (i = 0; i < 8; i++) {
      this.rows[i] = new Array(8);
      for (j = 0; j < 8; j++) {
        this.rows[i][j] = new Square(this, i, j);
      }
    }
  }

  print() {
    var i, j;
    var sep = " | ";
    var s = " " + sep;
    // columns
    for (j = 0; j < 8; j++) {
      s += this.colnames[j] + sep;
    }
    s += "\n";
    // board
    for (i = 0; i < 8; i++) {
      s += this.rownames[i] + sep;
      for (j = 0; j < 8; j++) {
        s += " " + sep;
      }
      s += "\n";
    }
    console.log(s);
  }
}

class Square {
  constructor(board, i, j) {
    this.board = board;
    this.i = i;
    this.j = j;
    this.address = board.colnames[j] + board.rownames[j];
    this.piece = null;
  }
  setPiece(piece) {}
}

class Piece {
  color;
  position;

  //function to move from one square to another
  move(to) {}

  getMoves() {}
}

class King extends Piece {}

class Queen extends Piece {}

class Rook extends Piece {}

class Bishop extends Piece {}

class Knight extends Piece {}

class Pawn extends Piece {}
