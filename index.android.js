import React from 'react';
import { AppRegistry, StatusBar, Text, View } from 'react-native'
import { Immersive } from 'react-native-immersive'

import PreSignature from './app/components/PreSignature'
import Style from './app/styles/Style'

export default class App extends React.Component {

  render() {
    return (
      <View style={Style.mainContainer}>
        <StatusBar hidden={true} />
        <PreSignature />
      </View>
    );
  }
}

AppRegistry.registerComponent('Signature', () => App);