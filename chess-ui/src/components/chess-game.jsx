import React, { Component } from "react";
import "./chess-game.css";
import { BeatLoader } from "react-spinners";
import axios from "axios";

const { Chess, ChessBoard } = window;

class ChessGameComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    //attributes passed via props
    this.state.playername = this.props.location.state.name;
    this.state.playercolor = this.props.location.state.color;
    this.state.algoname = this.props.location.state.algo;

    this.state.engine = null;
    this.state.board = null;
    this.state.loading = false;
    this.state.game_over = false;
    this.state.message = "";
  }

  render() {
    return (
      <div className="chess-game-bg">
        <div className="container-fluid col-sm-4">
          {/* algo name */}
          <span>{"A.I engine: " + this.state.algoname}</span>

          {/* board */}
          <div id="game-board" />

          {/* player name */}
          <span>{"Player: " + this.state.playername}</span>

          {/* status */}
          {this.state.message !== "" && (
            <div>
              <br />
              <p>{this.state.message}</p>
              <br />
            </div>
          )}

          {/* history */}
          <div>
            <hr />
            <span className="history">{this.renderHistory()}</span>
            <br />
          </div>

          {/* loading animation */}
          <div className="sweet-loading">
            <BeatLoader
              sizeUnit={"px"}
              size={10}
              margin={"2px"}
              color={"#50E3C2"}
              loading={this.state.loading}
            />
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.initializeBoard(() => {
      if (this.state.playercolor === "white") return;
      // if player is black, start playing
      const fen = this.state.engine.fen();
      this.postGame(fen);
    });
  }

  initializeBoard(callback) {
    var game = this;
    var engine = new Chess();
    const config = {
      draggable: true,
      pieceTheme: "https://s3-us-west-2.amazonaws.com/chessimg/{piece}.png",
      // hook events
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };

    // create board
    var board = ChessBoard("game-board", config);
    board.orientation(this.state.playercolor);

    game.setState({ board: board, engine: engine }, () => {
      this.updateBoard(callback);
      return;
    });

    // events
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

      // check if game ended
      if (game.isGameEnded()) return;

      // post request
      const fen = engine.fen();
      game.postGame(fen);
    }

    function onSnapEnd() {
      return true;
    }
  }

  updateBoard(callback) {
    const fen = this.state.engine.fen();
    var board = this.state.board;
    board.position(fen);
    this.setState({ board: board }, callback);
  }

  postGame(fen) {
    // send post request to chess engine server
    this.setState({ loading: true });

    var game = this;
    var input = { fen: fen };
    var engine_server = "https://deep-chess-229318.appspot.com/";
    //var engine_server = "http://localhost:5000/";
    var engine_url = engine_server + "api/chess/engines/" + this.state.algoname;
    console.log("Posting game to " + engine_url + "...");

    axios
      .post(engine_url, input)
      .then(function(response) {
        const data = response["data"];
        const status = data["status"];
        console.log(data);

        if (status !== "success") {
          alert("Engine error while calculating move:", data["message"]);
        } else {
          const move = data["move"];
          const from = move.slice(0, 2);
          const target = move.slice(-2);
          game.state.engine.move({
            from: from,
            to: target,
            promotion: "q"
          });
        }
        game.updateBoard();
        game.setState({ loading: false });
        // check if game ended
        if (game.isGameEnded()) return;
      })
      .catch(function(error) {
        console.log(error);
        alert(error);
        this.setState({ loading: false });
      });
  }

  isGameEnded() {
    const engine = this.state.engine;
    if (engine.in_stalemate()) {
      this.setState({ game_over: true });
      this.setState({ message: "Draw by stalemate!" });
      return true;
    } else if (engine.in_threefold_repetition()) {
      this.setState({ game_over: true });
      this.setState({ message: "Draw by threefold repetition!" });
      return true;
    } else if (engine.in_draw()) {
      this.setState({ game_over: true });
      this.setState({ message: "Draw!" });
      return true;
    } else if (engine.game_over()) {
      var turn = engine.turn();
      var winner = "";
      if (turn === "b") {
        winner = "White";
      } else {
        winner = "Black";
      }

      this.setState({ game_over: true });
      this.setState({ message: winner + " wins!" });
      return true;
    }

    return false;
  }

  renderHistory() {
    if (this.state.engine === null) return "";
    var history = "History: " + this.state.engine.history().join(", ");
    return history;
  }
}

export default ChessGameComponent;
