import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import "./index.css";
import "./assets/startbootstrap-creative-gh-pages/css/creative.min.css";
import "./assets/startbootstrap-creative-gh-pages/vendor/fontawesome-free/css/all.min.css";
import HomeComponent from "./components/home";
import ChessHomeComponent from "./components/chess-home";
import ChessGameComponent from "./components/chess-game";

class App extends Component {
  state = {};

  render() {
    return (
      <BrowserRouter>
        <div className="fill">
          <Switch>
            <Route path="/" component={HomeComponent} exact />
            <Route path="/chess" component={ChessHomeComponent} exact />
            <Route path="/chess/game" component={ChessGameComponent} exact />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
