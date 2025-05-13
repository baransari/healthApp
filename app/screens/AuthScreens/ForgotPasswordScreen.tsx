import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  Button,
  Text as PaperText,
  TextInput as PaperTextInput,
} from '../../utils/paperComponents';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail } from '../../utils/validation';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

type Props = {
  navigation: ForgotPasswordScreenNavigationProp;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { theme } = useTheme();
  const themeAsAny = theme as any;

  const validateForm = (): boolean => {
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = () => {
    if (!validateForm()) {
      return;
    }

    // Here you would typically make an API call to send reset password email
    // For now, we'll just simulate success
    Alert.alert(
      'Success',
      'If an account exists with this email, you will receive password reset instructions.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ],
    );
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
        <View style={styles.formContainer}>
          <PaperText
            variant="headlineLarge"
            style={{ color: themeAsAny.colors.primary, marginBottom: 24, textAlign: 'center' }}
          >
            Reset Password
          </PaperText>

          <PaperText
            variant="bodyLarge"
            style={{ color: themeAsAny.colors.onSurfaceVariant, marginBottom: 24, textAlign: 'center' }}
          >
            Enter your email address and we'll send you instructions to reset your password.
          </PaperText>

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

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={{ backgroundColor: themeAsAny.colors.primary }}
            labelStyle={styles.buttonText}
            onPress={handleResetPassword}
          >
            Send Instructions
          </Button>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
            <PaperText
              variant="labelLarge"
              style={{ color: themeAsAny.colors.primary }}
            >
              Back to Login
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

export default ForgotPasswordScreen;
