import { StackNavigator, DrawerNavigator, TabNavigator } from 'react-navigation';

import type, { NavigationComponent } from 'react-navigation/src/TypeDefinition';

import Splash from './Screens/Splash';
import SignUpEmailAndPassword from './Screens/SignUpEmailAndPassword';
import SignIn from './Screens/SignIn';

import Dash from './Screens/Dash';

export const SignedOut: NavigationComponent = StackNavigator({
  Splash: {
    screen: Splash,
  },
  SignUpEmailAndPassword: {
    screen: SignUpEmailAndPassword,
  },
  SignIn: {
    screen: SignIn,
  },
});

export const SignedIn: NavigationComponent = TabNavigator({
  Dash: {
    screen: Dash,
  },
}, {
  activeTintColor: '#000000',
  inactiveTintColor: 'green',
  swipeEnabled: true,
});

export const createRootNavigator: NavigationComponent = (signedIn: boolean) =>
  StackNavigator(
    {
      SignedOut: {
        screen: SignedOut,
        navigationOptions: {
          gestureEnabled: false,
        },
      },
      SignedIn: {
        screen: SignedIn,
      },
    },
    {
      mode: 'modal',
      initialRouteName: signedIn ? 'SignedIn' : 'SignedOut',
    },
  );
