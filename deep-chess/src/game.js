/* 
    Chess engine
*/

export class Game {
  constructor() {
    this.board = new Board();
    this.colors = ["W", "B"];
    this.initialize();
  }

  initialize() {
    var row = 0;
    var rowpawn = 1;
    for (var color of this.colors) {
      if (color === "B") {
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

  getSquareByAddress(address) {
    return this.rows[this.rownames.indexOf(address.charAt(1))][
      this.colnames.indexOf(address.charAt(0))
    ];
  }

  print() {
    var i, j;
    var sep = " | ";
    var s = " " + sep;
    // columns
    for (j = 0; j < 8; j++) {
      s = s + this.colnames[j] + " " + sep;
    }
    s = s + "\n";
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
  }
}

export class Square {
  constructor(board, i, j) {
    this.board = board;
    this.row = i;
    this.column = j;
    this.address = board.colnames[j] + board.rownames[i];
    this.piece = null;
  }
  setPiece(piece) {
    this.piece = piece;
    piece.square = this;
  }
  getAdjacentSquare(rowOffset, colOffset) {
    var adjRow = this.row + rowOffset;
    var adjCol = this.column + colOffset;
    if (adjRow >= 0 && adjRow <= 7 && adjCol >= 0 && adjCol <= 7) {
      return this.board.rows[adjRow][adjCol];
    }
  }
}

export class Piece {
  constructor(color) {
    this.color = color;
    this.square = null;
    this.name = "";
    this.hasMoved = false;
  }

  //function to move from one square to another
  move(targetSquare) {
    if (targetSquare == null) return;
    const previousSquare = this.square;
    targetSquare.setPiece(this);
    previousSquare.piece = null;
    this.hasMoved = true;
    console.log("Piece moved");
    return true;
  }

  getMoves() {}

  getName() {
    return this.name + this.color.toLowerCase();
  }
}

export class King extends Piece {
  constructor(color) {
    super(color);
    this.name = "K";
  }

  getMoves() {
    var moves = [];
    for (var rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (var colOffset = -1; colOffset <= 1; colOffset++) {
        if (Math.abs(rowOffset) === 1 || Math.abs(colOffset) === 1) {
          var adjSquare = this.square.getAdjacentSquare(rowOffset, colOffset);
          if (adjSquare == null) continue;
          if (adjSquare.piece == null || adjSquare.piece.color !== this.color) {
            var isCheck = false;
            // TO DO: verify that king would not be in check
            if (!isCheck) moves.push(adjSquare);
          }
        }
      }
    }
    if (!this.hasMoved) {
      var rook;
      // king side
      if (
        this.square.getAdjacentSquare(0, 1).piece == null &&
        this.square.getAdjacentSquare(0, 2).piece == null
      ) {
        rook = this.square.getAdjacentSquare(0, 3).piece;
        if (!rook.hasMoved) moves.push(this.square.getAdjacentSquare(0, 2));
      }
      // queen side
      if (
        this.square.getAdjacentSquare(0, -1).piece == null &&
        this.square.getAdjacentSquare(0, -2).piece == null &&
        this.square.getAdjacentSquare(0, -3).piece == null
      ) {
        rook = this.square.getAdjacentSquare(0, -4).piece;
        if (!rook.hasMoved) moves.push(this.square.getAdjacentSquare(0, -2));
      }
    }
    return moves;
  }

  move(targetSquare) {
    const previousSquare = this.square;
    const hasMoved = super.move(targetSquare);
    if (hasMoved && previousSquare != null && targetSquare != null) {
      if (Math.abs(previousSquare.column - targetSquare.column) === 2) {
        // castle
        if (targetSquare.column === 6) {
          // king side
          let rook = this.square.board.rows[targetSquare.row][7].piece;
          rook.move(this.square.board.rows[targetSquare.row][5]);
        } else if (targetSquare.column === 2) {
          // queen side
          let rook = this.square.board.rows[targetSquare.row][0].piece;
          rook.move(this.square.board.rows[targetSquare.row][3]);
        }
      }
    }
  }
}

export class Queen extends Piece {
  constructor(color) {
    super(color);
    this.name = "Q";
  }

  getMoves() {
    var moves = [];
    for (let rowDirection of [-1, 0, 1]) {
      for (let colDirection of [-1, 0, 1]) {
        for (let offset = 1; offset < 8; offset++) {
          var adjSquare = this.square.getAdjacentSquare(
            rowDirection * offset,
            colDirection * offset
          );
          if (adjSquare == null) break;
          if (adjSquare.piece != null) {
            if (adjSquare.piece.color !== this.color) {
              moves.push(adjSquare);
            }
            break;
          }
          moves.push(adjSquare);
        }
      }
    }

    return moves;
  }
}

export class Rook extends Piece {
  constructor(color) {
    super(color);
    this.name = "R";
  }

  getMoves() {
    var moves = [];
    for (let direction of [-1, 1]) {
      for (let rowcol of [0, 1]) {
        for (let offset = 1; offset < 8; offset++) {
          var adjSquare = null;
          if (rowcol === 0) {
            adjSquare = this.square.getAdjacentSquare(direction * offset, 0);
          } else {
            adjSquare = this.square.getAdjacentSquare(0, direction * offset);
          }
          if (adjSquare == null) break;
          if (adjSquare.piece != null) {
            if (adjSquare.piece.color !== this.color) {
              moves.push(adjSquare);
            }
            break;
          }
          moves.push(adjSquare);
        }
      }
    }
    console.log(moves);
    return moves;
  }
}

export class Bishop extends Piece {
  constructor(color) {
    super(color);
    this.name = "B";
  }

  getMoves() {
    var moves = [];
    for (let rowDirection of [-1, 1]) {
      for (let colDirection of [-1, 1]) {
        for (let offset = 1; offset < 8; offset++) {
          var adjSquare = this.square.getAdjacentSquare(
            rowDirection * offset,
            colDirection * offset
          );
          if (adjSquare == null) break;
          if (adjSquare.piece != null) {
            if (adjSquare.piece.color !== this.color) {
              moves.push(adjSquare);
            }
            break;
          }
          moves.push(adjSquare);
        }
      }
    }

    return moves;
  }
}

export class Knight extends Piece {
  constructor(color) {
    super(color);
    this.name = "N";
  }

  getMoves() {
    var moves = [];
    var offsets = [
      [2, 1],
      [1, 2],
      [-1, 2],
      [-2, 1],
      [-2, -1],
      [-1, -2],
      [1, -2],
      [2, -1]
    ];
    for (var i = 0; i < offsets.length; i++) {
      var adjSquare = this.square.getAdjacentSquare(
        offsets[i][0],
        offsets[i][1]
      );
      if (adjSquare == null) continue;
      if (adjSquare.piece != null && adjSquare.piece.color === this.color)
        continue;
      moves.push(adjSquare);
    }
    return moves;
  }
}

export class Pawn extends Piece {
  constructor(color) {
    super(color);
    this.name = "P";
  }

  getMoves() {
    var moves = [];

    var adjSquare;
    var rowOffset = 1; //white pawns move by rows ascending
    if (this.color === "B") rowOffset = -1; //black pawns move by rows descending

    adjSquare = this.square.getAdjacentSquare(rowOffset, 0);
    var canMoveForward = false;
    // check if move is on board, and if no piece is blocking
    if (adjSquare != null && adjSquare.piece == null) {
      moves.push(adjSquare);
      canMoveForward = true;
    }

    // capture
    for (let colOffset of [-1, 1]) {
      adjSquare = this.square.getAdjacentSquare(rowOffset, colOffset);
      if (
        adjSquare != null &&
        adjSquare.piece != null &&
        adjSquare.piece.color !== this.color
      ) {
        moves.push(adjSquare);
      }
    }

    // TO DO: en passant

    // move by 2 squares is allowed on first move
    if (canMoveForward && this.hasMoved === false) {
      adjSquare = this.square.getAdjacentSquare(rowOffset * 2, 0);
      if (adjSquare != null && adjSquare.piece == null) moves.push(adjSquare);
    }

    return moves;
  }
}
