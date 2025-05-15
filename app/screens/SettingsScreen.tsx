import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import {
  Text,
  Switch,
  RadioButton,
  Divider,
  Card,
  Title,
  Button,
} from '../utils/paperComponents';
// Ensure SVG support is available for FontAwesome
import 'react-native-svg';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faMoon,
  faSun,
  faMobile,
  faBell,
  faLanguage,
  faSave,
  faArrowLeft,
  faCog,
  faGlobe,
  faRulerCombined,
  faSync,
  faShieldAlt,
  faDatabase,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { User } from '../types';

// Extend the User type locally for this component
interface ExtendedUser extends User {
  exerciseReminders?: boolean;
  waterReminders?: boolean;
}

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
  // Cast user to ExtendedUser for this component
  const extendedUser = user as ExtendedUser | null;
  
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

  const getCardStyle = () => {
    return {
      backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      elevation: isDarkMode ? 8 : 4,
      shadowColor: isDarkMode ? themeAsAny.colors.primary : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      borderWidth: 0
    };
  };

  // Function to update extended user properties
  const updateExtendedUser = (updates: Partial<ExtendedUser>) => {
    updateUser(updates as Partial<User>);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={themeAsAny.colors.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]} 
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            size={20} 
            color={themeAsAny.colors.onSurface} 
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <FontAwesomeIcon 
            icon={faCog} 
            size={24} 
            color={themeAsAny.colors.primary} 
            style={{width: 24, height: 24, marginRight: 10}}
          />
          <Text style={[styles.headerTitle, { color: themeAsAny.colors.onBackground }]}>
            Ayarlar
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors.primary}20` }]}>
                <FontAwesomeIcon 
                  icon={isDarkMode ? faMoon : faSun} 
                  size={22} 
                  color={themeAsAny.colors.primary}
                  style={{width: 22, height: 22}} 
                />
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>
                Tema Ayarları
              </Text>
            </View>

            <View style={styles.settingItem}>
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

            <Text style={[styles.settingGroupLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>
              Tema Tercihi
            </Text>

            <View style={styles.radioContainer}>
              <RadioButton.Group
                onValueChange={(value: string) => handleThemeChange(value as ThemePreference)}
                value={themePreference}
              >
                <View style={styles.radioOption}>
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: themePreference === 'light' 
                          ? `${themeAsAny.colors.primary}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <FontAwesomeIcon 
                        icon={faSun} 
                        size={18} 
                        color={themePreference === 'light' ? themeAsAny.colors.primary : isDarkMode ? '#DDDDDD' : '#777777'} 
                        style={{width: 18, height: 18}}
                      />
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: themePreference === 'light' 
                          ? themeAsAny.colors.primary 
                          : themeAsAny.colors.onSurface 
                      }
                    ]}>
                      Açık Tema
                    </Text>
                  </View>
                  <RadioButton
                    value="light"
                    color={themeAsAny.colors.primary}
                    uncheckedColor={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                  />
                </View>

                <View style={styles.radioOption}>
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: themePreference === 'dark' 
                          ? `${themeAsAny.colors.primary}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <FontAwesomeIcon 
                        icon={faMoon} 
                        size={18} 
                        color={themePreference === 'dark' ? themeAsAny.colors.primary : isDarkMode ? '#DDDDDD' : '#777777'} 
                        style={{width: 18, height: 18}}
                      />
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: themePreference === 'dark' 
                          ? themeAsAny.colors.primary 
                          : themeAsAny.colors.onSurface 
                      }
                    ]}>
                      Koyu Tema
                    </Text>
                  </View>
                  <RadioButton
                    value="dark"
                    color={themeAsAny.colors.primary}
                    uncheckedColor={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                  />
                </View>

                <View style={styles.radioOption}>
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: themePreference === 'system' 
                          ? `${themeAsAny.colors.primary}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <FontAwesomeIcon 
                        icon={faMobile} 
                        size={18} 
                        color={themePreference === 'system' ? themeAsAny.colors.primary : isDarkMode ? '#DDDDDD' : '#777777'} 
                        style={{width: 18, height: 18}}
                      />
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: themePreference === 'system' 
                          ? themeAsAny.colors.primary 
                          : themeAsAny.colors.onSurface 
                      }
                    ]}>
                      Sistem Ayarı
                    </Text>
                  </View>
                  <RadioButton
                    value="system"
                    color={themeAsAny.colors.primary}
                    uncheckedColor={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                  />
                </View>
              </RadioButton.Group>
            </View>
          </Card.Content>
        </Card>

        {/* Notifications Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors.secondary}20` }]}>
                <FontAwesomeIcon 
                  icon={faBell} 
                  size={22} 
                  color={themeAsAny.colors.secondary}
                  style={{width: 22, height: 22}} 
                />
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>
                Bildirimler
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
                Bildirimleri Etkinleştir
              </Text>
              <Switch
                value={user?.notificationsEnabled || false}
                onValueChange={(value: boolean) => updateUser({ notificationsEnabled: value })}
                color={themeAsAny.colors.secondary}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={[
              styles.settingItem, 
              !user?.notificationsEnabled && { opacity: 0.5 }
            ]}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
                  Egzersiz Hatırlatıcıları
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>
                  Günlük egzersiz hedefleriniz için hatırlatıcılar alın
                </Text>
              </View>
              <Switch
                value={extendedUser?.exerciseReminders || false}
                onValueChange={(value: boolean) => updateExtendedUser({ exerciseReminders: value })}
                disabled={!user?.notificationsEnabled}
                color={themeAsAny.colors.secondary}
              />
            </View>

            <View style={[
              styles.settingItem, 
              !user?.notificationsEnabled && { opacity: 0.5 }
            ]}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
                  Su Hatırlatıcıları
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>
                  Düzenli su tüketimi için hatırlatıcılar alın
                </Text>
              </View>
              <Switch
                value={extendedUser?.waterReminders || false}
                onValueChange={(value: boolean) => updateExtendedUser({ waterReminders: value })}
                disabled={!user?.notificationsEnabled}
                color={themeAsAny.colors.secondary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* App Settings Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors.tertiary}20` }]}>
                <FontAwesomeIcon 
                  icon={faGlobe} 
                  size={22} 
                  color={themeAsAny.colors.tertiary}
                  style={{width: 22, height: 22}} 
                />
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>
                Uygulama Ayarları
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
                  Dil
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>
                  Uygulama dilini değiştir
                </Text>
              </View>

              <View style={styles.languageSelector}>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    user?.language === 'tr' && { 
                      backgroundColor: `${themeAsAny.colors.primary}20`,
                      borderColor: themeAsAny.colors.primary 
                    },
                    { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                  ]}
                  onPress={() => updateUser({ language: 'tr' })}
                >
                  <Text
                    style={[
                      styles.languageText,
                      { 
                        color: user?.language === 'tr' 
                          ? themeAsAny.colors.primary
                          : themeAsAny.colors.onSurface
                      },
                    ]}
                  >
                    TR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    user?.language === 'en' && { 
                      backgroundColor: `${themeAsAny.colors.primary}20`,
                      borderColor: themeAsAny.colors.primary 
                    },
                    { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                  ]}
                  onPress={() => updateUser({ language: 'en' })}
                >
                  <Text
                    style={[
                      styles.languageText,
                      { 
                        color: user?.language === 'en' 
                          ? themeAsAny.colors.primary
                          : themeAsAny.colors.onSurface
                      },
                    ]}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
                  Metrik Ölçü Birimleri
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>
                  Kilogram, santimetre vb. metrik birimler kullan
                </Text>
              </View>
              <Switch
                value={user?.metricUnits || false}
                onValueChange={(value: boolean) => updateUser({ metricUnits: value })}
                color={themeAsAny.colors.tertiary}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors.onSurface }]}>
                  Veri Senkronizasyonu
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>
                  Verileri bulut ile otomatik senkronize et
                </Text>
              </View>
              <Switch
                value={user?.dataSync || false}
                onValueChange={(value: boolean) => updateUser({ dataSync: value })}
                color={themeAsAny.colors.tertiary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Privacy Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors.error}20` }]}>
                <FontAwesomeIcon 
                  icon={faShieldAlt} 
                  size={22} 
                  color={themeAsAny.colors.error}
                  style={{width: 22, height: 22}} 
                />
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors.onSurface }]}>
                Veri ve Gizlilik
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Bilgi', 'Bu özellik henüz hazır değil.')}
            >
              <View style={styles.actionButtonContent}>
                <View style={[
                  styles.actionIconCircle, 
                  { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                ]}>
                  <FontAwesomeIcon 
                    icon={faDatabase} 
                    size={16} 
                    color={themeAsAny.colors.primary}
                    style={{width: 16, height: 16}} 
                  />
                </View>
                <Text style={[styles.actionButtonText, { color: themeAsAny.colors.onSurface }]}>
                  Verilerimi Yedekle
                </Text>
              </View>
              <FontAwesomeIcon 
                icon={faArrowLeft} 
                size={16} 
                color={themeAsAny.colors.onSurfaceVariant}
                style={{width: 16, height: 16, transform: [{ rotateY: '180deg' }]}}
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Bilgi', 'Bu özellik henüz hazır değil.')}
            >
              <View style={styles.actionButtonContent}>
                <View style={[
                  styles.actionIconCircle, 
                  { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                ]}>
                  <FontAwesomeIcon 
                    icon={faBookOpen} 
                    size={16} 
                    color={themeAsAny.colors.primary}
                    style={{width: 16, height: 16}} 
                  />
                </View>
                <Text style={[styles.actionButtonText, { color: themeAsAny.colors.onSurface }]}>
                  Gizlilik Politikası
                </Text>
              </View>
              <FontAwesomeIcon 
                icon={faArrowLeft} 
                size={16} 
                color={themeAsAny.colors.onSurfaceVariant}
                style={{width: 16, height: 16, transform: [{ rotateY: '180deg' }]}}
              />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: themeAsAny.colors.primary,
              shadowColor: themeAsAny.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5
            }
          ]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>
            Ayarları Kaydet
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: themeAsAny.colors.onSurfaceVariant }]}>
            Health Tracker v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40, // To balance with back button
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cardContent: {
    paddingVertical: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingLabelWithDescription: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  settingGroupLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  radioContainer: {
    marginLeft: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  radioIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioLabel: {
    fontSize: 16,
  },
  languageSelector: {
    flexDirection: 'row',
  },
  languageOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    marginTop: 24,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  version: {
    fontSize: 12,
  },
});

export default SettingsScreen;
