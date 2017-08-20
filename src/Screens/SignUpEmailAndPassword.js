import React, { Component } from 'react';
import { StyleSheet, Button, Text, TextInput, View } from 'react-native';
import type {
  NavigationRoute,
  NavigationAction,
  NavigationScreenProp,
} from 'react-navigation/src/TypeDefinition';
import firebase from '../../lib/firebase';

type Props = {
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
};

type State = {
  password: string,
  error: ?string,
};

type ErrorLabelProps = {
  error: string,
};

type SignUpError = {
  message: string,
  code: 'auth/email-already-in-use' | 'auth/invalid-email' | 'auth/operation-not-allowed' | 'auth/weak-password',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    padding: 32,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  textInput: {
    borderColor: '#222',
    borderWidth: 1,
    height: 60,
    width: '90%',
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

const ErrorLabel = (props: ErrorLabelProps) => (
  <Text style={styles.error}>{props.error}</Text>
);

export default class SignUpEmailAndPassword extends Component {
  static navigationOptions = {
    header: null,
  };

  state: State = {
    email: '',
    password: '',
    error: null,
  };

  props: Props;

  createUser = () => {
    const { email, password } = this.state;

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user: Object) => {
        console.log('success');
      })
      .catch((error: SignUpError) => {
        switch(error.code) {
          case 'auth/weak-password':
            this.setState({
              error: 'Password should be at least 6 characters',
            });
            break;
          default:
            this.setState({
              error: error.message,
            });
        }
      });
  }

  checkEmail = () => {
    const { email } = this.state;
    firebase.auth().fetchProvidersForEmail(email)
      .then((providers: Array<string>) => {
        if (providers.length > 0) {
          this.setState({
            error: 'This email is already registered.',
          });
        } else {
          this.createUser();
        }
      })
      .catch((error: EmailAuthError) => {
        switch (error.code) {
          case 'auth/invalid-email':
            this.setState({
              error: 'The provided email address is not valid.',
            });
            break;
          default:
            this.setState({ error: error.message });
        }
      });
  }

  clearErrors = () => {
    if (this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { email, password, error } = this.state;
    const disable = password.length < 6 ? true: email.length < 1 ? true : false;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter your email</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(value: string) => this.setState({ email: value, error: null })}
          value={email}
          onFocus={this.clearErrors}
          onSubmitEditing={this.checkEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        <Text style={styles.title}>Create a password</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(value: string) => this.setState({ password: value})}
          onFocus={this.clearErrors}
          value={password}
          placeholder="Minimum 6 characters"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        {error && <ErrorLabel error={error} /> }
        <Text>Password must be at least 6 characters long</Text>
        <Button
          title="Sign Up"
          onPress={this.checkEmail}
          color="#841584"
          accessibiilityLabel="Sign Up"
          disabled={disable}
        />
        <Text>Already have an account?</Text>
        <View>
          <Button
            title="Login here"
            onPress={() => navigate('SignIn')}
          />
        </View>
      </View>
    );
  }
}
