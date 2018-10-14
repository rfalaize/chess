import React, { Component } from "react";
import { Game } from "../game";
import "./chess.css";

class ChessComponent extends Component {
  constructor() {
    super();
    this.state = {};
    this.game = new Game();
  }

  render() {
    return <div>Chess Game</div>;
  }
}

export default ChessComponent;
