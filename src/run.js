/**
 * bootstrap the app into document.body
 */

import React from 'react'
import {render} from 'react-dom'
import RCSS from 'rcss'
import {run} from 'react-router'

import router from './app/router'
import config from './config'

window.React = React

if (ELECTRON) {
  document.addEventListener('click', e => {
    if (e.target.href) {
      e.preventDefault()
      require('open')(e.target.href)
    }
  })
}

const popup = window.fblogin = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log(token, user);
    debugger;
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    debugger;
  });
}

const redirect = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.user) {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // ...
      }
      // The signed-in user info.
      var user = result.user;
      console.log('Logged in', user, credential);
    } else {
      firebase.auth().signInWithRedirect(provider);
    }
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    debugger;
  });
}

let container

window.onload = function () {
  RCSS.injectAll()
  container = document.createElement('div')
  container.id = 'container'
  document.body.appendChild(container)

  run(router, function (Handler) {
    render(<Handler/>, container)
  });

  /*
  const user = firebase.auth().currentUser;
  if (!user) {
    redirect();
  }
  */

}
