/* 
    Chess game classes
*/
import React, { Component } from "react";

export default class Game extends Component {
  constructor() {
    super();
    this.board = new Board();
    this.colors = ["W", "B"];
    this.initialize();
  }

  initialize() {
    var row = 0;
    var rowpawn = 1;
    for (var color of this.colors) {
      if (color == "B") {
        row = 7;
        rowpawn = 6;
      }
      this.board.rows[row][0].setPiece(new Rook(color));
      this.board.rows[row][1].setPiece(new Knight(color));
      this.board.rows[row][2].setPiece(new Bishop(color));
      this.board.rows[row][3].setPiece(new Queen(color));
      this.board.rows[row][4].setPiece(new King(color));
      this.board.rows[row][5].setPiece(new Bishop(color));
      this.board.rows[row][6].setPiece(new Knight(color));
      this.board.rows[row][7].setPiece(new Rook(color));
      for (var j = 0; j < 8; j++) {
        this.board.rows[rowpawn][j].setPiece(new Pawn(color));
      }
    }
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
      s += this.colnames[j] + " " + sep;
    }
    s += "\n";
    // board
    for (i = 7; i >= 0; i--) {
      s += this.rownames[i] + sep;
      for (j = 0; j < 8; j++) {
        var piece = this.rows[i][j].piece;
        if (piece == null) s += "  " + sep;
        else s += piece.getName() + sep;
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
  setPiece(piece) {
    this.piece = piece;
    piece.position = this;
  }
}

class Piece {
  constructor(color) {
    this.color = color;
    this.position = null;
    this.name = "";
  }

  //function to move from one square to another
  move(to) {}

  getMoves() {}

  getName() {
    return this.name + this.color.toLowerCase();
  }
}

class King extends Piece {
  constructor(color) {
    super(color);
    this.hasMoved = false;
    this.name = "K";
  }
}

class Queen extends Piece {
  constructor(color) {
    super(color);
    this.name = "Q";
  }
}

class Rook extends Piece {
  constructor(color) {
    super(color);
    this.hasMoved = false;
    this.name = "R";
  }
}

class Bishop extends Piece {
  constructor(color) {
    super(color);
    this.name = "B";
  }
}

class Knight extends Piece {
  constructor(color) {
    super(color);
    this.name = "N";
  }
}

class Pawn extends Piece {
  constructor(color) {
    super(color);
    this.hasMoved = false;
    this.name = "P";
  }
}
