/* 
    Chess engine
*/

class Game {
  constructor() {
    this.colors = ["W", "B"];
    this.players = {
      W: new Player(this, "W", "White"),
      B: new Player(this, "B", "Black")
    };
    this.initialize();
  }

  initialize() {
    this.board = new Board(this);
    this.movesHistory = []; // list of tuples: {piece, squareFrom, squareTo}
    this.movesHistoryPgn = {};
    this.turn = ""; // W or B
    this.turnNumber = 0;
    this.ended = false;
    this.endedWinner = "";

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
    this.setNextTurn("W");
  }

  initializeFromPgn(pgn) {
    this.initialize();
    if (pgn === "") return this;
    // TO DO - get correct PGN move
    /* let moves = pgn.split(" ");
    let turn = "W";
    for (let i = 0; i < moves.length; i++) {
      // move
      let move = moves[i];
      if (move.indexOf(".") > -1) continue;
      let player = this.players[turn];
      let playerMoves = player.getMoves();
      for (let playerMove of playerMoves) {
        
        let playerMovePgn = playerMove.piece.getMovePgn(playerMove.square);
        if (move === playerMovePgn) {
          playerMove.piece.move(playerMove.square);
          break;
        }
      }
      if (turn === "W") turn = "B";
      else turn = "W";
    }

    return this;*/
  }

  setNextTurn(color = "W") {
    this.turn = color;
    if (color === "W") this.turnNumber += 1;
    // console.log(this.turnNumber + " - " + this.turn + " to play");
  }

  getMoves() {
    return this.players[this.turn].getMoves();
  }

  getMovesHistoryPgn() {
    let pgn = "";
    let turn = 0;
    for (let key in this.movesHistoryPgn) {
      let turnMoves = this.movesHistoryPgn[key];
      turn++;
      if (pgn === "") pgn += turn + ".";
      else pgn += " " + turn + ".";
      for (let i = 0; i < turnMoves.length; i++) {
        pgn += " " + turnMoves[i];
      }
    }
    return pgn;
  }

  // **********************************************************
  // utility functions to serialize/deserialize history
  // so that processes can communicate between themselves
  // **********************************************************
  serializeHistory() {
    let movesArray = [];
    for (let move of this.movesHistory) {
      movesArray.push({
        from: move.squareFrom.address,
        to: move.squareTo.address
      });
    }
    return JSON.stringify(movesArray);
  }

  deserializeHistory(json) {
    try {
      let movesArray = JSON.parse(json);
      this.initialize();
      for (let move of movesArray) {
        this.playDeserializedMove(move);
      }
    } catch (error) {
      console.error(error);
      throw new error("Incorrect move: ", error);
    }
  }

  playDeserializedMove(move) {
    let squareFrom = this.board.getSquareByAddress(move.from);
    let squareTo = this.board.getSquareByAddress(move.to);
    squareFrom.piece.move(squareTo);
  }
}

