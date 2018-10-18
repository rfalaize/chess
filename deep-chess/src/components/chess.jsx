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
    this.game = new Game();
    this.state.activeSquare = null;
    this.state.validMoves = null;
    this.turn = "W";
  }

  handleClick = square => {
    if (this.state.activeSquare == null) {
      //no active square yet
      if (square.piece != null) {
        this.setState({
          activeSquare: square,
          validMoves: square.piece.getMoves()
        });
      }
    } else {
      // active square
      if (
        square === this.state.activeSquare ||
        this.state.validMoves == null ||
        !this.state.validMoves.includes(square)
      ) {
        this.setState({ activeSquare: null, validMoves: null });
        return;
      } else {
        console.log("Move to " + square.address);
      }
    }
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
    return this.game.board.rows.map((row, i) => {
      return (
        <tr key={i}>
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

  render() {
    return (
      <div>
        <table id="chessboard">
          <tbody>{this.renderBoard()}</tbody>
        </table>
      </div>
    );
  }
}

export default ChessComponent;
