import React, { Component } from "react";
import "./chess-game.css";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import "./home.css";
import { Line } from "react-chartjs-2";
import "./../assets/startbootstrap-creative-gh-pages/vendor/fontawesome-free/css/all.min.css";

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
            }, 2000);
        }
        this.state.playercolor = this.props.location.state.color;
        this.state.algoname = this.props.location.state.algo;

        this.state.engine = null;
        this.state.board = null;
        this.state.loading = false;
        this.state.gameover = false;
        this.state.message = "";

        // stats history
        this.state.enginestats = { elapsed_time: [] };

        if (process.env.NODE_ENV === "production") {
            // GCP
            // this.state.engine_server = "https://deep-chess-229318.appspot.com/";

            // Azure
            // this.state.engine_server = "https://chess-engine.azurewebsites.net/";

            // Heroku
            //this.state.engine_server = "https://guarded-cove-12311.herokuapp.com/";
            this.state.engine_server = "https://deep-chess-engine.herokuapp.com/";
        } else {
            this.state.engine_server = "http://localhost:5800/";
        }

        // non-state
        this.historynextmoves = [];
        this.polling = false;
    }

    render() {
        return (
            <section className="p-0">
                <div className="container-fluid p-0">
                    <div className="chess-game-bg">
                        <div className="container-fluid col-sm-12 col-md-9 col-lg-5">
                            {/* algo name */}
                            <span>{"rhome@" + this.state.algoname + " - AI engine"}</span>
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
                            {/* buttons */}
                            <div className="row justify-content-center">
                                <div className="col-4" />
                                <div className="col-4">
                                    <div className="btn-group btn-group-actions">
                                        <label className="btn btn-dark btn-action" onClick={this.onClickPreviousMove}>
                                            <i className="fas fa-chevron-left" />
                                        </label>
                                        <label className="btn btn-dark btn-action" onClick={this.onClickNextMove}>
                                            <i className="fas fa-chevron-right" />
                                        </label>
                                        <label className="btn btn-dark btn-action" onClick={this.onClickImport}>
                                            <i className="fas fa-upload" />
                                        </label>
                                    </div>
                                </div>
                                <div className="col-4" />
                            </div>
                            {/* history */}
                            <div className="row" />
                            <div className="row">
                                <span className="history">{this.renderHistory()}</span>
                            </div>
                            {/* loading animation */}
                            {
                                <div className="sweet-loading">
                                    <BeatLoader sizeUnit={"px"} size={10} margin={"2px"} color={"#50E3C2"} loading={this.state.loading} />
                                </div>
                            }
                            {/* Stats */}
                            <div>{Object.keys(this.state.enginestats).map((key, index) => this.generateGraph(key, index))}</div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    generateGraph(statname, index = 0) {
        // from https://flatuicolors.com/palette/defo
        const colors = ["#2ecc71", "#f39c12", "#3498db", "#a29bfe", "#9b59b6", "#f1c40f", "#e74c3c", "#9b59b6"];

        var color = colors[index % colors.length];
        var data = {
            labels: Array.from(new Array(this.state.enginestats.elapsed_time.length), (val, index) => index + 1),
            datasets: [
                {
                    label: statname,
                    data: this.state.enginestats[statname],
                    fill: false,
                    backgroundColor: color,
                    borderColor: color
                }
            ]
        };
        var options = {
            responsive: true,
            yAxes: [
                {
                    type: "linear",
                    display: true,
                    position: "left",
                    ticks: {
                        fontColor: color
                    }
                }
            ]
        };

        return (
            <section key={"graph-" + statname}>
                <Line data={data} options={options} />
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

    postGame = fen => {
        // send post request to chess engine server
        this.setState({ loading: true });

        let game = this;
        let input = { engine: this.state.algoname, fen: fen };
        let engine_server = this.state.engine_server;
        let engine_url = engine_server + "api/v1/chess/engine/generate_move";
        console.log("Posting game to " + engine_url + "... input=", fen);

        axios
            .post(engine_url, input)
            .then(function(response) {
                const data = response["data"];
                console.log("response=", data);
                const status = data["status"];
                if (status !== "WORKING") {
                    throw new Error("Engine error while calculating move:" + data["error"]);
                }
                return data["move_id"];
            })
            .then(function(move_id) {
                setTimeout(function() {
                    game.pollMoveStatus(move_id);
                }, 5000); // wait before the first poll
            })
            .catch(function(error) {
                console.log(error);
                alert(error);
                this.setState({ loading: false });
            });
    };

    pollMoveStatus = move_id => {
        let game = this;
        let polling_url = this.state.engine_server + "api/v1/chess/engine/poll_move/" + move_id;
        console.log("start polling result... url=" + polling_url);
        axios.get(polling_url).then(function(response) {
            console.log("POLL RESPONSE", response);
            const data = response["data"];
            if (data["status"] === "WORKING") {
                // result is not available yet
                // wait 10 seconds and poll again
                setTimeout(function() {
                    game.pollMoveStatus(move_id);
                }, 10000);
            } else {
                const result = data["result"];
                const move = result["move"];
                const from = move.slice(0, 2);
                const target = move.slice(-2);
                game.state.engine.move({
                    from: from,
                    to: target,
                    promotion: "q"
                });
                // update engine stats
                let statshistory = game.state.enginestats;
                let statsmove = result["stats"];
                for (let statname in statsmove) {
                    if (!(statname in statshistory)) {
                        statshistory[statname] = [];
                    }
                    statshistory[statname].push(statsmove[statname]);
                }
                game.setState({ enginestats: statshistory });
                game.updateBoard();
                game.setState({ loading: false });
                // check if game ended
                if (game.isGameEnded()) return;
            }
        });
    };

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
        var history = (
            <div>
                <div>
                    <strong>History</strong>
                </div>
                <div>- pgn: {this.state.engine.pgn()}</div>
                <div>- fen: {this.state.engine.fen()}</div>
            </div>
        );
        return history;
    }

    setStateWithCache(state) {
        localStorage.setItem("chess-app", this.state);
    }

    onClickPreviousMove = () => {
        let nextmove = this.state.engine.undo();
        if (nextmove == null) return;
        this.historynextmoves.push(nextmove);
        this.updateBoard();
    };

    onClickNextMove = () => {
        if (this.historynextmoves.length === 0) return;
        this.state.engine.move(this.historynextmoves.shift());
        this.updateBoard();
    };

    onClickImport = () => {
        console.log("play!");
    };

    onClickRestart = () => {
        console.log("restart!");
    };
}

export default ChessGameComponent;
