import React from 'react';
import { AppRegistry, AsyncStorage, Alert, Button, Image, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';

import GLOBAL from '../Global';
import Style from '../styles/Style';
import Utilities from './Utilities';

const timer = require('react-native-timer');

class Login extends React.Component {

  // Barre de navigation
  static navigationOptions = {
    title: 'Signature - Connexion',
  }

  /**
   * Constructeur
   * @param props 
   */
  constructor(props) {
    super(props);
    this.state = {
      login: '',
      password: '',
      isSpinnerVisible: false,
      showProtectedPassword: true,
      showPasswordIcon: 'eye'
    }

    // On vide le stockage local
    AsyncStorage.clear();

    // On stop les deux timers (si jamais il se lancent à la construction de l'écran de connexion)
    timer.clearInterval('loopTrue');
    timer.clearInterval('loopFalse');
  }

  /**
   * Setter permettant de définir l'identifiant de l'utilisateur
   * @param {string} login 
   */
  setLogin(login) {
    this.setState({ login });
  }

  /**
   * Setter permettant de définir le mot de passe de l'utilisateur
   * @param {string} password 
   */
  setPassword(password) {
    this.setState({ password });
  }

  /**
   * Connexion de l'utilisateur à l'API grâce à son identifiant et son mot de passe
   */
  loginAPI() {
    this.setState({ isSpinnerVisible: true });

    var formBody = [];

    formBody.push(encodeURIComponent('login') + '=' + encodeURIComponent(this.state.login));
    formBody.push(encodeURIComponent('password') + '=' + encodeURIComponent(this.state.password));

    formBody = formBody.join('&');

    fetch(GLOBAL.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        // On stocke l'identifiant, le mot de passe et le token dans le stockage du téléphone
        Utilities.setItemToStorage('login', this.state.login);
        Utilities.setItemToStorage('password', this.state.password);
        Utilities.setItemToStorage('token', responseJSON.access_token);

        // On masque le spinner de connexion
        this.setState({ isSpinnerVisible: false });

        // On redirige vers l'écran de PreSignature
        this.props.navigation.navigate('PreSignature');
      })
      .catch((error) => {
        this.setState({ isSpinnerVisible: false });
        Alert.alert('Erreur lors de l\'authentification', 'Le nom d\'utilisateur ou le mot de passe est incorrect');
        this.setState({ password: '' });
      });
  }

  /**
   * Soumission de l'identifiant de connexion et du mot de passe pour la connexion à l'API
   */
  submit() {
    this.loginAPI();
  }

  /**
   * Permet de définir que le comportement du bouton de retour en arrière quitte l'application au lieu de dépiler
   */
  componentDidMount() {
    Utilities.onBackButtonPressedQuitApp();
  }

  render() {
    return (
      <View style={Style.parentContainer}>

        <View style={Style.childContainer}>
          <TextInput
            ref='loginInput'
            underlineColorAndroid='transparent'
            style={Style.textInput}
            value={this.state.login}
            onChangeText={(text) => this.setLogin(text)}
            placeholder='Identifiant'
            autoCorrect={false}
            onSubmitEditing={(event) => {
              this.refs.passwordInput.focus();
            }}
          />

          <View>
            <TextInput
              ref='passwordInput'
              underlineColorAndroid='transparent'
              style={Style.textInput}
              value={this.state.password}
              onChangeText={(text) => this.setPassword(text)}
              secureTextEntry={this.state.showProtectedPassword}
              placeholder='Mot de passe'
              autoCorrect={false}
              onSubmitEditing={() => this.submit()}
            />
            <Icon name={this.state.showPasswordIcon} style={{ padding: 15, position: 'absolute', right: 0, zIndex: 999 }} size={20} color='#9E1854' onPress={() =>
              this.setState({
                // Lorsque que l'utilisateur clique sur l'icône d'oeil le mot de passe s'affiche en clair et l'icône change
                showProtectedPassword: !this.state.showProtectedPassword,
                showPasswordIcon: !this.state.showProtectedPassword ? 'eye' : 'eye-slash'
              })} />
          </View>

          <TouchableHighlight ref='submitButton' style={Style.button} underlayColor={Style.touchColor} onPress={() => this.submit()}>
            <Text style={Style.buttonSignatureText}>Connexion</Text>
          </TouchableHighlight>

          <Spinner visible={this.state.isSpinnerVisible} textContent={'Connexion en cours...'} textStyle={{ color: '#FFF' }} />

        </View>

        <Image source={require('../images/logo.png')} />

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
  Login: {
    screen: Login,
    navigationOptions,
  }
},
  {
    headerMode: 'none'
  });


