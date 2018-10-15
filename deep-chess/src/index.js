import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import LoginComponent from "./components/login";
import ChessComponent from "./components/chess";
import ErrorComponent from "./components/error";
import ChessRoomComponent from "./components/chessRoom";

class App extends Component {
  state = {};

  render() {
    return (
      <BrowserRouter>
        <div>
          <Switch>
            <Route path="/" component={ChessRoomComponent} exact />
            <Route path="/login" component={LoginComponent} />
            <Route path="/chess" component={ChessComponent} />
            <Route component={ErrorComponent} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
