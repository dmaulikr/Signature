import React from 'react'
import { ActivityIndicator, Alert, AsyncStorage, Button, Linking, ScrollView, Text, ToastAndroid, TouchableHighlight, View } from 'react-native'
import { NavigationActions, StackNavigator } from 'react-navigation'
import jwt_decode from 'jwt-decode'
import Icon from 'react-native-vector-icons/FontAwesome';

import GLOBAL from '../Global';
import Style from '../styles/Style'
import Utilities from './Utilities'
import Login from './Login'
import Signature from './Signature'

const timer = require('react-native-timer');

class PreSignature extends React.Component {

  // Barre de navigation
  static navigationOptions = ({ navigation }) => ({
    title: 'Signature',
    headerRight:
    <TouchableHighlight onPress={() => PreSignature.disconnection(navigation)} underlayColor='transparent'>
      <Icon name='sign-out' style={Style.disconnectionButton} size={30} color='#FFFFFF' />
    </TouchableHighlight>
  });

  /**
   * Constructeur
   * @param props 
   */
  constructor(props) {
    super(props);

    // Test la validité de la connexion d'un utilisateur à l'application
    Utilities.getItemFromStorage('login').then((value) => {
      if (value != null) {
        // Timer mis à jour toutes les secondes permettant de signaler que l'appareil est disponible + rechercher une signature disponible
        this.startTimerAvailableDevice();
      } else {
        this.props.navigation.navigate('Login');
        timer.clearInterval(this.timer);
      }
    });

    this.state = {
      isSignatureAvailable: false
    }

    // On arrête le timer du PATCH ?available=false
    timer.clearInterval('loopDeviceIsUnavailable');
  }

