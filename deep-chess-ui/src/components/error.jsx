import React, { Component } from "react";

class ErrorComponent extends Component {
  state = {};
  render() {
    return (
      <form>
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text">@</span>
          </div>
          <input type="text" className="form-control" placeholder="Username" />
        </div>
      </form>
    );
  }
}

export default ErrorComponent;
