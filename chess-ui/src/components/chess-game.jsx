import React, { Component } from "react";
import "./chess-game.css";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import "./home.css";
import { Line } from "react-chartjs-2";

const { Chess, ChessBoard } = window;

class ChessGameComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    //attributes passed via props
    this.state.playername = this.props.location.state.name;
    if (
      this.state.playername
        .toUpperCase()
        .replace(" ", "")
        .startsWith("LAMOR")
    ) {
      setTimeout(function() {
        alert("No coaching!");
      }, 3000);
    }
    this.state.playercolor = this.props.location.state.color;
    this.state.algoname = this.props.location.state.algo;

    this.state.engine = null;
    this.state.board = null;
    this.state.loading = false;
    this.state.gameover = false;
    this.state.message = "";

    // stats history
    this.state.enginestats = {};
    this.state.enginestats.history = {
      moves_played: [],
      moves_evaluated_count: [],
      predicted_scores: [],
      time_elapsed: []
    };
  }

  render() {
    const data = {
      labels: Array.from(
        new Array(this.state.enginestats.history.moves_evaluated_count.length),
        (val, index) => index + 1
      ),
      datasets: [
        {
          label: "Evaluated moves",
          data: this.state.enginestats.history.moves_evaluated_count,
          fill: false,
          backgroundColor: "#2ecc71", // green
          borderColor: "#2ecc71",
          yAxisID: "y-axis-1"
        },
        {
          label: "Predicted score",
          data: this.state.enginestats.history.predicted_scores,
          fill: false,
          backgroundColor: "#FEA47F",
          borderColor: "#FEA47F",
          yAxisID: "y-axis-2"
        }
      ]
    };

    const options = {
      responsive: true,
      title: {
        display: true,
        text: "Engine stats"
      },
      scales: {
        yAxes: [
          {
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-1",
            ticks: {
              fontColor: "#2ecc71"
            }
          },
          {
            type: "linear",
            display: true,
            position: "right",
            id: "y-axis-2",
            ticks: {
              fontColor: "#FEA47F"
            }
          }
        ]
      }
    };

    return (
      <section className="p-0">
        <div className="container-fluid p-0">
          <div className="chess-game-bg">
            <div className="container-fluid col-sm-12 col-md-9 col-lg-4">
              {/* algo name */}
              <span>{"A.I engine: lafal." + this.state.algoname}</span>

              {/* board */}
              <div id="game-board" style={{ width: "100%" }} />

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

              {/* Stats */}
              <div>
                <section>
                  <Line data={data} options={options} />
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
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
    console.log("Posting game to " + engine_url + "... input=", fen);

    axios
      .post(engine_url, input)
      .then(function(response) {
        const data = response["data"];
        const status = data["status"];
        console.log("response=", data);

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
          // update engine stats
          var stats = game.state.enginestats;
          stats.history.moves_played.push(move);
          if ("moves_evaluated" in data["stats"])
            stats.history.moves_evaluated_count.push(
              data["stats"]["moves_evaluated"]
            );
          if ("predicted_score" in data["stats"])
            stats.history.predicted_scores.push(
              data["stats"]["predicted_score"]
            );
          if ("elapsedTime" in data["stats"])
            stats.history.time_elapsed.push(data["stats"]["elapsedTime"]);
          game.setState({ enginestats: stats });
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
      this.setState({ gameover: true });
      this.setState({ message: "Draw by stalemate!" });
      return true;
    } else if (engine.in_threefold_repetition()) {
      this.setState({ gameover: true });
      this.setState({ message: "Draw by threefold repetition!" });
      return true;
    } else if (engine.in_draw()) {
      this.setState({ gameover: true });
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

      this.setState({ gameover: true });
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