  /**
   * Affiche une pop-up de confirmation lors de la déconnexion
   */
  static disconnection(navigation) {
    Alert.alert('Déconnexion', 'Vous allez être déconnecté de l\'application.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: () => navigation.navigate('Login') },
      ],
      { cancelable: true });
  }

  /**
   * Démarre un timer exécuté toutes les secondes
   */
  startTimerAvailableDevice() {
    timer.setInterval('loopDeviceIsAvailable', () => {
      // Vérifie si le token est expiré
      Utilities.IsTokenExpired();
      // On interroge l'API en disant que l'appareil est disponible pour une nouvelle signature
      this.pingAPI(true);
      // On recherche une nouvelle signature
      this.fetchNewSignature();
    }, 1000);
  }

  /**
   * Permet de définir que le comportement du bouton de retour en arrière quitte l'application au lieu de dépiler
   */
  componentDidMount() {
    Utilities.onBackButtonPressedQuitApp();
  }

  /**
   * Permet d'interroger l'API en lui disant que le téléphone est disponible
   * Le paramètre 'availability' (true/false) permet d'envoyer à l'API que l'appareil est disponible ou non pour signature
   * @param {bool} availability 
   */
  pingAPI(availability) {
    Utilities.getItemFromStorage('token').then((token) => {
      if (token != null) {
        fetch(GLOBAL.AVAILABILITY_URL + availability, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + token
          }
        })
          .catch((error) => {
            console.error(error);
          });
      }
    })
  }

  /**
   * Permet de récupérer une nouvelle signature
   */
  fetchNewSignature() {
    Utilities.getItemFromStorage('token').then((token) => {
      if (token != null) {
        fetch(GLOBAL.NEXT_SIGNATURE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + token
          }
        })
          .then((response) => {
            if (response.status == 200) {
              // On arrête le timer qui dit que l'appareil est disponible
              timer.clearInterval('loopDeviceIsAvailable');

              // On rend l'appareil indisponible si une signature est trouvée
              this.pingAPI(false);

              var responseJSON = response.json()
                .then((responseJSON) => {
                  // On stocke l'id, l'uri, la description ainsi que les documents d'une signature
                  this.setState({
                    signatureId: responseJSON.id,
                    signatureURI: responseJSON.uri,
                    signatureDescription: responseJSON.description,
                    signatureDocData: JSON.stringify(responseJSON.docData)
                  });
                });
              this.setState({ isSignatureAvailable: true });
            } else if (response.status == 204) {
              this.setState({ isSignatureAvailable: false });
            } else if (response.status != 204) {
              // On affiche un petit message en bas de l'écran
              ToastAndroid.show('Erreur : ' + response.status, ToastAndroid.SHORT);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    })
  }

  /**
   * Permet d'afficher une pop-up de confirmation pour signer
   */
  signatureAlert() {
    Alert.alert('Attention !', 'En cliquant sur le bouton "Continuer" vous vous engagez à signer l\'ensemble des documents listés précédemment.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => this.signatureAccept() },
      ],
      { cancelable: true });
  }

  /**
   * Accepte la signature en changeant le status à 2 : En cours
   */
  signatureAccept() {
    // On arrête la boucle qui dit que l'appareil est disponible
    timer.clearInterval('loopDeviceIsAvailable');
    // On définit l'appareil comme indisponible
    this.pingAPI(false);

    this.signature(this.state.signatureURI, 2);
  }

  /**
   * Refuse signature en changeant le status à 5 : 'Annulée par l'appareil'
   */
  signatureRefuse() {
    this.signature(this.state.signatureURI, 5);
  }

  /**
   *  Attribue la signature à l'utilisateur en changeant son status au paramètre définit (1 à 5)
   * @param {string} signatureURI 
   * @param {int} statusId 
   */
  signature(signatureURI, statusId) {
    Utilities.getItemFromStorage('token').then((token) => {
      if (token != null) {
        fetch(signatureURI, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            'statusId': statusId,
          })
        })
          .then((response) => {
            // Vérifie si le token est expiré ou non
            Utilities.IsTokenExpired();

            // En fonction du statusId passé en paramètre on redirige l'utilisateur
            if (statusId == 2) {
              this.props.navigation.navigate('Signature', {
                uri: signatureURI,
              })
            }
            else if (statusId == 5) {
              this.props.navigation.navigate('PreSignature');
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    })
  }

  /**
   * Permet de retourner un composant générique de document
   * @param {string} url 
   */
  renderDocument(url) {
    return document =
      <View style={Style.flexRowDocument} key={i} >
        <Icon name='file-text' style={Style.icon} size={15} color='#9E1854' />
        <Text style={Style.document} onPress={() => Linking.openURL(url)}>{parsedDocData[i].label}</Text>
      </View>
  }

  render() {
    const isSignatureAvailable = this.state.isSignatureAvailable;
    let textSignature = null;

    if (isSignatureAvailable) {
      // Normalement signatureDocData ne devrait pas être undefined/null mais il arrive qu'il le soit alors on effectue le test
      if (this.state.signatureDocData != null || this.state.signatureDocData != undefined) {

        // On parse le JSON pour pouvoir le manipuler plus facilement
        parsedDocData = JSON.parse(this.state.signatureDocData);

        listDocData = [];

        // On boucle sur la liste des documents et on ajout un composant générique de document à chaque passage en le remplissant
        for (i = 0; i < parsedDocData.length; i++) {
          listDocData.push(this.renderDocument(parsedDocData[i].url.toString()));
        }

        // Si la liste des documents est vide on affiche un message
        if (parsedDocData.length == 0) {
          listDocData.push(<Text key='noDoc' style={Style.noDocument}>Aucun document associé à cette signature.</Text>);
        }

        return (
          <View style={Style.parentContainer}>
            <ScrollView style={Style.childContainer}>
              <Text style={Style.text}>Une demande de signature est en attente, consultez les informations ci-dessous :</Text>
              <Text style={Style.preSignatureText}>
                <Text>Identifiant de la signature : </Text>
                <Text style={{ fontWeight: 'bold' }}>{this.state.signatureId}</Text>
              </Text>
              <Text style={Style.preSignatureText}>
                <Text>Description : </Text>
                <Text style={{ fontWeight: 'bold' }}>{this.state.signatureDescription}</Text>
              </Text>
              <Text style={Style.preSignatureText}>
                <Text>Document(s) à signer :</Text>
              </Text>
              <View style={Style.documentView}>{listDocData}</View>
            </ScrollView>

            <View style={Style.flexRowButtons}>
              <TouchableHighlight style={Style.buttonSignature} underlayColor={Style.touchColor}
                onPress={() => { this.signatureAlert() }} >
                <Text style={Style.buttonSignatureText}>Accepter</Text>
              </TouchableHighlight>
              <TouchableHighlight style={Style.buttonSignature} underlayColor={Style.touchColor}
                onPress={() => { this.signatureRefuse() }} >
                <Text style={Style.buttonSignatureText}>Refuser</Text>
              </TouchableHighlight>
            </View>
          </View>
        );
      }
      return (<View></View>);
    } else {
      // Si false on affiche le texte 'Recherche d'une signature en cours...' avec le spinner
      return (
        <View style={Style.parentContainer}>
          <View style={Style.noSignatureAvailableContainer}>
            <ActivityIndicator animating={true} color='#9E1854' size={100} />
            <Text style={Style.searchSignatureText}>En attente d\'une nouvelle signature...</Text>
          </View>
        </View>
      )
    }
  }
}

// Constantes de style de la barre de navigation
const navigationOptions = {
  headerStyle: Style.header,
  headerTitleStyle: Style.headerTitle,
  headerLeft: null
}

export default StackNavigator({
  PreSignature: {
    screen: PreSignature,
    navigationOptions
  },
  Login: {
    screen: Login,
    navigationOptions
  },
  Signature: {
    screen: Signature,
    navigationOptions
  },
})