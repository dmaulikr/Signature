import React from 'react'
import { Alert, AsyncStorage, BackHandler } from 'react-native'
import jwt_decode from 'jwt-decode'

import GLOBAL from '../Global';
import PreSignature from './PreSignature'

export default class Utilities extends React.Component {

  /**
   * Récupération d'un item dans la mémoire du téléphone
   * @param item 
   */
  static async getItemFromStorage(item) {
    try {
      const value = await AsyncStorage.getItem(item);
      return value;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Stockage d'un item dans la mémoire du téléphone
   * @param key 
   * @param value 
   */
  static async setItemToStorage(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Permet de quitter l'application lorsque le bouton retour est pressé
   */
  static onBackButtonPressedQuitApp() {
    BackHandler.addEventListener('backPress', function () {
      BackHandler.exitApp();
    });
  }

  /**
   * Vérifie si le token courant est expiré et le renouvelle si besoin
   */
  static IsTokenExpired() {
    this.getItemFromStorage('token').then((token) => {
      if (token != null) {
        // Timestamp courant en secondes
        timeStamp = Math.floor(Date.now() / 1000);

        // Token décodé
        decodedToken = jwt_decode(token);

        if (timeStamp >= decodedToken.exp - 30) {
          // Le token est expiré, on le renouvelle
          this.getTokenIfExpired();
        }
      }
    })
  }

  /**
   * Renouvelle un token expiré et le stocke dans le stockage local du téléphone
   */
  static getTokenIfExpired() {
    var formBody = [];

    this.getItemFromStorage('login').then((login) => {
      formBody.push(encodeURIComponent('login') + '=' + encodeURIComponent(login));
      return this.getItemFromStorage('password');
    })
      .then((password) => {
        formBody.push(encodeURIComponent('password') + '=' + encodeURIComponent(password));

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
            this.setItemToStorage('token', responseJSON.access_token);
          })
          .catch((error) => {
            console.error(error);
          });
      }).done();
  }

  /**
   * Permet de retourner l'identifiant, le nom et la description de l'utilisateur présent dans le token
   */
  static getTokenInfos() {
    this.getItemFromStorage('token').then((token) => {
      if (token != null) {
        // Token décodé
        var decodedToken = jwt_decode(token);
        console.log(decodedToken);
      }
    })

    var userId = JSON.parse(JSON.stringify(decodedToken.sub));
    var userName = JSON.parse(JSON.stringify(decodedToken.name));
    var userDescription = JSON.parse(JSON.stringify(decodedToken.description));

    return (
      'Identifiant : '+userId+ '\n'+
      'Nom d\'utilisateur : '+userName+ '\n'+
      'Description : '+userDescription
    );
  }

}
