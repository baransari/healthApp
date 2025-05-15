import * as React from 'react';
import { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Pressable,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { useAppSelector } from '../store';
import { RootState } from '../store';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import LoadingComponent from '../components/LoadingComponent';
import { User } from '../types';
import useTheme from '../hooks/useTheme';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faFire,
  faWalking,
  faWater,
  faBed,
  faDumbbell,
  faBrain,
  faLightbulb,
  faAppleAlt,
  faCalendarCheck,
  faCheckCircle,
  faClock,
  faSync,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

// Import from paperComponents utility (our compatibility layer)
import { Card, Button, Divider, Chip } from '../utils/paperComponents';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Type definition for the StatsCard component
interface StatsCardProps {
  backgroundColor: string;
  iconBackgroundColor: string;
  icon: IconDefinition;
  value: string | number;
  label: string;
  progress: number;
  onPress?: (() => void) | null;
  showDetails?: boolean;
}

// Memoized card components to prevent unnecessary re-renders
const StatsCard = memo<StatsCardProps>(
  ({
    backgroundColor,
    iconBackgroundColor,
    icon,
    value,
    label,
    progress,
    onPress = null,
    showDetails = false,
  }) => {
    const { theme, isDarkMode } = useTheme();
    const themeAsAny = theme as any;
    
    const content = (
      <View style={styles.statsCardContent}>
        {/* Header with icon and value */}
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIconContainer, { backgroundColor: iconBackgroundColor }]}>
            <FontAwesomeIcon icon={icon} size={22} color="#fff" />
          </View>
          <View style={styles.statsValueContainer}>
            <Text style={[styles.statsValue, { color: themeAsAny.colors.text }]}>{value}</Text>
            <Text style={[styles.statsLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>{label}</Text>
          </View>
        </View>
        
        {/* Progress section */}
        <View style={styles.statsProgressSection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: iconBackgroundColor,
                  width: `${Math.min(progress, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: iconBackgroundColor }]}>{progress}%</Text>
        </View>
        
        {/* Optional details button */}
        {showDetails && (
          <View style={[styles.customButtonContainer, { backgroundColor: iconBackgroundColor }]}>
            <Text style={styles.customButtonText}>Detaylar</Text>
          </View>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.9}
          style={[styles.statsCard, { backgroundColor }]}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return <View style={[styles.statsCard, { backgroundColor }]}>{content}</View>;
  },
);

// Workout Progress Card Component
interface WorkoutProgressCardProps {
  completedWorkouts: number;
  totalWorkouts: number;
  primaryColor: string;
  onPress: () => void;
}

const WorkoutProgressCard = memo<WorkoutProgressCardProps>(
  ({ completedWorkouts, totalWorkouts, primaryColor, onPress }) => {
    const { theme, isDarkMode } = useTheme();
    const themeAsAny = theme as any;
    const percentComplete = Math.round((completedWorkouts / totalWorkouts) * 100);
    
    return (
      <View style={[styles.card, { 
        backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
        borderWidth: 0,
      }]}>
        <View style={[styles.cardContent, { paddingTop: 24 }]}>
          <View style={styles.sectionTitleContainer}>
            <View style={{
              backgroundColor: `${primaryColor}20`,
              width: 50, 
              height: 50, 
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}>
              <FontAwesomeIcon icon={faDumbbell} size={24} color={primaryColor} />
            </View>
            <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Antrenman İlerlemesi</Text>
          </View>

          <View style={styles.workoutProgressContainer}>
            <View style={styles.workoutProgressInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faCheckCircle} size={16} color={primaryColor} style={{ marginRight: 8 }} />
                <Text style={[styles.workoutProgressText, { color: themeAsAny.colors.text }]}>
                  <Text style={[styles.workoutProgressCount, { color: primaryColor }]}>{completedWorkouts}</Text>/{totalWorkouts}{' '}
                  tamamlandı
                </Text>
              </View>
              <Text style={[styles.workoutProgressPercentage, { color: primaryColor }]}>{percentComplete}%</Text>
            </View>

            <View style={[styles.workoutProgressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <View
                style={[
                  styles.workoutProgressBarFill,
                  { 
                    width: `${Math.min(percentComplete, 100)}%`,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.actionButton, { 
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5
            }]}
          >
            <Text style={styles.actionButtonText}>Antrenmanlara Git</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

// Nutrition Status Card Component
interface NutritionCardProps {
  calories: number;
  caloriesGoal: number;
  primaryColor: string;
  onPress: () => void;
}

const NutritionCard = memo<NutritionCardProps>(
  ({ calories, caloriesGoal, primaryColor, onPress }) => {
    const { theme, isDarkMode } = useTheme();
    const themeAsAny = theme as any;
    const percentComplete = Math.round((calories / caloriesGoal) * 100);
    const remaining = caloriesGoal - calories;
    
    return (
      <View style={[styles.card, styles.lastCard, { 
        backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
        borderWidth: 0,
      }]}>
        <View style={[styles.cardContent, { paddingTop: 24 }]}>
          <View style={styles.sectionTitleContainer}>
            <View style={{
              backgroundColor: `${primaryColor}20`,
              width: 50, 
              height: 50, 
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}>
              <FontAwesomeIcon icon={faUtensils} size={24} color={primaryColor} />
            </View>
            <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Beslenme Durumu</Text>
          </View>

          <View style={styles.nutritionContainer}>
            <View style={[styles.nutritionItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }]}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>Tüketilen</Text>
              <Text style={[styles.nutritionValue, { color: primaryColor }]}>{calories}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.textSecondary || '#666' }]}>kalori</Text>
            </View>

            <View style={[styles.nutritionItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }]}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>Kalan</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.text }]}>{remaining}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.textSecondary || '#666' }]}>kalori</Text>
            </View>

            <View style={[styles.nutritionItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }]}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>Hedef</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.text }]}>{caloriesGoal}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.textSecondary || '#666' }]}>kalori</Text>
            </View>
          </View>
          
          {/* Progress bar for calories */}
          <View style={{ width: '100%', paddingHorizontal: 4, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: themeAsAny.colors.textSecondary || '#666' }}>Günlük Hedef</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: primaryColor }}>{percentComplete}%</Text>
            </View>
            <View style={[styles.workoutProgressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <View
                style={[
                  styles.workoutProgressBarFill,
                  { 
                    width: `${Math.min(percentComplete, 100)}%`,
                    backgroundColor: primaryColor 
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.actionButton, { 
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5
            }]}
          >
            <Text style={styles.actionButtonText}>Beslenme Takibine Git</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const HomeScreen: React.FunctionComponent<HomeScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const themeAsAny = theme as any;
  const { user } = useUser();

  // Doğrudan sleepTracker verisini al
  const sleepTracker = useAppSelector((state: RootState) => state.sleepTracker);

  const calculateProgressPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  if (!user) {
    return <LoadingComponent />;
  }

  const stepsProgress = calculateProgressPercentage(user.steps, user.stepsGoal);
  const caloriesProgress = calculateProgressPercentage(user.calories || 0, user.caloriesGoal || 0);
  const sleepHours = sleepTracker?.lastSleep?.duration || user.sleepHours || 0;
  const sleepGoal = sleepTracker?.sleepGoal || user.sleepGoal || 0;
  const sleepProgress = calculateProgressPercentage(sleepHours, sleepGoal);
  const waterProgress = calculateProgressPercentage(user.waterIntake || 0, user.waterGoal || 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  function isValidUser(user: User | null): user is User {
    return user !== null;
  }

  // Günün renk temaları (değiştirebilirsiniz)
  const primaryColor = themeAsAny.colors.primary || '#4285F4';
  const secondaryColor = isDarkMode ? '#2C2C2C' : '#fff';
  const headerColor = isDarkMode ? '#1E1E2E' : 'rgba(66, 133, 244, 0.95)';
  const gradientColors = isDarkMode 
    ? ['#272838', '#1E1E2E'] 
    : ['#4285F4', '#5C9CFF'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeAsAny.colors.background }]}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Modern ve canlı bir tasarım */}
        <View style={[styles.headerContainer, { backgroundColor: headerColor }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greetingText, { color: 'rgba(255, 255, 255, 0.9)' }]}>{getGreeting()},</Text>
              <Text style={[styles.welcomeText, { color: '#fff' }]}>{user.name || 'Kullanıcı'}!</Text>
              <Text style={[styles.dateText, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            <TouchableOpacity>
              <View style={[styles.avatar, { backgroundColor: secondaryColor }]}>
                <Text style={{ 
                  color: isDarkMode ? '#fff' : primaryColor, 
                  fontSize: 26,
                  fontWeight: 'bold' 
                }}>
                  {user.name?.charAt(0) || 'K'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Streak Chip - Daha yuvarlak ve canlı */}
          <Chip
            icon={({ size, color }: { size: number; color: string }) => (
              <FontAwesomeIcon icon={faFire} size={size} color="#FF9800" />
            )}
            style={[styles.streakChip, { 
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }]}
            textStyle={[styles.streakChipText, { color: '#fff' }]}
          >
            {user.streak || 5} günlük seri!
          </Chip>
        </View>

        {/* Stats Cards - Daha yuvarlak ve gölgeli tasarım */}
        <View style={styles.statsRow}>
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#E3F2FD'}
            iconBackgroundColor="#1E88E5"
            icon={faWalking}
            value={user.steps || 0}
            label="Adım"
            progress={stepsProgress}
            onPress={() => navigation.navigate('StepTracker')}
          />
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#FFF8E1'}
            iconBackgroundColor="#FFC107"
            icon={faFire}
            value={user.calories || 0}
            label="Kalori"
            progress={caloriesProgress}
            onPress={() => navigation.navigate('CalorieTracker')}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#E1F5FE'}
            iconBackgroundColor="#03A9F4"
            icon={faWater}
            value={`${user.waterIntake || 0}L`}
            label="Su"
            progress={waterProgress}
            onPress={() => navigation.navigate('WaterTracker')}
          />
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#E8EAF6'}
            iconBackgroundColor="#3F51B5"
            icon={faBed}
            value={`${sleepHours}s`}
            label="Uyku"
            progress={sleepProgress}
            showDetails={false}
            onPress={() => navigation.navigate('SleepTracker')}
          />
        </View>

        {/* Workout Progress - Modern ve temiz tasarım */}
        <WorkoutProgressCard
          completedWorkouts={user.completedWorkouts || 0}
          totalWorkouts={user.totalWorkouts || 12}
          primaryColor={primaryColor}
          onPress={() => navigation.navigate('ExerciseTracker')}
        />

        {/* AI Health Advice - Daha modern kartlar */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
          borderWidth: 0,
        }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faBrain} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>AI Sağlık Tavsiyeleri</Text>
            </View>
            
            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faLightbulb} size={22} color="#FFC107" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  Bugün {user.stepsGoal || 10000} adım hedefine yakınsın!{' '}
                  {(user.stepsGoal || 10000) - (user.steps || 0)} adım daha at ve günlük hedefe ulaş.
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)', 
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faAppleAlt} size={22} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  Akşam yemeğinde protein açısından zengin gıdalar tüketmeyi düşünebilirsin.
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              style={[styles.actionButton, { 
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              Tüm Tavsiyeleri Gör
            </Button>
          </Card.Actions>
        </Card>

        {/* Activity Schedule - Modern program görünümü */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
          borderWidth: 0,
        }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faCalendarCheck} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Günlük Program</Text>
            </View>
            
            <View style={[styles.activityItem, { 
              backgroundColor: isDarkMode ? 'rgba(3, 169, 244, 0.1)' : 'rgba(3, 169, 244, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(3, 169, 244, 0.2)' : 'rgba(3, 169, 244, 0.1)',
            }]}>
              <View style={[styles.activityTimeContainer, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <Text style={[styles.activityTime, { color: '#03A9F4' }]}>09:00</Text>
              </View>
              <View style={styles.activityContentContainer}>
                <Text style={[styles.activityName, { color: themeAsAny.colors.text }]}>Sabah Yürüyüşü</Text>
                <Text style={[styles.activityDuration, { color: themeAsAny.colors.textSecondary || '#666' }]}>30 dakika</Text>
              </View>
            </View>

            <View style={[styles.activityItem, { 
              backgroundColor: isDarkMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)',
            }]}>
              <View style={[styles.activityTimeContainer, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <Text style={[styles.activityTime, { color: '#9C27B0' }]}>18:30</Text>
              </View>
              <View style={styles.activityContentContainer}>
                <Text style={[styles.activityName, { color: themeAsAny.colors.text }]}>Yoga</Text>
                <Text style={[styles.activityDuration, { color: themeAsAny.colors.textSecondary || '#666' }]}>45 dakika</Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ExerciseTracker')}
              style={[styles.actionButton, { 
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              Program Detayı
            </Button>
          </Card.Actions>
        </Card>

        {/* Debug/Dev Card - Sadece geliştirme aşamasında */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
          borderWidth: 0,
          opacity: 0.9
        }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faSync} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Entegrasyon Durumu (DEV)</Text>
            </View>
            
            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(3, 169, 244, 0.1)' : 'rgba(3, 169, 244, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(3, 169, 244, 0.2)' : 'rgba(3, 169, 244, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faWater} size={22} color="#03A9F4" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>Su Takibi:</Text> Redux Store'da{' '}
                  {((user.waterIntake || 0) * 1000).toFixed(0)}ml /{' '}
                  {((user.waterGoal || 0) * 1000).toFixed(0)}ml
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faAppleAlt} size={22} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>Beslenme:</Text> Redux Store'da{' '}
                  {user.calories || 0} / {user.caloriesGoal || 0} kalori
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faDumbbell} size={22} color="#FF9800" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>Antrenman:</Text> Redux Store'da{' '}
                  {user.completedWorkouts || 0} / {user.totalWorkouts || 0} tamamlandı
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => null} 
              style={[styles.actionButton, { 
                backgroundColor: primaryColor,
                opacity: 0.8,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              Geliştirici Bilgisi
            </Button>
          </Card.Actions>
        </Card>

        {/* Nutrition Status - Modern beslenme kartı */}
        <NutritionCard
          calories={user.calories || 0}
          caloriesGoal={user.caloriesGoal || 2500}
          primaryColor={primaryColor}
          onPress={() => navigation.navigate('CalorieTracker')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  streakChip: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  streakChipText: {
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  statsCardContent: {
    width: '100%',
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  statsValueContainer: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 16,
    marginBottom: 10,
    opacity: 0.7,
  },
  statsProgressSection: {
    width: '100%',
    marginVertical: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    alignSelf: 'flex-end',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  lastCard: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  workoutProgressContainer: {
    marginVertical: 14,
  },
  workoutProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  workoutProgressText: {
    fontSize: 16,
    opacity: 0.8,
  },
  workoutProgressCount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutProgressPercentage: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutProgressBar: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  workoutProgressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  adviceContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
  },
  adviceIcon: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  adviceContent: {
    flex: 1,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 22,
  },
  adviceBold: {
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  activityTimeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activityTime: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityContentContainer: {
    flex: 1,
  },
  activityName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  activityDuration: {
    fontSize: 16,
    opacity: 0.7,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 10,
  },
  nutritionItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    padding: 16,
    borderRadius: 16,
    width: '30%',
  },
  nutritionLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  nutritionUnit: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  customButtonContainer: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HomeScreen;
