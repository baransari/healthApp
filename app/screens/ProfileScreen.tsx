import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput as RNTextInput,
} from 'react-native';
// Import from paperComponents utility
import {
  Button as PaperButton,
  Card as PaperCard,
  Divider as PaperDivider,
  Avatar,
  Surface,
  useTheme,
  Title as PaperTitle,
  Paragraph as PaperParagraph,
} from '../utils/paperComponents';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCamera,
  faUserEdit,
  faWeightScale,
  faRulerVertical,
  faCake,
  faFire,
  faChevronRight,
  faFlag,
  faPersonRunning,
  faCog,
  faFileExport,
  faCircleQuestion,
  faRightFromBracket,
  faXmark,
  faImage,
  faTrashCan,
  faCheck,
  faPlus,
  faSync,
  faWater,
  faAppleAlt,
  faDumbbell,
  faBed,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../store';
import { RootState } from '../store';
import LoadingComponent from '../components/LoadingComponent';
import { StylesType, User, UserContextType } from '../types';

// Custom Title component
interface TitleProps {
  children: React.ReactNode;
  style?: any;
}
const Title: React.FC<TitleProps> = ({ children, style }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  return (
    <Text
      style={[
        {
          fontSize: 20,
          fontWeight: 'bold',
          color: themeAsAny.colors.onSurface,
          marginBottom: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Custom Paragraph component
interface ParagraphProps {
  children: React.ReactNode;
  style?: any;
}
const Paragraph: React.FC<ParagraphProps> = ({ children, style }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  return (
    <Text
      style={[
        {
          fontSize: 14,
          color: themeAsAny.colors.onSurfaceVariant,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Custom TextInput component
interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  underlineColor?: string;
  activeUnderlineColor?: string;
  mode?: 'flat' | 'outlined';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}
const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  style,
  underlineColor = 'transparent',
  activeUnderlineColor = 'transparent',
  mode = 'flat',
  keyboardType = 'default',
}) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <RNTextInput
      value={value}
      onChangeText={onChangeText}
      style={[
        {
          backgroundColor: '#f5f5f5',
          fontSize: 16,
          height: 50,
          borderRadius: 8,
          paddingHorizontal: 10,
          borderColor: isFocused
            ? activeUnderlineColor !== 'transparent'
              ? activeUnderlineColor
              : themeAsAny.colors.primary
            : underlineColor !== 'transparent'
            ? underlineColor
            : '#ddd',
          borderWidth: 1,
        },
        style,
      ]}
      keyboardType={keyboardType}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

// Custom Switch component
interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
}
const Switch: React.FC<SwitchProps> = ({ value, onValueChange, color }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  return (
    <TouchableOpacity
      style={{
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        backgroundColor: value ? color || themeAsAny.colors.primary : '#ccc',
      }}
      onPress={() => onValueChange(!value)}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: 'white',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </TouchableOpacity>
  );
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FunctionComponent<ProfileScreenProps> = () => {
  const { user, updateUser } = useUser() as UserContextType;
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const theme = useTheme();
  const themeAsAny = theme as any;
  const { colors } = theme;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState<User | null>(user);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Get sleep data from Redux
  const sleepTracker = useAppSelector((state: RootState) => state.sleepTracker);

  // Kullanıcı bilgileri değiştiğinde tempProfile'ı güncelle
  useEffect(() => {
    if (user) {
      setTempProfile(user);
    }
  }, [user]);

  const openEditModal = () => {
    if (user) {
      setTempProfile(user);
      setEditModalVisible(true);
      console.log('Edit modal opened');
    }
  };

  const saveProfile = () => {
    if (user && tempProfile) {
      updateUser({
        ...user, // Preserve existing user data
        name: tempProfile.name || user.name,
        email: tempProfile.email || user.email,
        weight: tempProfile.weight || user.weight,
        height: tempProfile.height || user.height,
        age: tempProfile.age || user.age,
      });
      setEditModalVisible(false);
    }
  };

  const takePicture = () => {
    Alert.alert('Kamera Erişimi', 'Bu özellik şu anda geliştirme aşamasındadır.', [
      { text: 'Tamam' },
    ]);
    setAvatarModalVisible(false);
  };

  const pickImage = () => {
    Alert.alert('Galeri Erişimi', 'Bu özellik şu anda geliştirme aşamasındadır.', [
      { text: 'Tamam' },
    ]);
    setAvatarModalVisible(false);
  };

  const removeProfilePhoto = () => {
    if (user) {
      updateUser({
        profilePhoto: null,
      });
      setAvatarModalVisible(false);
    }
  };

  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return null;
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(1));
  };

  const getBMICategory = () => {
    const bmi = calculateBMI();
    if (!bmi) return { category: 'Hesaplanamadı', color: '#999' };
    if (bmi < 18.5) return { category: 'Zayıf', color: '#2196F3' };
    if (bmi < 25) return { category: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { category: 'Kilolu', color: '#FF9800' };
    return { category: 'Obez', color: '#F44336' };
  };

  const calculateBMR = () => {
    if (!user?.weight || !user?.height || !user?.age) return null;
    return 10 * user.weight + 6.25 * user.height - 5 * user.age;
  };

  const bmi = calculateBMI();
  const bmr = calculateBMR();

  const calculateDailyCalorieNeeds = () => {
    const bmr = calculateBMR();
    if (!bmr) return 0;
    // Assuming moderate activity level (1.55 multiplier)
    return Math.round(bmr * 1.55);
  };

  const getGoalText = () => {
    return 'Kilo vermek (0.5kg/hafta)';
  };

  const getActivityLevelText = () => {
    return 'Orta seviye (haftada 3-5 gün)';
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        // Navigation will be handled by the logout function
        console.log('User logged out successfully');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!user) {
    return <LoadingComponent />;
  }

  const renderProfileInfo = () => (
    <PaperCard style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
      <PaperCard.Content>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setAvatarModalVisible(true)}
          >
            {user.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#4285F4' }]}>
                <Text style={styles.avatarLetter}>{user.name[0]}</Text>
              </View>
            )}
            <View style={styles.cameraIconOverlay}>
              <FontAwesomeIcon icon={faCamera as IconProp} size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <PaperTitle style={{ fontWeight: 'bold' }}>{user.name}</PaperTitle>
            <PaperParagraph style={{ color: '#666' }}>{user.email}</PaperParagraph>
            <PaperButton
              mode="contained"
              style={styles.editButton}
              labelStyle={styles.editButtonLabel}
              buttonColor={themeAsAny.colors.primary}
              icon={({ size, color }: { size: number; color: string }) => (
                <FontAwesomeIcon icon={faUserEdit as IconProp} size={size} color={color} />
              )}
              onPress={() => openEditModal()}
            >
              Profili Düzenle
            </PaperButton>
          </View>
        </View>
      </PaperCard.Content>
    </PaperCard>
  );

  const renderHealthMetrics = () => {
    // Get the latest sleep data from sleepTracker
    const sleepHours = sleepTracker?.lastSleep?.duration || user.sleepHours || 0;
    const sleepQuality = sleepTracker?.lastSleep?.quality || 'good';

    // Get sleep quality color
    const getSleepQualityColor = (quality: string) => {
      switch (quality) {
        case 'poor':
          return '#FF6B6B';
        case 'fair':
          return '#FFD166';
        case 'good':
          return '#4CAF50';
        case 'excellent':
          return '#118AB2';
        default:
          return '#4CAF50';
      }
    };

    return (
      <PaperCard style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
        <PaperCard.Content>
          <PaperTitle style={styles.sectionTitle}>Sağlık Metrikleri</PaperTitle>

          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <FontAwesomeIcon icon={faWeightScale as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricValue}>{user.weight} kg</Text>
              <Text style={styles.metricLabel}>Kilo</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <FontAwesomeIcon icon={faRulerVertical as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricValue}>{user.height} cm</Text>
              <Text style={styles.metricLabel}>Boy</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <FontAwesomeIcon icon={faCake as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricValue}>{user.age}</Text>
              <Text style={styles.metricLabel}>Yaş</Text>
            </View>
          </View>

          <PaperDivider style={styles.divider} />

          {/* Sleep data section */}
          <View style={styles.sleepContainer}>
            <View style={styles.sleepHeaderContainer}>
              <View style={styles.sleepIconContainer}>
                <FontAwesomeIcon icon={faBed as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.sleepHeaderTitle}>Uyku Verileri</Text>
            </View>

            <View style={styles.sleepDetailsContainer}>
              <View style={styles.sleepDetail}>
                <Text style={styles.sleepDetailLabel}>Son Uyku:</Text>
                <Text style={styles.sleepDetailValue}>{sleepHours.toFixed(1)} saat</Text>
              </View>

              <View style={styles.sleepDetail}>
                <Text style={styles.sleepDetailLabel}>Kalite:</Text>
                <View
                  style={[
                    styles.sleepQualityBadge,
                    { backgroundColor: getSleepQualityColor(sleepQuality) },
                  ]}
                >
                  <Text style={styles.sleepQualityText}>
                    {sleepQuality === 'poor'
                      ? 'Kötü'
                      : sleepQuality === 'fair'
                      ? 'Orta'
                      : sleepQuality === 'good'
                      ? 'İyi'
                      : 'Mükemmel'}
                  </Text>
                </View>
              </View>

              <View style={styles.sleepDetail}>
                <Text style={styles.sleepDetailLabel}>Hedef:</Text>
                <Text style={styles.sleepDetailValue}>
                  {sleepTracker?.sleepGoal || user.sleepGoal || 8} saat
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewSleepDetailsButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'SleepTracker' })}
            >
              <Text style={styles.viewSleepDetailsText}>Uyku detaylarını görüntüle</Text>
              <FontAwesomeIcon icon={faChevronRight as IconProp} size={14} color="#4285F4" />
            </TouchableOpacity>
          </View>

          <PaperDivider style={styles.divider} />

          <View style={styles.bmiContainer}>
            <View style={styles.bmiInfo}>
              <Text style={styles.bmiLabel}>Vücut Kitle İndeksi (BMI)</Text>
              <Text style={styles.bmiValue}>{bmi?.toFixed(1) || '-'}</Text>
              <Text style={[styles.bmiCategory, { color: getBMICategory().color }]}>
                {getBMICategory().category}
              </Text>
            </View>
            <View style={styles.bmiGaugeContainer}>
              <View style={styles.bmiGauge}>
                <View style={styles.bmiGaugeSegment1} />
                <View style={styles.bmiGaugeSegment2} />
                <View style={styles.bmiGaugeSegment3} />
                <View style={styles.bmiGaugeSegment4} />

                {/* Indicator konumu BMI değerine göre ayarlanıyor */}
                <View
                  style={[
                    styles.bmiIndicator,
                    {
                      left: `${Math.min(
                        Math.max(parseFloat(bmi?.toFixed(1) || '0') - 15, 0) * 4,
                        80,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.bmiLegend}>
                <Text style={styles.bmiLegendText}>Zayıf</Text>
                <Text style={styles.bmiLegendText}>Normal</Text>
                <Text style={styles.bmiLegendText}>Kilolu</Text>
                <Text style={styles.bmiLegendText}>Obez</Text>
              </View>
            </View>

            <View style={styles.calorieInfoContainer}>
              <View style={styles.calorieInfo}>
                <FontAwesomeIcon icon={faFire as IconProp} size={20} color="#FF9800" />
                <View style={styles.calorieTextContainer}>
                  <Text style={styles.calorieLabel}>Günlük Kalori İhtiyacı</Text>
                  <Text style={styles.calorieValue}>{calculateDailyCalorieNeeds()} kalori</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.calorieDetailsButton}>
                <Text style={styles.calorieDetailsButtonText}>Detaylar</Text>
                <FontAwesomeIcon icon={faChevronRight as IconProp} size={16} color="#4285F4" />
              </TouchableOpacity>
            </View>
          </View>
        </PaperCard.Content>
      </PaperCard>
    );
  };

  const renderGoalsAndActivity = () => (
    <PaperCard style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
      <PaperCard.Content>
        <PaperTitle style={styles.sectionTitle}>Hedefler ve Aktivite</PaperTitle>

        <View style={styles.goalContainer}>
          <View style={styles.goalIconContainer}>
            <FontAwesomeIcon icon={faFlag as IconProp} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Mevcut Hedef</Text>
            <Text style={styles.goalValue}>{getGoalText()}</Text>
          </View>
        </View>

        <View style={styles.goalContainer}>
          <View style={[styles.goalIconContainer, { backgroundColor: '#FF9800' }]}>
            <FontAwesomeIcon icon={faPersonRunning as IconProp} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Aktivite Seviyesi</Text>
            <Text style={styles.goalValue}>{getActivityLevelText()}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Haftalık İlerleme</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      user.totalWorkouts > 0
                        ? Math.min((user.completedWorkouts / user.totalWorkouts) * 100, 100)
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {user.completedWorkouts}/{user.totalWorkouts} antrenman tamamlandı
            </Text>
          </View>

          <View style={styles.streakContainer}>
            <FontAwesomeIcon icon={faFire as IconProp} size={24} color="#FF5722" />
            <Text style={styles.streakText}>5 günlük seri!</Text>
          </View>
        </View>
      </PaperCard.Content>
    </PaperCard>
  );

  const renderSettings = () => (
    <PaperCard style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
      <PaperCard.Content>
        <PaperTitle style={styles.sectionTitle}>Ayarlar</PaperTitle>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.settingIconContainer}>
            <FontAwesomeIcon icon={faCog as IconProp} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Uygulama Ayarları</Text>
            <Text style={styles.settingDescription}>Bildirimler, karanlık mod ve daha fazlası</Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight as IconProp} size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={[styles.settingIconContainer, { backgroundColor: '#4CAF50' }]}>
            <FontAwesomeIcon icon={faFileExport as IconProp} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Verileri Dışa Aktar</Text>
            <Text style={styles.settingDescription}>
              Egzersiz ve sağlık verilerinizi dışa aktarın
            </Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight as IconProp} size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={[styles.settingIconContainer, { backgroundColor: '#2196F3' }]}>
            <FontAwesomeIcon icon={faCircleQuestion as IconProp} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Yardım ve Destek</Text>
            <Text style={styles.settingDescription}>SSS ve destek bilgileri</Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight as IconProp} size={20} color="#999" />
        </TouchableOpacity>

        <PaperCard style={[styles.card, { marginTop: 16, marginBottom: 8, backgroundColor: themeAsAny.colors.surface }]}>
          <PaperCard.Content>
            <View style={styles.sectionTitleContainer}>
              <FontAwesomeIcon icon={faSync as IconProp} size={20} color={themeAsAny.colors.primary} />
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors.text }]}>Sağlık Verileri Özeti</Text>
            </View>

            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faWater as IconProp} size={20} color="#03A9F4" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={{ fontWeight: 'bold' }}>Su Tüketimi:</Text> Günlük{' '}
                  {((user.waterIntake || 0) * 1000).toFixed(0)}ml / {((user.waterGoal || 0) * 1000).toFixed(0)}ml
                </Text>
              </View>
            </View>

            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faAppleAlt as IconProp} size={20} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={{ fontWeight: 'bold' }}>Beslenme:</Text> Günlük {user.calories || 0} /{' '}
                  {user.caloriesGoal || 0} kalori alımı
                </Text>
              </View>
            </View>

            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faDumbbell as IconProp} size={20} color="#FF9800" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={{ fontWeight: 'bold' }}>Egzersiz:</Text> {user.completedWorkouts || 0} /{' '}
                  {user.totalWorkouts || 0} antrenman tamamlandı
                </Text>
              </View>
            </View>
          </PaperCard.Content>
        </PaperCard>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket as IconProp} size={20} color="#F44336" />
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </PaperCard.Content>
    </PaperCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {renderProfileInfo()}
        {renderHealthMetrics()}
        {renderGoalsAndActivity()}
        {renderSettings()}
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themeAsAny.colors.surface }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <PaperTitle style={styles.modalTitle}>Profili Düzenle</PaperTitle>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.closeButton}
                >
                  <FontAwesomeIcon icon={faXmark as IconProp} size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {tempProfile && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Ad Soyad</Text>
                    <TextInput
                      value={tempProfile.name}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, name: text })
                      }
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-posta</Text>
                    <TextInput
                      value={tempProfile.email}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, email: text })
                      }
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Kilo (kg)</Text>
                    <TextInput
                      value={tempProfile.weight?.toString() || ''}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, weight: parseFloat(text) || 0 })
                      }
                      keyboardType="numeric"
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Boy (cm)</Text>
                    <TextInput
                      value={tempProfile.height?.toString() || ''}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, height: parseFloat(text) || 0 })
                      }
                      keyboardType="numeric"
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Yaş</Text>
                    <TextInput
                      value={tempProfile.age?.toString() || ''}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, age: parseInt(text) || 0 })
                      }
                      keyboardType="numeric"
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                    />
                  </View>
                </>
              )}

              <PaperButton
                mode="contained"
                onPress={saveProfile}
                style={styles.saveButton}
                labelStyle={styles.buttonLabel}
                buttonColor={themeAsAny.colors.primary}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faCheck as IconProp} size={size} color={color} />
                )}
              >
                Kaydet
              </PaperButton>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Avatar Change Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.avatarModalContent, { backgroundColor: themeAsAny.colors.surface }]}>
            <PaperTitle style={styles.modalTitle}>Profil Fotoğrafı</PaperTitle>

            <TouchableOpacity style={styles.avatarOption} onPress={takePicture}>
              <View style={[styles.avatarOptionIcon, { backgroundColor: '#4285F4' }]}>
                <FontAwesomeIcon icon={faCamera as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.avatarOptionText}>Fotoğraf Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarOption} onPress={pickImage}>
              <View style={[styles.avatarOptionIcon, { backgroundColor: '#4CAF50' }]}>
                <FontAwesomeIcon icon={faImage as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.avatarOptionText}>Galeriden Seç</Text>
            </TouchableOpacity>

            {user.profilePhoto && (
              <TouchableOpacity style={styles.avatarOption} onPress={removeProfilePhoto}>
                <View style={[styles.avatarOptionIcon, { backgroundColor: '#F44336' }]}>
                  <FontAwesomeIcon icon={faTrashCan as IconProp} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.avatarOptionText}>Fotoğrafı Kaldır</Text>
              </TouchableOpacity>
            )}

            <PaperButton
              mode="outlined"
              onPress={() => setAvatarModalVisible(false)}
              style={styles.cancelButton}
              textColor={themeAsAny.colors.primary}
            >
              İptal
            </PaperButton>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<StylesType>({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  card: {
    margin: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 30,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  editButton: {
    marginTop: 15,
    borderRadius: 8,
    paddingVertical: 4,
  },
  editButtonLabel: {
    fontWeight: 'bold' as const,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 10,
  },
  bmiContainer: {
    marginTop: 10,
  },
  bmiInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#666',
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  bmiCategory: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  bmiGaugeContainer: {
    marginTop: 10,
  },
  bmiGauge: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bmiGaugeSegment1: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  bmiGaugeSegment2: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  bmiGaugeSegment3: {
    height: '100%',
    backgroundColor: '#FF9800',
  },
  bmiGaugeSegment4: {
    height: '100%',
    backgroundColor: '#F44336',
  },
  bmiIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    position: 'absolute',
    top: 5,
  },
  bmiLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  bmiLegendText: {
    fontSize: 12,
    color: '#666',
  },
  calorieInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieTextContainer: {
    marginLeft: 12,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  calorieDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieDetailsButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginRight: 5,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  progressSection: {
    marginTop: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginLeft: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  streakText: {
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginLeft: 12,
    color: '#F44336',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    fontWeight: 'bold' as const,
    fontSize: 22,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  avatarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  avatarOptionText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  avatarOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 20,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 8,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontWeight: 'bold' as const,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  settingsOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  settingsOptionTextContainer: {
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingsDivider: {
    height: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  adviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  adviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  adviceContent: {
    flex: 1,
  },
  adviceText: {
    fontSize: 16,
    color: '#666',
  },
  sleepContainer: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sleepHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sleepHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sleepDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sleepDetail: {
    alignItems: 'center',
  },
  sleepDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sleepDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sleepQualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sleepQualityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewSleepDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewSleepDetailsText: {
    color: '#4285F4',
    marginRight: 4,
    fontSize: 14,
  },
});

export default ProfileScreen;
