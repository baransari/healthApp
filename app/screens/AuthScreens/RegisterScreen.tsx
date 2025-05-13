import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  Button,
  Text as PaperText,
  TextInput as PaperTextInput,
} from '../../utils/paperComponents';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { theme } = useTheme();
  const themeAsAny = theme as any;

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Please enter your name');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      return;
    }

    // Here you would typically make an API call to register the user
    // For now, we'll just simulate success
    Alert.alert('Success', 'Registration successful', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Login'),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <PaperText
            variant="headlineLarge"
            style={{ color: themeAsAny.colors.primary, marginBottom: 24, textAlign: 'center' }}
          >
            Create Account
          </PaperText>

          <PaperTextInput
            label="Full Name"
            value={name}
            onChangeText={(text: string) => {
              setName(text);
              if (nameError) setNameError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!nameError}
            autoCapitalize="words"
          />
          {nameError ? (
            <PaperText
              variant="labelSmall"
              style={{ color: themeAsAny.colors.error, marginBottom: 8 }}
            >
              {nameError}
            </PaperText>
          ) : null}

          <PaperTextInput
            label="Email"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <PaperText
              variant="labelSmall"
              style={{ color: themeAsAny.colors.error, marginBottom: 8 }}
            >
              {emailError}
            </PaperText>
          ) : null}

          <PaperTextInput
            label="Password"
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!passwordError}
            secureTextEntry
          />
          {passwordError ? (
            <PaperText
              variant="labelSmall"
              style={{ color: themeAsAny.colors.error, marginBottom: 8 }}
            >
              {passwordError}
            </PaperText>
          ) : null}

          <PaperTextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text: string) => {
              setConfirmPassword(text);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!confirmPasswordError}
            secureTextEntry
          />
          {confirmPasswordError ? (
            <PaperText
              variant="labelSmall"
              style={{ color: themeAsAny.colors.error, marginBottom: 8 }}
            >
              {confirmPasswordError}
            </PaperText>
          ) : null}

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={{ backgroundColor: themeAsAny.colors.primary }}
            labelStyle={styles.buttonText}
            onPress={handleRegister}
          >
            Register
          </Button>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
            <PaperText
              variant="labelLarge"
              style={{ color: themeAsAny.colors.primary }}
            >
              Already have an account? Sign in
            </PaperText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
});

export default RegisterScreen;
