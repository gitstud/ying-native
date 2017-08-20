import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import firebase from '../../lib/firebase';

const styles =  StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    padding: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  textInput: {
    height: 60,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderColor: '#222',
    borderWidth: 1,
    marginBottom: 16,
  },
});

type State = {
  email: string,
  password: string,
};

type SignInAuthError = {
  message: string,
  code: 'auth/invalid-email' | 'auth/user-not-found' | 'auth/wrong-password' | 'auth/user-disabled',
};

export default class SignIn extends Component {
  static navigationOptions = {
    header: null,
  };

  state: State = {
    email: '',
    password: '',
  };

  signIn = () => {
    const { email, password } = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((error: SignInAuthError) => {
        switch (error.code) {
          case 'auth/iinvalid-email':
            Alert.alert(
              'Invalid Email',
              'The email entered is incorrect or not registered.',
            );
            break;
          case 'auth/user-not-found':
            Alert.alert(
              'Invalid Email',
              'The email address entered does not appear to be registered.',
            );
            break;
          case 'auth/wrong-password':
            Alert.alert(
              'Incorrect Password',
              'The password entered is incorrect.  Please try again.',
            );
            break;
          case 'auth/user-disabled':
            Alert.alert(
              'Accoun locked',
              'This account has been disabled.',
            );
            break;
          default:
            Alert.alert(
              'Error',
              [
                'Something went wrong. Please try again.',
                '',
                `[${error.code}]:`,
                `${error.message}`,
              ].join('\n'),
            );
        }
      });
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Task Manager APP</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(value: string) => this.setState({ email: value })}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="always"
        />
        <TextInput
          style={styles.textInput}
          onChangeText={(value: string) => this.setState({ password: value })}
          onSubmitEditing={this.signIn}
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          clearButtonMode="always"
          secureTextEntry
        />
        <Button
          title="Sign In"
          onPress={this.signIn}
        />
        <Text>New User?</Text>
        <View>
          <Button
            title="Sign Up Here"
            onPress={() => navigate('SignUpEmailAndPassword')}
          />
        </View>
      </View>
    );
  }
}
