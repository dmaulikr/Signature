import React from 'react'
import { Alert, AsyncStorage, Button, Text, TouchableHighlight, View } from 'react-native'
import { NavigationActions, StackNavigator } from 'react-navigation'
import { Immersive } from 'react-native-immersive'

import SignatureCapture from 'react-native-signature-capture';

import Style from '../styles/Style'
import Utilities from './Utilities'
import PreSignature from './PreSignature'

class Signature extends React.Component {

  // Barre de navigation
  static navigationOptions = {
    title: 'Signature',
  }

  /**
   * Constructeur
   * @param props 
   */
  constructor(props) {
    super(props);

    this.state = {
      // Variable pour le débug
      signatureURI: this.props.navigation.state.params.uri
    }
  }

  /**
   * Sauvegarde l'image
   */
  saveSign() {
    this.refs['Signature'].saveImage();
  }

  /**
   * Mise à zéro du contenu de la zone de signature
   */
  resetSign() {
    this.refs['Signature'].resetImage();
  }

  /**
   * Button de retour de la signature
   */
  cancelSign() {
    signatureURI = this.state.signatureURI;
    // On vide le contenu de la signature et on change le status en 1 : "Nouvelle"
    this.signature(signatureURI, null, 1);
  }

  /**
   * Événement de sauvegarde l'image (bouton "Envoyer") 
   * @param result 
   */
  onSaveEvent(result) {
    // On fait un .replace() car pour une raison inconnue des \n viennent se glisser dans la base64
    var base64 = result.encoded.replace(/\n/g, '');

    // On récupère l'URI de la signature
    signatureURI = this.state.signatureURI;

    // 3 : "Terminée"
    this.signature(signatureURI, base64, 3);
  }

  /**
   * Permet d'envoyer une signature à l'API
   * base64 peut être null si l'on annule la mise à jour par exemple
   * @param {string} signatureURI 
   * @param {string} base64 
   * @param {int} statusId 
   */
  signature(signatureURI, base64, statusId) {
    Utilities.getItemFromStorage('token').then((token) => {
      if (token != null) {
        fetch(signatureURI, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            'data': base64,
            'statusId': statusId,
          })
        })
          .then((response) => {
            // Vérifie si le token est expiré ou non
            Utilities.IsTokenExpired();

            // On redirige vers l'écran de PreSignature 
            this.props.navigation.navigate('PreSignature');
          })
          .catch((error) => {
            console.error(error);
          });
      }
    })
  }

  /**
   * Permet de définir que le comportement du bouton de retour en arrière quitte l'application au lieu de dépiler
   */
  componentDidMount() {
    Utilities.onBackButtonPressedQuitApp();
  }

  render() {
    Immersive.setImmersive(true);
    return (
      <View style={Style.flexColumn}>
        <SignatureCapture
          style={Style.signature}
          ref='Signature'
          onSaveEvent={this.onSaveEvent.bind(this)}
          onDragEvent={this.onDragEvent}
          saveImageFileInExtStorage={false}
          showNativeButtons={false}
          showTitleLabel={true}
          rotateClockwise={true} />

        <View style={Style.flexRow}>
          <TouchableHighlight style={Style.buttonSignature} underlayColor={Style.touchColor}
            onPress={() => { this.saveSign() }} >
            <Text style={Style.buttonSignatureText}>Envoyer</Text>
          </TouchableHighlight>

          <TouchableHighlight style={Style.buttonSignature} underlayColor={Style.touchColor}
            onPress={() => { this.resetSign() }} >
            <Text style={Style.buttonSignatureText}>Effacer</Text>
          </TouchableHighlight>
        </View>

        <View style={Style.flexRow}>
          <TouchableHighlight style={Style.buttonSignature} underlayColor={Style.touchColor}
            onPress={() => { this.cancelSign() }} >
            <Text style={Style.buttonSignatureText}>Retour</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

}

// Constantes de style de la barre de navigation
const navigationOptions = {
  headerStyle: Style.header,
  headerTitleStyle: Style.headerTitle,
  headerLeft: null
}

export default StackNavigator({
  Signature: {
    screen: Signature,
    navigationOptions,
  },
},
  {
    headerMode: 'none'
  });