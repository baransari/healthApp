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
    const { theme } = useTheme();
    const themeAsAny = theme as any;
    
    const content = (
      <View style={styles.cardContent}>
        <View style={[styles.statsIconContainer, { backgroundColor: iconBackgroundColor }]}>
          <FontAwesomeIcon icon={icon} size={24} color="#fff" />
        </View>
        <Text style={[styles.statsValue, { color: themeAsAny.colors.text }]}>{value}</Text>
        <Text style={[styles.statsLabel, { color: themeAsAny.colors.text }]}>{label}</Text>
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
        <Text style={styles.progressText}>{progress}%</Text>
        {showDetails && (
          <View style={styles.customButtonContainer}>
            <Text style={styles.customButtonText}>Detaylar</Text>
          </View>
        )}
      </View>
    );

    if (onPress) {
      return (
        <View style={[styles.statsCard, { backgroundColor }]}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            {content}
          </TouchableOpacity>
        </View>
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
    const { theme } = useTheme();
    const themeAsAny = theme as any;
    const percentComplete = Math.round((completedWorkouts / totalWorkouts) * 100);
    return (
      <View style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
        <View style={styles.cardContent}>
          <View style={styles.sectionTitleContainer}>
            <FontAwesomeIcon icon={faDumbbell} size={24} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Antrenman İlerlemesi</Text>
          </View>

          <View style={styles.workoutProgressContainer}>
            <View style={styles.workoutProgressInfo}>
              <Text style={styles.workoutProgressText}>
                <Text style={styles.workoutProgressCount}>{completedWorkouts}</Text>/{totalWorkouts}{' '}
                tamamlandı
              </Text>
              <Text style={styles.workoutProgressPercentage}>{percentComplete}%</Text>
            </View>

            <View style={styles.workoutProgressBar}>
              <View
                style={[
                  styles.workoutProgressBarFill,
                  { width: `${Math.min(percentComplete, 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
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
    const { theme } = useTheme();
    const themeAsAny = theme as any;
    const percentComplete = Math.round((calories / caloriesGoal) * 100);
    const remaining = caloriesGoal - calories;
    return (
      <View style={[styles.card, styles.lastCard, { backgroundColor: themeAsAny.colors.surface }]}>
        <View style={styles.cardContent}>
          <View style={styles.sectionTitleContainer}>
            <FontAwesomeIcon icon={faUtensils} size={24} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Beslenme Durumu</Text>
          </View>

          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>Tüketilen</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.text }]}>{calories}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.textSecondary || '#666' }]}>kalori</Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>Kalan</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.text }]}>{remaining}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.textSecondary || '#666' }]}>kalori</Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>Hedef</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.text }]}>{caloriesGoal}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.textSecondary || '#666' }]}>kalori</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeAsAny.colors.background }]}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.welcomeText}>{user.name}!</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity>
              <View style={[styles.avatar, { backgroundColor: '#2f80ed' }]}>
                <Text style={{ color: '#fff', fontSize: 24 }}>{user.name?.charAt(0) || ''}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Streak Chip */}
          <Chip
            icon={({ size, color }: { size: number; color: string }) => (
              <FontAwesomeIcon icon={faFire} size={size} color={color} />
            )}
            style={styles.streakChip}
            textStyle={styles.streakChipText}
          >
            {user.streak} günlük seri!
          </Chip>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard
            backgroundColor="#E3F2FD"
            iconBackgroundColor="#1E88E5"
            icon={faWalking}
            value={user.steps || 0}
            label="Adım"
            progress={stepsProgress}
            onPress={() => navigation.navigate('StepTracker')}
          />
          <StatsCard
            backgroundColor="#FFECB3"
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
            backgroundColor="#E1F5FE"
            iconBackgroundColor="#03A9F4"
            icon={faWater}
            value={`${user.waterIntake || 0}L`}
            label="Su"
            progress={waterProgress}
            onPress={() => navigation.navigate('WaterTracker')}
          />
          <StatsCard
            backgroundColor="#E8EAF6"
            iconBackgroundColor="#3F51B5"
            icon={faBed}
            value={`${sleepHours}s`}
            label="Uyku"
            progress={sleepProgress}
            showDetails={false}
            onPress={() => navigation.navigate('SleepTracker')}
          />
        </View>

        {/* Workout Progress */}
        <WorkoutProgressCard
          completedWorkouts={user.completedWorkouts || 0}
          totalWorkouts={user.totalWorkouts || 0}
          primaryColor={themeAsAny.colors.primary}
          onPress={() => navigation.navigate('ExerciseTracker')}
        />

        {/* AI Health Advice */}
        <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <FontAwesomeIcon icon={faBrain} size={24} color={themeAsAny.colors.primary} />
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>AI Sağlık Tavsiyeleri</Text>
            </View>
            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faLightbulb} size={24} color="#FFC107" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  Bugün {user.stepsGoal || 0} adım hedefine yakınsın!{' '}
                  {(user.stepsGoal || 0) - (user.steps || 0)} adım daha at ve günlük hedefe ulaş.
                </Text>
              </View>
            </View>

            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faAppleAlt} size={24} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  Akşam yemeğinde protein açısından zengin gıdalar tüketmeyi düşünebilirsin.
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button mode="contained" style={[styles.actionButton, { backgroundColor: themeAsAny.colors.primary }]}>Tüm Tavsiyeleri Gör</Button>
          </Card.Actions>
        </Card>

        {/* Activity Schedule */}
        <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <FontAwesomeIcon icon={faCalendarCheck} size={24} color={themeAsAny.colors.primary} />
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Günlük Program</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityTimeContainer}>
                <Text style={[styles.activityTime, { color: themeAsAny.colors.text }]}>09:00</Text>
              </View>
              <View style={styles.activityContentContainer}>
                <Text style={[styles.activityName, { color: themeAsAny.colors.text }]}>Sabah Yürüyüşü</Text>
                <Text style={styles.activityDuration}>30 dakika</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityTimeContainer}>
                <Text style={[styles.activityTime, { color: themeAsAny.colors.text }]}>18:30</Text>
              </View>
              <View style={styles.activityContentContainer}>
                <Text style={[styles.activityName, { color: themeAsAny.colors.text }]}>Yoga</Text>
                <Text style={styles.activityDuration}>45 dakika</Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ExerciseTracker')}
              style={[styles.actionButton, { backgroundColor: themeAsAny.colors.primary }]}
            >
              Program Detayı
            </Button>
          </Card.Actions>
        </Card>

        {/* Integration Status - DEV ONLY */}
        <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <FontAwesomeIcon icon={faSync} size={24} color={themeAsAny.colors.primary} />
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>Entegrasyon Durumu (DEV)</Text>
            </View>
            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faWater} size={24} color="#03A9F4" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>Su Takibi:</Text> Redux Store'da{' '}
                  {((user.waterIntake || 0) * 1000).toFixed(0)}ml /{' '}
                  {((user.waterGoal || 0) * 1000).toFixed(0)}ml
                </Text>
              </View>
            </View>

            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faAppleAlt} size={24} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>Beslenme:</Text> Redux Store'da{' '}
                  {user.calories || 0} / {user.caloriesGoal || 0} kalori
                </Text>
              </View>
            </View>

            <View style={styles.adviceContainer}>
              <View style={styles.adviceIcon}>
                <FontAwesomeIcon icon={faDumbbell} size={24} color="#FF9800" />
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
            <Button mode="contained" onPress={() => null} style={[styles.actionButton, { backgroundColor: themeAsAny.colors.primary }]}>
              Geliştirici Bilgisi
            </Button>
          </Card.Actions>
        </Card>

        {/* Nutrition Status */}
        <NutritionCard
          calories={user.calories || 0}
          caloriesGoal={user.caloriesGoal || 0}
          primaryColor={themeAsAny.colors.primary}
          onPress={() => navigation.navigate('CalorieTracker')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#4285F4',
    elevation: 4,
    margin: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 16,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  streakChipText: {
    color: 'white',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    elevation: 2,
    padding: 12,
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workoutProgressContainer: {
    marginVertical: 8,
  },
  workoutProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutProgressText: {
    fontSize: 14,
    color: '#666',
  },
  workoutProgressCount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  workoutProgressPercentage: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  workoutProgressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  workoutProgressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  adviceContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  adviceIcon: {
    marginRight: 12,
  },
  adviceContent: {
    flex: 1,
  },
  adviceText: {
    fontSize: 14,
    color: '#333',
  },
  adviceBold: {
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  activityTimeContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  activityTime: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  activityContentContainer: {
    flex: 1,
  },
  activityName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  activityDuration: {
    fontSize: 14,
    color: '#666',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionUnit: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  customButtonContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#3F51B5',
    borderRadius: 4,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HomeScreen;
