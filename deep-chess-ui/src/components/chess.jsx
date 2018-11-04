import React, { Component } from "react";
import { Game } from "@rfalaize/deep-chess-engine/engine";
import "./chess.css";
import wK from "./../assets/img/pieces/wK.png";
import wN from "./../assets/img/pieces/wN.png";
import wB from "./../assets/img/pieces/wB.png";
import wP from "./../assets/img/pieces/wP.png";
import wQ from "./../assets/img/pieces/wQ.png";
import wR from "./../assets/img/pieces/wR.png";
import bK from "./../assets/img/pieces/bK.png";
import bN from "./../assets/img/pieces/bN.png";
import bB from "./../assets/img/pieces/bB.png";
import bP from "./../assets/img/pieces/bP.png";
import bQ from "./../assets/img/pieces/bQ.png";
import bR from "./../assets/img/pieces/bR.png";

class ChessComponent extends Component {
  constructor() {
    super();
    this.state = {};
    this.state.game = new Game();
    this.state.activeSquare = null;
    this.state.validMoves = null;
    this.state.turn = "W";
  }

  handleClick = square => {
    // check if game has ended
    if (this.state.game.ended) return;

    // no active square
    if (this.state.activeSquare == null) {
      this.setActiveSquare(square);
      return;
    }

    // move
    this.setMove(square);
  };

  handleDragStart(event, square) {
    if (square.piece == null) return;
    this.setActiveSquare(square);
  }

  handleAllowDrop(event) {
    event.preventDefault();
  }

  handleDrop(event, square) {
    event.preventDefault();
    this.setMove(square);
  }

  getPieceImage = square => {
    if (square.piece == null) return undefined;
    if (square.piece.color === "W") {
      if (square.piece.name === "P") return wP;
      if (square.piece.name === "B") return wB;
      if (square.piece.name === "N") return wN;
      if (square.piece.name === "R") return wR;
      if (square.piece.name === "Q") return wQ;
      if (square.piece.name === "K") return wK;
    } else {
      if (square.piece.name === "P") return bP;
      if (square.piece.name === "B") return bB;
      if (square.piece.name === "N") return bN;
      if (square.piece.name === "R") return bR;
      if (square.piece.name === "Q") return bQ;
      if (square.piece.name === "K") return bK;
    }
    return undefined;
  };

  getSquareClass = square => {
    let squareClass = "chessboard-square";
    if (square === this.state.activeSquare) squareClass += " active-square";
    return squareClass;
  };

  setActiveSquare = square => {
    if (square == null) return;
    if (square.piece == null) return;
    // select square
    this.setState({
      activeSquare: square,
      validMoves: square.piece.getMoves()
    });
  };

  setMove = square => {
    // invalid move: unselect square
    if (
      square === this.state.activeSquare ||
      this.state.validMoves == null ||
      !this.state.validMoves.includes(square)
    ) {
      this.setState({ activeSquare: null, validMoves: null });
      return;
    }

    // valid move
    const piece = this.state.activeSquare.piece;
    piece.move(square);
    this.setState({
      game: this.state.game,
      activeSquare: null,
      validMoves: null
    });

    // unselect square
    this.setState({ activeSquare: null, validMoves: null });
  };

  handleCopyToClipboard = e => {
    document.getElementById("inputPgn").select();
    document.execCommand("copy");
    e.target.focus();
  };

  handleInitializeFromPgn = () => {
    const pgn = document.getElementById("inputPgn").value;
    this.setState({ game: this.state.game.initializeFromPgn(pgn) });
  };

  renderBoard() {
    const rowsToDisplay = this.state.game.board.rows.slice(0).reverse();
    //scope="row"
    return rowsToDisplay.map((row, i) => {
      return (
        <tr key={i} className="chessboard-row">
          <th className="chessboard-header-row">{row[0].row + 1}</th>
          {row.map(square => {
            return (
              <td
                key={square.address}
                className={this.getSquareClass(square)}
                onClick={() => this.handleClick(square)}
                onDragOver={e => this.handleAllowDrop(e)}
                onDrop={e => this.handleDrop(e, square)}
              >
                <div
                  onDragStart={e => this.handleDragStart(e, square)}
                  draggable
                  className="piecediv"
                >
                  <img
                    className="pieceimg"
                    src={this.getPieceImage(square)}
                    alt=""
                  />
                </div>
              </td>
            );
          })}
        </tr>
      );
    });
  }

  renderHeaders() {
    let headers = (
      <tr className="chessboard-header-column">
        <th />
        {this.state.game.board.colnames.map((colname, i) => {
          return <th key={i}>{colname}</th>;
        })}
      </tr>
    );
    return headers;
  }

  renderMovesViewer() {
    let tb = Object.keys(this.state.game.movesHistoryPgn).map((key, index) => {
      let turnMoves = this.state.game.movesHistoryPgn[key];
      let moveW = turnMoves[0];
      let moveB = "";
      if (turnMoves.length === 2) moveB = turnMoves[1];
      return (
        <tr key={index}>
          <td>{key}</td>
          <td>{moveW}</td>
          <td>{moveB}</td>
        </tr>
      );
    });
    // add scores
    tb.push(
      <tr key="emptyrow">
        <td>&nbsp;</td>
        <td> </td>
        <td> </td>
      </tr>
    );
    tb.push(
      <tr key="scores">
        <td>Scores</td>
        <td>{this.state.game.players["W"].score}</td>
        <td>{this.state.game.players["B"].score}</td>
      </tr>
    );
    return tb;
  }

  renderMovesHistoryPgn() {
    return this.state.game.getMovesHistoryPgn();
  }

  renderGameEnded() {
    if (this.state.game.ended) {
      let msg = "White won by checkmate.";
      if (this.state.game.endedWinner === "B") {
        msg = "Black won by checkmate.";
      } else if (this.state.game.endedWinner === "D") {
        msg = "Game ended in draw.";
      }
      return (
        <div>
          <h4>
            <span className="badge badge-pill badge-primary">{msg}</span>
          </h4>
        </div>
      );
    } else {
      return "";
    }
  }

  render() {
    return (
      <div className="container-fluid chessroom-background">
        <div className="row justify-content-around">
          <div className="col-md">
            <table className="chessboard">
              <thead>{this.renderHeaders()}</thead>
              <tbody>{this.renderBoard()}</tbody>
            </table>
          </div>
          <div className="col-md">
            <div className="mt-4 mr-4">
              <table className="table table-sm table-dark">
                <thead className="">
                  <tr>
                    <th scope="col">Move</th>
                    <th scope="col">White</th>
                    <th scope="col">Black</th>
                  </tr>
                </thead>
                <tbody>{this.renderMovesViewer()}</tbody>
              </table>
              <form>
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text">pgn</span>
                  </div>
                  <input
                    id="inputPgn"
                    type="text"
                    className="form-control"
                    defaultValue={this.renderMovesHistoryPgn()}
                  />
                  <div className="input-group-append">
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={this.handleCopyToClipboard}
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={this.handleInitializeFromPgn}
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              <div>{this.renderGameEnded()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChessComponent;
