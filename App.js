import React from 'react';
import type, { NavigationComponent } from 'react-navigation/src/TypeDefinition';
import { createRootNavigator } from './src/router';
import firebase from './lib/firebase';

type State = {
  signedIn: boolean,
  hasAccount: boolean,
  user: any,
};

const auth = firebase.auth();

export default class App extends React.Component {
  state: State = {
    signedIn: false,
    hasAccount: false,
    user: null,
  };

  componentDidMount() {
    auth.onAuthStateChanged((user: Object) => {
      this.setState({
        user,
        signedIn: !!user,
      });
    });
  }

  render() {
    const { signedIn } = this.state;
    const Layout: NavigationComponent = createRootNavigator(signedIn);
    return <Layout />;
  }
}
