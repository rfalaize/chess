import React, { Component } from "react";
import ChessComponent from "./chess";
import "./chessRoom.css";

class ChessRoomComponent extends Component {
  state = {};
  render() {
    return (
      <div className="room-background">
        <div style={{ display: "flex", justifyContent: "left" }}>
          <ChessComponent />
        </div>
      </div>
    );
  }
}

export default ChessRoomComponent;
