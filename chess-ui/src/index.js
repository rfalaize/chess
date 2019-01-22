import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import "./index.css";
import LoginComponent from "./components/login";
import GameComponent from "./components/chess";

class App extends Component {
  state = {};

  render() {
    return (
      <BrowserRouter>
        <div className="fill">
          <Switch>
            <Route path="/" component={LoginComponent} exact />
            <Route path="/login" component={LoginComponent} />
            <Route path="/chess" component={GameComponent} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
