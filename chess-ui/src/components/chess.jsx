import React, { Component } from "react";
import "./chess.css";
import { PacmanLoader } from "react-spinners";
import axios from "axios";

const { Chess, ChessBoard } = window;

class ChessComponent extends Component {
  constructor() {
    super();
    this.state = {};
    this.state.loading = false;
    this.engine = new Chess();
    this.board = null;
  }

  render() {
    return (
      <div className="container-fluid col-sm-4">
        <hr />
        <div id="game-board" />
        <hr />
        <div className="sweet-loading">
          <PacmanLoader
            sizeUnit={"px"}
            size={15}
            margin={"2px"}
            color={"#50E3C2"}
            loading={this.state.loading}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.initializeBoard();
  }

  initializeBoard(color = "white") {
    const game = this;
    const engine = this.engine;

    const config = {
      draggable: true,
      pieceTheme: "https://s3-us-west-2.amazonaws.com/chessimg/{piece}.png",
      // hook events
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };

    // create board
    this.board = ChessBoard("game-board", config);
    this.board.orientation(color);
    this.updateBoard();
    return this.board;

    // callbacks
    function onDragStart(source, piece) {
      if (engine.game_over()) return false;
      return true;
    }

    function onDrop(source, target) {
      const m = engine.move({
        from: source,
        to: target,
        promotion: "q"
      });
      if (m === null) return "snapback";
      // check if checkmate
      //...
      // post request
      const fen = engine.fen();
      console.log(game);
      game.postGame(fen);
    }

    function onSnapEnd() {
      return true;
    }
  }

  updateBoard(context = { fen: "" }) {
    this.engine.load(
      context.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    );
    this.board.position(this.engine.fen());
  }

  postGame(fen) {
    // post move on server
    this.setState({ loading: true });

    var input = { fen: fen };
    console.log("Post input=", input);
    axios
      .post("http://localhost:5000/api/chess/engines/randomEngine", input)
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

export default ChessComponent;
