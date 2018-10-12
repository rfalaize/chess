import React, { Component } from "react";
import { StyleSheet, ImageBackground, View, Text } from "react-native";
import { Game } from "./../game";
import "./boardComponent.css";

class BoardComponent extends Component {
  constructor() {
    super();
    this.state = {};
    this.game = new Game();
  }

  render() {
    return (
      <ImageBackground
        src={require("./../assets/img/board.png")}
        width="512"
        height="512"
      >
        <View>
          <Text>×</Text>
        </View>
      </ImageBackground>
    );
  }
}

export default BoardComponent;
