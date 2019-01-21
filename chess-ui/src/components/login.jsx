import React, { Component } from "react";
import "./login.css";

class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputLogin: "",
      inputPassword: ""
    };
  }

  handleClick = () => {
    console.log("clicked:", this.state);
    this.props.history.push("/chess");
  };

  validateForm() {
    return (
      this.state.inputLogin.length > 0 && this.state.inputPassword.length > 0
    );
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
              <h4 className="card-title text-center">Login</h4>
              <form className="form-signin">
                <div className="form-label-group">
                  <input
                    type="email"
                    id="inputLogin"
                    className="form-control"
                    placeholder="Email address"
                    onChange={this.handleChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-label-group">
                  <input
                    type="password"
                    id="inputPassword"
                    className="form-control"
                    placeholder="Password"
                    onChange={this.handleChange}
                    required
                  />
                </div>

                <div className="custom-control custom-checkbox mb-3">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="customCheck1"
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck1"
                  >
                    Remember password
                  </label>
                </div>

                <button
                  className="btn btn-lg btn-primary btn-block text-uppercase"
                  type="submit"
                  onClick={this.handleClick}
                >
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginComponent;
