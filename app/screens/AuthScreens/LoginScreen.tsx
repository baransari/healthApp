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
import useAuth from '../../hooks/useAuth';
import {
  Button,
  Text as PaperText,
  TextInput as PaperTextInput,
} from '../../utils/paperComponents';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';

// Type for the navigation prop specific to this screen
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(email, password);

      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (err) {
      console.error('[LoginScreen] Login error:', err);
      Alert.alert('Error', 'An error occurred during login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <PaperText
            variant="headlineLarge"
            style={{ color: themeAsAny.colors.primary }}
          >
            Health Tracker
          </PaperText>
          <PaperText
            variant="bodyLarge"
            style={{ color: themeAsAny.colors.onSurfaceVariant }}
          >
            Track your health and fitness goals
          </PaperText>
        </View>

        <View style={styles.formContainer}>
          <PaperTextInput
            label="Email"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!emailError}
          />
          {emailError ? (
            <PaperText
              variant="labelSmall"
              style={{ color: themeAsAny.colors.error }}
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
            secureTextEntry
            error={!!passwordError}
          />
          {passwordError ? (
            <PaperText
              variant="labelSmall"
              style={{ color: themeAsAny.colors.error }}
            >
              {passwordError}
            </PaperText>
          ) : null}

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={{ backgroundColor: themeAsAny.colors.primary }}
            labelStyle={styles.buttonText}
            onPress={handleLogin}
          >
            Login
          </Button>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <PaperText
                variant="labelLarge"
                style={{ color: themeAsAny.colors.primary }}
              >
                Don't have an account? Register
              </PaperText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <PaperText
                variant="labelLarge"
                style={{ color: themeAsAny.colors.primary }}
              >
                Forgot Password?
              </PaperText>
            </TouchableOpacity>
          </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  linksContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
});

export default LoginScreen;
