import React, { Component } from "react";
import "./chess-home.css";

class ChessHomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "visitor",
      password: "",
      color: "white",
      algo: "minimax.v2"
    };
  }

  handleClick = () => {
    if (!this.validateForm()) return;
    this.props.history.push({ pathname: "/chess/game", state: this.state });
  };

  validateForm() {
    return this.state.name.length > 0 && this.state.password === "nocoaching!";
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  render() {
    return (
      <div className="bg">
        <div className="absolute-center is-responsive mx-auto">
          <div className="card card-signin">
            <div className="card-body">
              <h4 className="card-title text-center">Game settings</h4>
              <form className="form-signin">
                <div className="form-label-group">
                  <p className="form-label-dark-text">Player</p>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Enter your name"
                    value={this.state.name}
                    onChange={this.handleChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-label-group">
                  <select
                    id="color"
                    className="form-control"
                    value={this.state.color}
                    onChange={this.handleChange}
                  >
                    <option>white</option>
                    <option>black</option>
                  </select>
                </div>

                <div className="form-label-group">
                  <p className="form-label-dark-text">Opponent A.I. version</p>
                  <select
                    id="algo"
                    className="form-control"
                    value={this.state.algo}
                    onChange={this.handleChange}
                  >
                    <option>minimax.v2</option>
                    <option>minimax.v1</option>
                    <option>random</option>
                  </select>
                </div>

                <div className="form-label-group">
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Chessroom password"
                    onChange={this.handleChange}
                    required
                  />
                </div>

                <button
                  className="btn btn-lg btn-primary btn-block text-uppercase"
                  type="submit"
                  onClick={this.handleClick}
                >
                  Play
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChessHomeComponent;
