import React, { Component } from "react";
import { Game } from "../game";
import "./chess.css";

class ChessComponent extends Component {
  constructor() {
    super();
    this.state = {};
    this.game = new Game();
    this.state.activeSquare = null;
  }

  handleClick = square => {
    this.setState({ activeSquare: square });
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
                className={
                  this.state.activeSquare === square ? "active-square" : null
                }
              />
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
