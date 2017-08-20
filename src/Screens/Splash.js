import React, { Component } from 'react';
import { StyleSheet, Button, Text, View, Alert } from 'react-native';
import type {
  NavigationRoute,
  NavigationAction,
  NavigationScreenProp,
} from 'react-navigation/src/TypeDefinition';
import firebase from '../../lib/firebase';

type Props = {
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    padding: 32,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 150,
  },
  signInContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  caption: {
    fontSize: 18,
  },
});

export default class Splash extends Component {
  static navigationOptions = {
    header: null,
  };

  props: Props;

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Task List Manager</Text>
          <Text style={styles.caption}>Manage all your tasks in one place</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => navigate('SignUpEmailAndPassword')}
            title="Sign up with email"
            color="blue"
            accessibilityLabel="Sign up with email"
          />
          <View style={styles.signInContainer}>
            <Button
              title="Already have an account?"
              color="blue"
              onPress={() => navigate('SignIn')}
            />
          </View>
        </View>
      </View>
    );
  }
}
