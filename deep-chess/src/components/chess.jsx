import React, { Component } from "react";
import { Game } from "../game";
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
    // no active square
    if (this.state.activeSquare == null) {
      if (square.piece != null) {
        // select square
        this.setState({
          activeSquare: square,
          validMoves: square.piece.getMoves()
        });
      }
      return;
    }

    // active square
    if (
      square === this.state.activeSquare ||
      this.state.validMoves == null ||
      !this.state.validMoves.includes(square)
    ) {
      // unselect square
      this.setState({ activeSquare: null, validMoves: null });
      return;
    }

    // move
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
  };

  getSquareClass = square => {
    if (square === this.state.activeSquare) return "active-square";
    if (this.state.validMoves == null) return null;
    if (this.state.validMoves.includes(square)) return "valid-move";
    return null;
  };

  renderBoard() {
    const rowsToDisplay = this.state.game.board.rows.slice(0).reverse();
    //scope="row"
    return rowsToDisplay.map((row, i) => {
      return (
        <tr key={i}>
          <th className="rowheader">{row[0].row + 1}</th>
          {row.map(square => {
            return (
              <td
                key={square.address}
                onClick={() => this.handleClick(square)}
                className={this.getSquareClass(square)}
              >
                <img
                  className="piece"
                  src={this.getPieceImage(square)}
                  alt=""
                />
              </td>
            );
          })}
        </tr>
      );
    });
  }

  renderHeaders() {
    let headers = (
      <tr>
        <th className="rowheader" />
        {this.state.game.board.colnames.map((colname, i) => {
          return <th key={i}>{colname}</th>;
        })}
      </tr>
    );
    return headers;
  }

  render() {
    return (
      <div>
        <table id="chessboard">
          <thead>{this.renderHeaders()}</thead>
          <tbody>{this.renderBoard()}</tbody>
        </table>
      </div>
    );
  }
}

export default ChessComponent;