class Board {
  constructor(game) {
    this.game = game;
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

  printInConsole() {
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

class Square {
  constructor(board, i, j) {
    this.board = board;
    this.row = i;
    this.column = j;
    this.address = board.colnames[j] + board.rownames[i];
    this.piece = null;
  }

  setPiece(piece) {
    // take piece
    if (this.piece != null && this.piece.color !== piece.color) {
      this.board.game.players[piece.color].capturePiece(this);
    }
    this.piece = piece;
    piece.square = this;
    // update controlled squares
    this.board.game.players[piece.color].squares[this.address] = this;
  }

  getAdjacentSquare(rowOffset, colOffset) {
    var adjRow = this.row + rowOffset;
    var adjCol = this.column + colOffset;
    if (adjRow >= 0 && adjRow <= 7 && adjCol >= 0 && adjCol <= 7) {
      return this.board.rows[adjRow][adjCol];
    }
  }
}

class Piece {
  constructor(color) {
    this.color = color;
    this.square = null;
    this.name = "";
    this.hasMoved = false;
  }

  //function to move from one square to another
  move(targetSquare, simulationMode = false) {
    if (targetSquare == null) return;
    const previousSquare = this.square;
    const takePiece = targetSquare.piece !== null;

    // move
    targetSquare.setPiece(this);
    previousSquare.piece = null;

    // update squares controlled by current player
    const player = this.square.board.game.players[this.color];
    delete player.squares[previousSquare.address];

    // simulation mode: return here
    if (simulationMode) return true;

    // pawn
    let isPawnPromoted = false;
    if (this.name === "P") {
      // promotion
      if (
        (this.color === "W" && this.square.row === 7) ||
        (this.color === "B" && this.square.row === 0)
      ) {
        targetSquare.setPiece(new Queen(this.color));
        isPawnPromoted = true;
      }
      // en passant
      if (
        Math.abs(targetSquare.row - previousSquare.row) === 1 &&
        Math.abs(targetSquare.column - previousSquare.column) === 1 &&
        takePiece === false
      ) {
        // if pawn moves in diagonal on an empty square, it's en passant
        let enPassantSquare = previousSquare.getAdjacentSquare(
          0,
          targetSquare.column - previousSquare.column
        );
        this.square.board.game.players[this.color].capturePiece(
          enPassantSquare
        );
      }
    }

    // update hasMoved state
    this.hasMoved = true;

    // verify if opponent king is in check
    const opponentPlayer = this.square.board.game.players[
      this.color
    ].getOpponent();
    const isCheck = opponentPlayer.isCheck();

    // verify if opponent king is check mate
    let isCheckMate = false;
    if (isCheck) {
      isCheckMate = opponentPlayer.isCheckMate();
    }

    // verify if draw
    let isDraw = false;
    if (!isCheck) {
      let opponentMoves = this.square.board.game.players[this.color]
        .getOpponent()
        .getMoves(true);
      if (opponentMoves.length === 0) isDraw = true;
      if (isDraw) {
        this.square.board.game.ended = true;
        this.square.board.game.endedWinner = "D";
        console.log("Game ended draw.");
        return true;
      }
    }

    // get move in pgn format
    let moveNamePgn = this.getMovePgn(
      previousSquare,
      targetSquare,
      takePiece,
      isCheck,
      isCheckMate,
      isPawnPromoted
    );

    // add move to history
    if (this.color === "W") {
      let turnMoves = [];
      turnMoves.push(moveNamePgn);
      targetSquare.board.game.movesHistoryPgn[
        targetSquare.board.game.turnNumber
      ] = turnMoves;
    } else {
      let turnMoves =
        targetSquare.board.game.movesHistoryPgn[
          targetSquare.board.game.turnNumber
        ];
      if (turnMoves != null) {
        turnMoves.push(moveNamePgn);
      }
    }
    targetSquare.board.game.movesHistory.push({
      piece: this,
      squareFrom: previousSquare,
      squareTo: targetSquare
    });

    // check if game has ended
    if (isCheckMate || isDraw) {
      return true;
    }

    // set next turn number
    let nextTurn = "W";
    if (this.color === "W") nextTurn = "B";
    this.square.board.game.setNextTurn(nextTurn);

    return true;
  }

  getMovePgn(
    previousSquare,
    targetSquare,
    takePiece,
    isCheck,
    isCheckMate,
    isPawnPromoted
  ) {
    let moveNamePgn = "";

    if (this.name === "P") {
      // pawn
      if (takePiece) {
        moveNamePgn =
          previousSquare.board.colnames[previousSquare.column] + "x";
      }
    } else if (
      this.name === "K" &&
      targetSquare.column - previousSquare.column === 2
    ) {
      // castle king side
      moveNamePgn = "O-O";
    } else if (
      this.name === "K" &&
      targetSquare.column - previousSquare.column === -2
    ) {
      // castle queen side
      moveNamePgn = "O-O-O";
    } else {
      moveNamePgn = this.name;
      if (takePiece) moveNamePgn += "x";
    }

    moveNamePgn += targetSquare.address;
    if (isPawnPromoted) moveNamePgn += "=Q";
    if (isCheckMate) moveNamePgn += "#";
    else if (isCheck) moveNamePgn += "+";

    return moveNamePgn;
  }

  canMove(ignoreTurn = false) {
    // check if color is valid
    if (ignoreTurn) return true;
    if (this.color !== this.square.board.game.turn) return false;
    return true;
  }

  getName() {
    return this.name + this.color.toLowerCase();
  }

  simulatedMoveIsCheck(previousSquare, targetSquare) {
    // function to verify if a move would put the king in check
    // return true if in check, false otherwise

    // simulate move
    const backupPiece = targetSquare.piece;
    targetSquare.piece = this;
    previousSquare.piece = null;

    // verify if king would not be in check
    const player = this.square.board.game.players[this.color];
    const isCheck = player.isCheck();

    // rollback move
    targetSquare.piece = backupPiece;
    previousSquare.piece = this;

    return isCheck;
  }

  addValidMove(moves, previousSquare, targetSquare, verifyCheck) {
    // add move to list if valid
    if (verifyCheck) {
      const isCheck = this.simulatedMoveIsCheck(previousSquare, targetSquare);
      if (!isCheck) moves.push(targetSquare);
    } else {
      moves.push(targetSquare);
    }
    return moves;
  }
}

class King extends Piece {
  constructor(color) {
    super(color);
    this.name = "K";
    this.value = 100;
  }

  getMoves(verifyCheck = true, ignoreTurn = false, ignoreCastle = false) {
    var moves = [];
    if (!this.canMove(ignoreTurn)) return moves;
    for (var rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (var colOffset = -1; colOffset <= 1; colOffset++) {
        if (Math.abs(rowOffset) === 1 || Math.abs(colOffset) === 1) {
          var adjSquare = this.square.getAdjacentSquare(rowOffset, colOffset);
          if (adjSquare == null) continue;
          if (adjSquare.piece != null) {
            // stop if we encounter a piece
            if (adjSquare.piece.color === this.color) {
              // friendly piece
              continue;
            } else {
              // opponent piece
              moves = this.addValidMove(
                moves,
                this.square,
                adjSquare,
                verifyCheck
              );
              continue;
            }
          } else {
            moves = this.addValidMove(
              moves,
              this.square,
              adjSquare,
              verifyCheck
            );
          }
        }
      }
    }

    if (!this.hasMoved && !ignoreCastle) {
      var rook;
      // king side
      if (
        this.square.getAdjacentSquare(0, 1).piece == null &&
        this.square.getAdjacentSquare(0, 2).piece == null
      ) {
        rook = this.square.getAdjacentSquare(0, 3).piece;
        if (
          rook != null &&
          rook.name === "R" &&
          rook.color === this.color &&
          !rook.hasMoved
        ) {
          let isValidCastle = true;
          let opponentMoves = this.square.board.game.players[this.color]
            .getOpponent()
            .getMoves(false, true, true); // ignore turn and castle
          const kingSquareStep1 = this.square.getAdjacentSquare(0, 1);
          const kingSquareStep2 = this.square.getAdjacentSquare(0, 2);
          for (let opponentMove of opponentMoves) {
            if (
              opponentMove.square.address === this.square.address ||
              opponentMove.square.address === kingSquareStep1.address ||
              opponentMove.square.address === kingSquareStep2.address
            ) {
              // king is in check, or would be in check on the way => invalid move
              isValidCastle = false;
              break;
            }
          }
          if (isValidCastle) {
            moves.push(this.square.getAdjacentSquare(0, 2));
          }
        }
      }
      // queen side
      if (
        this.square.getAdjacentSquare(0, -1).piece == null &&
        this.square.getAdjacentSquare(0, -2).piece == null &&
        this.square.getAdjacentSquare(0, -3).piece == null
      ) {
        rook = this.square.getAdjacentSquare(0, -4).piece;
        if (
          rook != null &&
          rook.name === "R" &&
          rook.color === this.color &&
          !rook.hasMoved
        ) {
          let isValidCastle = true;
          let opponentMoves = this.square.board.game.players[this.color]
            .getOpponent()
            .getMoves(false, true, true); // ignore turn and castle
          const kingSquareStep1 = this.square.getAdjacentSquare(0, -1);
          const kingSquareStep2 = this.square.getAdjacentSquare(0, -2);
          for (let opponentMove of opponentMoves) {
            if (
              opponentMove.square.address === this.square.address ||
              opponentMove.square.address === kingSquareStep1.address ||
              opponentMove.square.address === kingSquareStep2.address
            ) {
              // king is in check, or would be in check on the way => invalid move
              isValidCastle = false;
              break;
            }
          }
          if (isValidCastle) {
            moves.push(this.square.getAdjacentSquare(0, 2));
          }
        }
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

class Queen extends Piece {
  constructor(color) {
    super(color);
    this.name = "Q";
    this.value = 9;
  }

  getMoves(verifyCheck = true, ignoreTurn = false) {
    var moves = [];
    if (!this.canMove(ignoreTurn)) return moves;
    for (let rowDirection of [-1, 0, 1]) {
      for (let colDirection of [-1, 0, 1]) {
        for (let offset = 1; offset < 8; offset++) {
          var adjSquare = this.square.getAdjacentSquare(
            rowDirection * offset,
            colDirection * offset
          );
          if (adjSquare == null) break;
          if (adjSquare.piece != null) {
            // stop if we encounter a piece
            if (adjSquare.piece.color === this.color) {
              // friendly piece
              break;
            } else {
              // opponent piece
              moves = this.addValidMove(
                moves,
                this.square,
                adjSquare,
                verifyCheck
              );
              break;
            }
          } else {
            moves = this.addValidMove(
              moves,
              this.square,
              adjSquare,
              verifyCheck
            );
          }
        }
      }
    }

    return moves;
  }
}

class Rook extends Piece {
  constructor(color) {
    super(color);
    this.name = "R";
    this.value = 5;
  }

  getMoves(verifyCheck = true, ignoreTurn = false) {
    let moves = [];
    if (!this.canMove(ignoreTurn)) return moves;
    for (let direction of [-1, 1]) {
      for (let rowcol of [0, 1]) {
        for (let offset = 1; offset < 8; offset++) {
          let adjSquare = null;
          if (rowcol === 0) {
            adjSquare = this.square.getAdjacentSquare(direction * offset, 0);
          } else {
            adjSquare = this.square.getAdjacentSquare(0, direction * offset);
          }
          if (adjSquare == null) break;
          if (adjSquare.piece != null) {
            // stop if we encounter a piece
            if (adjSquare.piece.color === this.color) {
              // friendly piece
              break;
            } else {
              // opponent piece
              moves = this.addValidMove(
                moves,
                this.square,
                adjSquare,
                verifyCheck
              );
              break;
            }
          } else {
            moves = this.addValidMove(
              moves,
              this.square,
              adjSquare,
              verifyCheck
            );
          }
        }
      }
    }
    return moves;
  }
}

class Bishop extends Piece {
  constructor(color) {
    super(color);
    this.name = "B";
    this.value = 3;
  }

  getMoves(verifyCheck = true, ignoreTurn = false) {
    var moves = [];
    if (!this.canMove(ignoreTurn)) return moves;
    for (let rowDirection of [-1, 1]) {
      for (let colDirection of [-1, 1]) {
        for (let offset = 1; offset < 8; offset++) {
          var adjSquare = this.square.getAdjacentSquare(
            rowDirection * offset,
            colDirection * offset
          );
          if (adjSquare == null) break;
          if (adjSquare.piece != null) {
            // stop if we encounter a piece
            if (adjSquare.piece.color === this.color) {
              // friendly piece
              break;
            } else {
              // opponent piece
              moves = this.addValidMove(
                moves,
                this.square,
                adjSquare,
                verifyCheck
              );
              break;
            }
          } else {
            moves = this.addValidMove(
              moves,
              this.square,
              adjSquare,
              verifyCheck
            );
          }
        }
      }
    }

    return moves;
  }
}

class Knight extends Piece {
  constructor(color) {
    super(color);
    this.name = "N";
    this.value = 3;
  }

  getMoves(verifyCheck = true, ignoreTurn = false) {
    var moves = [];
    if (!this.canMove(ignoreTurn)) return moves;
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
      moves = this.addValidMove(moves, this.square, adjSquare, verifyCheck);
    }
    return moves;
  }
}

class Pawn extends Piece {
  constructor(color) {
    super(color);
    this.name = "P";
    this.value = 1;
  }

  getMoves(verifyCheck = true, ignoreTurn = false) {
    var moves = [];
    if (!this.canMove(ignoreTurn)) return moves;

    var adjSquare;
    var rowOffset = 1; //white pawns move by rows ascending
    if (this.color === "B") rowOffset = -1; //black pawns move by rows descending

    adjSquare = this.square.getAdjacentSquare(rowOffset, 0);
    var canMoveForward = false;
    // check if move is on board, and if no piece is blocking
    if (adjSquare != null && adjSquare.piece == null) {
      moves = this.addValidMove(moves, this.square, adjSquare, verifyCheck);
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
        moves = this.addValidMove(moves, this.square, adjSquare, verifyCheck);
      }
    }

    // capture en passant
    for (let colOffset of [-1, 1]) {
      adjSquare = this.square.getAdjacentSquare(0, colOffset);
      if (
        adjSquare != null &&
        adjSquare.piece != null &&
        adjSquare.piece.color !== this.color &&
        adjSquare.piece.name === "P" &&
        this.square.board.game.movesHistory.length > 0
      ) {
        // get previous opponent move
        let previousOpponentMove = this.square.board.game.movesHistory[
          this.square.board.game.movesHistory.length - 1
        ];
        // if previous move was a pawn advancing 2 squares, then en passant is authorized
        if (
          previousOpponentMove.squareTo.address === adjSquare.address &&
          previousOpponentMove.piece.name === "P" &&
          Math.abs(
            previousOpponentMove.squareFrom.row -
              previousOpponentMove.squareTo.row
          ) === 2
        ) {
          adjSquare = this.square.getAdjacentSquare(rowOffset, colOffset);
          moves = this.addValidMove(moves, this.square, adjSquare, verifyCheck);
          console.log("En passant authorized on square " + adjSquare.address);
        }
      }
    }

    // move by 2 squares is allowed on first move
    if (canMoveForward && this.hasMoved === false) {
      adjSquare = this.square.getAdjacentSquare(rowOffset * 2, 0);
      if (adjSquare != null && adjSquare.piece == null) {
        moves = this.addValidMove(moves, this.square, adjSquare, verifyCheck);
      }
    }

    return moves;
  }
}

class Player {
  constructor(game, color = "W", name = "White") {
    this.game = game;
    this.color = color;
    this.name = name;
    this.squares = {}; // current occupied squares
    this.capturedPieces = [];
    this.score = 0;
  }

  getMoves(verifyCheck = true, ignoreTurn = true, ignoreCastle = false) {
    // get all available moves for the player
    let moves = [];
    for (let row of this.game.board.rows) {
      for (let square of row) {
        if (square.piece != null && square.piece.color === this.color) {
          let piecesMoves = square.piece.getMoves(
            verifyCheck,
            ignoreTurn,
            ignoreCastle
          );
          for (let pieceMove of piecesMoves) {
            moves.push({ piece: square.piece, square: pieceMove });
          }
        }
      }
    }
    return moves;
  }

  hasAvailableMove() {
    for (let row of this.game.board.rows) {
      for (let square of row) {
        if (square.piece != null && square.piece.color === this.color) {
          let piecesMoves = square.piece.getMoves(true, true, false);
          if (piecesMoves.length > 0) return true;
        }
      }
    }
    return false;
  }

  isCheck() {
    const opponent = this.getOpponent();
    //console.log("Verify if king in check for player " + this.color + "...");
    //console.log(opponent.squares);
    for (let key in opponent.squares) {
      let opponentSquare = opponent.squares[key];
      if (opponentSquare.piece == null) continue;
      let attackedSquares = [];
      if (opponentSquare.piece.name === "K") {
        // ignore castle
        attackedSquares = opponentSquare.piece.getMoves(false, true, true);
      } else {
        attackedSquares = opponentSquare.piece.getMoves(false, true);
      }
      if (attackedSquares.length === 0) continue;
      for (let attackedSquare of attackedSquares) {
        if (
          attackedSquare.piece != null &&
          attackedSquare.piece.name === "K" &&
          attackedSquare.piece.color === this.color
        ) {
          // one of the opponent pieces can attack player's king
          return true;
        }
      }
    }
    return false;
  }

  isCheckMate() {
    // get all available moves
    let availableMoves = this.getMoves();
    if (availableMoves.length > 0) {
      console.log(availableMoves.length + " available moves:", availableMoves);
      return false;
    }

    // or if attacker can be removed
    this.game.ended = true;
    this.game.endedWinner = this.getOpponent().color;
    console.log("Checkmate! Winner is " + this.game.endedWinner);
    return true;
  }

  getOpponent() {
    let opponentColor = "W";
    if (this.color === "W") opponentColor = "B";
    return this.game.players[opponentColor];
  }

  capturePiece(targetSquare) {
    if (targetSquare.piece == null) return;
    this.capturedPieces.push(targetSquare.piece);
    this.score += targetSquare.piece.value;
    targetSquare.piece = null;
    console.log(this.color + " captured a piece. Score=" + this.score);
  }
}

// exports
module.exports = {
  Game,
  Board,
  Square,
  King,
  Queen,
  Rook,
  Bishop,
  Knight,
  Pawn
};
