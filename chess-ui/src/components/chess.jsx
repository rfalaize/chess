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
    const game = this;
    var input = { fen: fen };
    console.log("Post input=", input);

    var engine_url = "";
    engine_url =
      "https://deep-chess-229318.appspot.com/api/chess/engines/randomEngine";
    //engine_url = "http://localhost:5000/api/chess/engines/randomEngine";

    axios
      .post(engine_url, input)
      .then(function(response) {
        console.log(response);
        const data = response["data"];
        const status = data["status"];

        if (status !== "success") {
          alert("Engine error while calculating move:", data["message"]);
        } else {
          const move = data["move"];
          const from = move.slice(0, 2);
          const target = move.slice(-2);
          const m = game.engine.move({
            from: from,
            to: target,
            promotion: "q"
          });
          //console.log("done", m);
        }
        game.updateBoard();
        game.setState({ loading: false });
      })
      .catch(function(error) {
        console.log(error);
        alert(error);
        this.setState({ loading: false });
      });
  }
}

export default ChessComponent;
