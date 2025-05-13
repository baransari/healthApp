import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  Text,
  Switch,
  RadioButton,
  Divider,
  Card,
  Title,
  Button,
} from '../utils/paperComponents';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faMoon,
  faSun,
  faMobile,
  faBell,
  faLanguage,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

interface SettingsScreenProps {
  navigation: any;
}

// Add these types to match the ThemeContext
type ThemePreference = 'light' | 'dark' | 'system';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDarkMode, themeMode, setTheme } = useTheme();
  const themeAsAny = theme as any;
  // Local state for theme preference that starts with the actual current theme mode
  const [themePreference, setThemePreference] = React.useState<ThemePreference>(themeMode);
  const { user, updateUser } = useUser();
  
  // Sync with the actual theme mode whenever it changes
  useEffect(() => {
    setThemePreference(themeMode);
  }, [themeMode]);

  // Update theme preference when radio button is changed
  const handleThemeChange = (value: ThemePreference) => {
    setThemePreference(value);
    setTheme(value);
    
    // Update dark mode in user preferences based on the selected theme
    if (user) {
      const isDark = value === 'dark' || (value === 'system' && isDarkMode);
      updateUser({ darkModeEnabled: isDark });
    }
  };

  const handleSaveSettings = () => {
    // Bildirimler veya diğer ayarlar üzerinde ek işlemler yapmak isteyebiliriz
    Alert.alert('Bilgi', 'Ayarlar kaydedildi');
    navigation.goBack();
  };

  // Dark mode toggle, using toggleTheme to match the context API
  const toggleDarkMode = (value: boolean) => {
    // If turning on dark mode
    if (value) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    
    // Update the user context directly to ensure consistency
    if (user) {
      updateUser({ darkModeEnabled: value });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>Tema</Title>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
              Karanlık Mod
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={(value: boolean) => toggleDarkMode(value)}
              color={themeAsAny.colors.primary}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.themeContainer}>
            <Text style={[styles.themeLabel, { color: themeAsAny.colors.onSurface }]}>Tema Tercihi</Text>

            <View style={styles.themeOptions}>
              <RadioButton.Group
                onValueChange={(value: string) => handleThemeChange(value as ThemePreference)}
                value={themePreference}
              >
                <View style={styles.radioOption}>
                  <RadioButton.Item
                    label="Açık"
                    value="light"
                    color={themeAsAny.colors.primary}
                    labelStyle={[styles.radioLabel, { color: themeAsAny.colors.onSurface }]}
                    position="leading"
                  />
                  <FontAwesomeIcon icon={faSun} size={20} color={isDarkMode ? '#fff' : '#FFB800'} />
                </View>

                <View style={styles.radioOption}>
                  <RadioButton.Item
                    label="Koyu"
                    value="dark"
                    color={themeAsAny.colors.primary}
                    labelStyle={[styles.radioLabel, { color: themeAsAny.colors.onSurface }]}
                    position="leading"
                  />
                  <FontAwesomeIcon
                    icon={faMoon}
                    size={20}
                    color={isDarkMode ? '#FFB800' : '#666'}
                  />
                </View>

                <View style={styles.radioOption}>
                  <RadioButton.Item
                    label="Sistem"
                    value="system"
                    color={themeAsAny.colors.primary}
                    labelStyle={[styles.radioLabel, { color: themeAsAny.colors.onSurface }]}
                    position="leading"
                  />
                  <FontAwesomeIcon
                    icon={faMobile}
                    size={20}
                    color={themeAsAny.colors.onSurfaceVariant}
                  />
                </View>
              </RadioButton.Group>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>
            Bildirimler
          </Title>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
              Bildirimleri Etkinleştir
            </Text>
            <Switch
              value={user?.notificationsEnabled || false}
              onValueChange={(value: boolean) => updateUser({ notificationsEnabled: value })}
              color={themeAsAny.colors.primary}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>
              Egzersiz Hatırlatıcıları
            </Text>
            <Switch
              value={user?.exerciseReminders || false}
              onValueChange={(value: boolean) => updateUser({ exerciseReminders: value })}
              disabled={!user?.notificationsEnabled}
              color={themeAsAny.colors.primary}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>
              Su Hatırlatıcıları
            </Text>
            <Switch
              value={user?.waterReminders || false}
              onValueChange={(value: boolean) => updateUser({ waterReminders: value })}
              disabled={!user?.notificationsEnabled}
              color={themeAsAny.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>Uygulama</Title>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <FontAwesomeIcon icon={faLanguage} size={20} color={themeAsAny.colors.primary} />
              <Text
                style={[styles.settingLabel, { color: themeAsAny.colors.onSurface, marginLeft: 10 }]}
              >
                Dil
              </Text>
            </View>

            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  user?.language === 'tr' && styles.selectedLanguage,
                  { borderColor: themeAsAny.colors.primary },
                ]}
                onPress={() => updateUser({ language: 'tr' })}
              >
                <Text
                  style={[
                    styles.languageText,
                    user?.language === 'tr' && { color: themeAsAny.colors.primary },
                    { color: themeAsAny.colors.onSurface },
                  ]}
                >
                  TR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOption,
                  user?.language === 'en' && styles.selectedLanguage,
                  { borderColor: themeAsAny.colors.primary },
                ]}
                onPress={() => updateUser({ language: 'en' })}
              >
                <Text
                  style={[
                    styles.languageText,
                    user?.language === 'en' && { color: themeAsAny.colors.primary },
                    { color: themeAsAny.colors.onSurface },
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
              Metrik Ölçü Birimleri
            </Text>
            <Switch
              value={user?.metricUnits || false}
              onValueChange={(value: boolean) => updateUser({ metricUnits: value })}
              color={themeAsAny.colors.primary}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
              Veri Senkronizasyonu
            </Text>
            <Switch
              value={user?.dataSync || false}
              onValueChange={(value: boolean) => updateUser({ dataSync: value })}
              color={themeAsAny.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>
            Veri ve Gizlilik
          </Title>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
              Verilerimi Yedekle
            </Text>
            <Button
              mode="outlined"
              style={styles.actionButton}
              labelStyle={{ fontSize: 12 }}
              icon={({ size, color }: { size: number; color: string }) => (
                <FontAwesomeIcon icon={faSave} size={size} color={color} />
              )}
              onPress={() => Alert.alert('Bilgi', 'Bu özellik henüz hazır değil.')}
              buttonColor={themeAsAny.colors.primary}
            >
              Yedekle
            </Button>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
              Gizlilik Politikası
            </Text>
            <Button
              mode="text"
              labelStyle={{ fontSize: 14 }}
              onPress={() => Alert.alert('Bilgi', 'Bu özellik henüz hazır değil.')}
              buttonColor={themeAsAny.colors.primary}
            >
              Görüntüle
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          onPress={handleSaveSettings}
          buttonColor={themeAsAny.colors.primary}
        >
          Ayarları Kaydet
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: themeAsAny.colors.onSurfaceVariant }]}>
          Health Tracker v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  themeContainer: {
    marginTop: 8,
  },
  themeLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  themeOptions: {
    marginLeft: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  radioLabel: {
    fontSize: 16,
  },
  languageSelector: {
    flexDirection: 'row',
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  selectedLanguage: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  languageText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButton: {
    borderRadius: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  version: {
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  saveButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
