import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Alert, useColorScheme } from 'react-native';
// Import from paperComponents utility
import {
  Card,
  Button,
  Divider,
  Chip,
  IconButton as PaperIconButton,
} from '../utils/paperComponents';
// FontAwesome ikonları
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faRunning,
  faDumbbell,
  faYinYang,
  faBalanceScale,
  faPlay,
  faPencil,
  faPlus,
  faXmark,
  faClock,
  faFire,
  faSignal,
  faCalendarDays,
  faEllipsisH,
  faHeartbeat,
  faStopwatch,
  faChartLine,
  faCheck,
  faTrash,
  faEdit,
  faCalendarAlt,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useExerciseTracker, WorkoutExercise } from '../hooks/useExerciseTracker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import {
  WorkoutPlan,
  WorkoutSession as ReduxWorkoutSession,
  WorkoutSessionExercise,
  Exercise as ReduxExercise,
} from '../store/exerciseTrackerSlice';
import AddExerciseModal from '../components/AddExerciseModal';
import EditWorkoutPlanModal from '../components/EditWorkoutPlanModal';
import { useTheme } from '../context/ThemeContext';

// Define navigation type
type ExerciseScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ExerciseTracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ExerciseScreenProps {
  navigation: ExerciseScreenNavigationProp;
}

// Ekrandaki gösterim için yerel Exercise tipi
interface Exercise {
  id: string;
  name: string;
  category: 'kardiyo' | 'kuvvet' | 'esneklik' | 'denge';
  duration: number; // minutes
  caloriesBurned: number;
  difficulty: 'kolay' | 'orta' | 'zor';
  description: string;
  imageUrl?: string;
  sets?: ExerciseSet[];
}

// Exercise set interface
interface ExerciseSet {
  weight: number;
  reps: number;
}

// Ekrandaki gösterim için yerel WorkoutSession tipi
interface WorkoutSession {
  id: string;
  date: string;
  name?: string;
  exercises: Exercise[];
  totalDuration: number;
  totalCalories: number;
}

// Custom IconButton component
interface IconButtonProps {
  icon: React.ReactNode;
  size?: number;
  onPress?: () => void;
  style?: object;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, size = 24, onPress, style }) => {
  return (
    <TouchableOpacity style={[{ padding: 8, borderRadius: 20 }, style]} onPress={onPress}>
      {icon}
    </TouchableOpacity>
  );
};

// Custom Badge component
interface BadgeProps {
  children: React.ReactNode;
  style?: object;
}

const Badge: React.FC<BadgeProps> = ({ children, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: '#FF3B30',
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        },
        style,
      ]}
    >
      <Text style={{ color: 'white', fontSize: 12 }}>{children}</Text>
    </View>
  );
};

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const actualDarkMode = isDarkMode ?? systemColorScheme === 'dark';
  
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newPlanModalVisible, setNewPlanModalVisible] = useState(false);
  const [editPlanModalVisible, setEditPlanModalVisible] = useState(false);
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | undefined>(undefined);

  const {
    exercises: storeExercises,
    workoutSessions: storeWorkoutSessions,
    workoutPlans: storeWorkoutPlans,
    createWorkoutPlan,
    modifyWorkoutPlan,
    createExercise,
    startWorkoutSession,
    getExercisesByCategory,
  } = useExerciseTracker();

  // Örnek egzersiz verileri
  const exerciseLibrary: Exercise[] = [
    {
      id: '1',
      name: 'Tempolu Yürüyüş',
      category: 'kardiyo',
      duration: 30,
      caloriesBurned: 180,
      difficulty: 'kolay',
      description:
        'Orta tempoda yürüyüş yaparak kalp sağlığınızı koruyun ve kalori yakın. Bu egzersiz kalp sağlığınızı ve dayanıklılığınızı geliştirir.',
    },
    {
      id: '2',
      name: 'Vücut Ağırlığıyla Squat',
      category: 'kuvvet',
      duration: 15,
      caloriesBurned: 120,
      difficulty: 'orta',
      description:
        'Bacak kaslarınızı güçlendirin. Ayaklar omuz genişliğinde açık, dizleri bükerek oturur pozisyona gelin ve kalkın.',
    },
    {
      id: '3',
      name: 'Yoga - Güneş Selamlaması',
      category: 'esneklik',
      duration: 20,
      caloriesBurned: 100,
      difficulty: 'orta',
      description:
        'Klasik yoga hareketleri serisi ile esneyin ve zihinsel gevşeme sağlayın. Sabah rutini için idealdir.',
    },
    {
      id: '4',
      name: 'HIIT Antrenmanı',
      category: 'kardiyo',
      duration: 25,
      caloriesBurned: 300,
      difficulty: 'zor',
      description:
        'Yüksek yoğunluklu interval antrenmanı ile kısa sürede maksimum kalori yakın. 30 saniye yoğun egzersiz, 10 saniye dinlenme şeklinde ilerler.',
    },
    {
      id: '5',
      name: 'Plank',
      category: 'kuvvet',
      duration: 10,
      caloriesBurned: 80,
      difficulty: 'orta',
      description:
        'Göbek ve sırt kaslarınızı güçlendirin. Dirsekler ve ayak parmakları üzerinde düz bir çizgi oluşturun ve pozisyonu koruyun.',
    },
    {
      id: '6',
      name: 'Bisiklet',
      category: 'kardiyo',
      duration: 40,
      caloriesBurned: 280,
      difficulty: 'orta',
      description:
        'Açık havada veya sabit bisikletle yapılan aerobik egzersiz. Bacak kaslarını güçlendirir ve kalp sağlığını destekler.',
    },
    {
      id: '7',
      name: 'Push-Up (Şınav)',
      category: 'kuvvet',
      duration: 15,
      caloriesBurned: 140,
      difficulty: 'orta',
      description:
        'Üst vücut kuvvetini artıran temel egzersiz. Göğüs, omuz ve kol kaslarını çalıştırır. Yeni başlayanlar için dizler yerde yapılabilir.',
    },
    {
      id: '8',
      name: 'Pilates - Temel Hareketler',
      category: 'esneklik',
      duration: 25,
      caloriesBurned: 120,
      difficulty: 'orta',
      description:
        'Vücut duruşunu düzeltmeye, esnekliği artırmaya ve çekirdek kasları güçlendirmeye odaklanan bir egzersiz sistemi.',
    },
    {
      id: '9',
      name: 'Koşu',
      category: 'kardiyo',
      duration: 30,
      caloriesBurned: 320,
      difficulty: 'zor',
      description:
        'Dayanıklılık ve kalp sağlığı için ideal egzersiz. Tempolu koşu yaparak kardiyo kapasitenizi artırın ve stres atın.',
    },
    {
      id: '10',
      name: 'Burpees',
      category: 'kuvvet',
      duration: 10,
      caloriesBurned: 150,
      difficulty: 'zor',
      description:
        'Tam vücut egzersizi olan burpees, hem kardiyo hem de kuvvet çalışması sağlar. Squat, plank, şınav ve zıplama hareketlerini içerir.',
    },
  ];

  // Format WorkoutPlans data properly
  const formatWorkoutPlans = (plans: WorkoutPlan[]): any[] => {
    if (!plans || !Array.isArray(plans)) return [];
    
    return plans.map(plan => ({
      ...plan,
      exercises: plan.exercises.map(e => {
        // Find exercise detail from the store
        const exerciseDetail = storeExercises.find(
          (storeEx: ReduxExercise) => storeEx.id === e.exerciseId,
        );
        if (exerciseDetail) {
          return {
            id: exerciseDetail.id,
            name: exerciseDetail.name,
            category: exerciseDetail.category,
            duration: e.recommendedDuration || 30,
            caloriesBurned: exerciseDetail.caloriesBurnedPerMinute * (e.recommendedDuration || 30),
            difficulty: 'orta', // Default value
            description: exerciseDetail.description || '',
          };
        }
        return e;
      }),
      frequency: plan.frequency || 'Haftada 3 gün',
      duration: plan.exercises.reduce((total, e) => total + (e.recommendedDuration || 30), 0),
    }));
  };

  // Format WorkoutSessions data properly
  const formatWorkoutSessions = (sessions: ReduxWorkoutSession[]): WorkoutSession[] => {
    if (!sessions || !Array.isArray(sessions)) return [];
    
    return sessions.map(session => ({
      ...session,
      totalCalories: session.totalCaloriesBurned,
      exercises: session.exercises.map(e => {
        const exerciseDetail = storeExercises.find(
          (storeEx: ReduxExercise) => storeEx.id === e.exerciseId,
        );
        if (exerciseDetail) {
          return {
            id: e.exerciseId,
            name: e.exerciseName || exerciseDetail.name,
            category: exerciseDetail.category as any,
            duration: e.duration,
            caloriesBurned: e.caloriesBurned || exerciseDetail.caloriesBurnedPerMinute * e.duration,
            difficulty: 'orta' as any,
            description: exerciseDetail.description || '',
          };
        }
        return {
          id: e.exerciseId,
          name: e.exerciseName || 'Egzersiz',
          category: 'kardiyo' as any,
          duration: e.duration,
          caloriesBurned: e.caloriesBurned || 0,
          difficulty: 'orta' as any,
          description: '',
        };
      }),
    }));
  };

  // Use the exercise data from store or fallback to defaults
  const workoutPlansData = storeWorkoutPlans?.length > 0
    ? formatWorkoutPlans(storeWorkoutPlans)
    : [
        {
          id: 'plan1',
          name: 'Başlangıç Seviyesi Fitness',
          description: 'Fitness yolculuğunuza başlamak için ideal program',
          exercises: exerciseLibrary.slice(0, 2),
          days: ['Pazartesi', 'Çarşamba', 'Cuma'],
          duration: 40,
        },
        // ... other default plans
      ];

  const workoutHistoryData = storeWorkoutSessions?.length > 0
    ? formatWorkoutSessions(storeWorkoutSessions)
    : [
        {
          id: 'session1',
          date: '2023-11-10',
          exercises: exerciseLibrary.slice(0, 2),
          totalDuration: 40,
          totalCalories: 260,
        },
        // ... other default sessions
      ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kardiyo':
        return faRunning;
      case 'kuvvet':
        return faDumbbell;
      case 'esneklik':
        return faYinYang;
      case 'denge':
        return faBalanceScale;
      default:
        return faRunning;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'kolay':
        return '#4CAF50';
      case 'orta':
        return '#FF9800';
      case 'zor':
        return '#F44336';
      default:
        return '#ccc';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  };

  const showExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setExerciseModalVisible(true);
  };

  // Start a workout properly with Redux integration
  const startWorkout = (plan: { name: string; exercises: any[] }) => {
    try {
      const exercises = plan.exercises.map((exercise: any) => ({
        exerciseId: exercise.id || exercise.exerciseId,
        exerciseName: exercise.name || 'Egzersiz',
        duration: exercise.duration || exercise.recommendedDuration || 30,
        caloriesBurned:
          (exercise.caloriesBurned || exercise.caloriesBurnedPerMinute || 5) *
          (exercise.duration || exercise.recommendedDuration || 30),
        sets: exercise.sets || exercise.recommendedSets || 3,
      }));

      const session = startWorkoutSession(exercises);
      Alert.alert(`"${plan.name}" programı başlatıldı!`);
    } catch (error) {
      console.error("Workout başlatılırken hata oluştu:", error);
      Alert.alert("Hata", "Antrenman başlatılırken bir hata oluştu.");
    }
  };

  // Add new exercise with proper error handling
  const handleAddExercise = (exerciseData: {
    name: string;
    category: string;
    caloriesBurnedPerMinute: number;
    description: string;
  }) => {
    try {
      createExercise(exerciseData);
      setAddExerciseModalVisible(false);
      Alert.alert('Başarılı', 'Yeni egzersiz başarıyla eklendi!');
    } catch (error) {
      console.error("Egzersiz eklenirken hata oluştu:", error);
      Alert.alert("Hata", "Egzersiz eklenirken bir hata oluştu.");
    }
  };

  // Create a workout plan with proper error handling
  const handleCreatePlan = (planData: Omit<WorkoutPlan, 'id'>) => {
    try {
      createWorkoutPlan(planData);
      setNewPlanModalVisible(false);
      Alert.alert('Başarılı', 'Yeni program oluşturuldu!');
    } catch (error) {
      console.error("Program oluşturulurken hata oluştu:", error);
      Alert.alert("Hata", "Program oluşturulurken bir hata oluştu.");
    }
  };

  // Edit a workout plan with proper error handling
  const handleEditPlan = (planData: Omit<WorkoutPlan, 'id'>) => {
    try {
      if (selectedPlan) {
        modifyWorkoutPlan({
          ...planData,
          id: selectedPlan.id,
        });
        setEditPlanModalVisible(false);
        Alert.alert('Başarılı', 'Program güncellendi!');
      } else {
        throw new Error("No selected plan to edit");
      }
    } catch (error) {
      console.error("Program güncellenirken hata oluştu:", error);
      Alert.alert("Hata", "Program güncellenirken bir hata oluştu.");
    }
  };

  // Handle navigation to the exercise details screen
  const navigateToExerciseDetails = (exerciseId: string) => {
    if (navigation && exerciseId) {
      navigation.navigate('ExerciseDetails', { exerciseId });
    }
  };

  const openEditPlanModal = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setEditPlanModalVisible(true);
  };

  const createNewPlan = () => {
    setSelectedPlan(undefined);
    setNewPlanModalVisible(true);
  };

  // Render workout plans with proper theme integration
  const renderWorkoutPlans = () => (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Önerilen Programlar</Text>
      {workoutPlansData && workoutPlansData.map(plan => (
        <Card key={plan.id} style={[styles.planCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.planTitle, { color: theme.colors.onSurface }]}>{plan.name}</Text>
            <Text style={[styles.planDescription, { color: theme.colors.onSurfaceVariant }]}>
              {plan.description}
            </Text>

            <View style={[styles.planDetailRow, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={styles.planDetailItem}>
                <FontAwesomeIcon icon={faClock} size={18} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.planDetailText, { color: theme.colors.onSurfaceVariant }]}>
                  {plan.duration || '45'} dakika
                </Text>
              </View>
              <View style={styles.planDetailItem}>
                <FontAwesomeIcon 
                  icon={faCalendarDays} 
                  size={18} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.planDetailText, { color: theme.colors.onSurfaceVariant }]}>
                  {plan.frequency || 'Haftada 3 gün'}
                </Text>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

            <Text style={[styles.exercisesTitle, { color: theme.colors.onSurface }]}>
              Egzersizler:
            </Text>
            {(plan.exercises || []).map((exercise: any) => (
              <TouchableOpacity
                key={exercise.id || exercise.exerciseId}
                style={[
                  styles.exerciseItem, 
                  { borderBottomColor: theme.colors.outline }
                ]}
                onPress={() => showExerciseDetails(exercise)}
              >
                <View style={styles.exerciseRow}>
                  <View style={[
                    styles.exerciseIconContainer, 
                    { 
                      backgroundColor: actualDarkMode ? theme.colors.surfaceVariant : '#e6f2ff',
                      borderColor: theme.colors.primary
                    }
                  ]}>
                    <FontAwesomeIcon
                      icon={getCategoryIcon(exercise.category || 'kardiyo')}
                      size={20}
                      color={theme.colors.primary}
                      style={styles.exerciseIcon}
                    />
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={[styles.exerciseName, { color: theme.colors.onSurface }]}>
                      {exercise.name}
                    </Text>
                    <Text style={[styles.exerciseDetail, { color: theme.colors.onSurfaceVariant }]}>
                      {exercise.duration || exercise.recommendedDuration || '20'} dk •
                      {exercise.caloriesBurned ||
                        (exercise.caloriesBurnedPerMinute && exercise.duration
                          ? exercise.caloriesBurnedPerMinute * exercise.duration
                          : '100')}{' '}
                      kalori
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.difficultyIndicator,
                    { backgroundColor: getDifficultyColor(exercise.difficulty || 'orta') },
                  ]}
                >
                  <Text style={styles.difficultyText}>{exercise.difficulty || 'orta'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]} 
              onPress={() => startWorkout(plan)}
            >
              <FontAwesomeIcon 
                icon={faPlay} 
                size={20} 
                color={theme.colors.onPrimary} 
                style={styles.buttonIcon} 
              />
              <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
                PROGRAMA BAŞLA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.editButtonContainer, 
                { borderColor: theme.colors.primary }
              ]}
              onPress={() => openEditPlanModal(plan)}
            >
              <FontAwesomeIcon
                icon={faPencil}
                size={20}
                color={theme.colors.primary}
                style={styles.buttonIcon}
              />
              <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>
                DÜZENLE
              </Text>
            </TouchableOpacity>
          </Card.Actions>
        </Card>
      ))}

      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]} 
        onPress={createNewPlan}
      >
        <FontAwesomeIcon 
          icon={faPlus} 
          size={20} 
          color={theme.colors.onPrimary} 
          style={styles.buttonIcon} 
        />
        <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
          YENİ PROGRAM OLUŞTUR
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderWorkoutHistory = () => (
    <View style={styles.workoutHistoryContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Geçmiş Antrenmanlar
      </Text>
      {workoutHistoryData.map((session: WorkoutSession, index: number) => (
        <View 
          key={index} 
          style={[
            styles.sessionContainer, 
            { 
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.shadow,
            }
          ]}
        >
          <View style={styles.sessionHeader}>
            <View style={styles.completedIndicator} />
            <Text style={[styles.sessionDate, { color: theme.colors.onSurface }]}>
              {formatDate(session.date)}
              {session.name ? ` - ${session.name}` : ''}
            </Text>
          </View>
          <View style={styles.exerciseList}>
            {session.exercises.map((exercise: Exercise, exIndex: number) => (
              <View 
                key={exIndex} 
                style={[
                  styles.historyExerciseItem, 
                  { backgroundColor: theme.colors.surfaceVariant }
                ]}
              >
                <Text style={[styles.exerciseName, { color: theme.colors.onSurface }]}>
                  {exercise.name}
                </Text>
                <View style={styles.setsContainer}>
                  {exercise.sets?.map((set, setIndex) => (
                    <Chip 
                      key={setIndex} 
                      style={[styles.setChip, { backgroundColor: theme.colors.primary }]} 
                      textStyle={[styles.setChipText, { color: theme.colors.onPrimary }]}
                    >
                      {set.weight}kg x {set.reps}
                    </Chip>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          Egzersiz Programları
        </Text>
      </View>

      <View style={[
        styles.tabContainer, 
        { 
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outline 
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === 'plans' && [styles.activeTab, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('plans')}
        >
          <Text style={[
            styles.tabText, 
            { color: theme.colors.onSurfaceVariant },
            activeTab === 'plans' && { color: theme.colors.primary, fontWeight: 'bold' }
          ]}>
            Programlar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === 'history' && [styles.activeTab, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[
            styles.tabText, 
            { color: theme.colors.onSurfaceVariant },
            activeTab === 'history' && { color: theme.colors.primary, fontWeight: 'bold' }
          ]}>
            Geçmiş
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]}>
        {activeTab === 'plans' ? renderWorkoutPlans() : renderWorkoutHistory()}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={exerciseModalVisible}
        statusBarTranslucent
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        {selectedExercise && (
          <View style={styles.modalContainer}>
            <View style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.shadow,
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                  {selectedExercise.name}
                </Text>
                <TouchableOpacity onPress={() => setExerciseModalVisible(false)}>
                  <FontAwesomeIcon icon={faXmark} size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
              </View>

              <View style={[
                styles.exerciseDetails, 
                { backgroundColor: theme.colors.surfaceVariant }
              ]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon icon={faClock} size={20} color={theme.colors.primary} />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.duration} dakika
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon icon={faFire} size={20} color="#FF5722" />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.caloriesBurned} kalori
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon
                      icon={getCategoryIcon(selectedExercise.category)}
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.category === 'kardiyo'
                        ? 'Kardiyo'
                        : selectedExercise.category === 'kuvvet'
                        ? 'Kuvvet'
                        : selectedExercise.category === 'esneklik'
                        ? 'Esneklik'
                        : 'Denge'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon icon={faSignal} size={20} color={theme.colors.primary} />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.difficulty === 'kolay'
                        ? 'Kolay'
                        : selectedExercise.difficulty === 'orta'
                        ? 'Orta'
                        : 'Zor'}
                    </Text>
                    <View
                      style={[
                        styles.modalDifficultyIndicator,
                        {
                          backgroundColor: getDifficultyColor(selectedExercise.difficulty),
                        },
                      ]}
                    >
                      <Text style={styles.difficultyText}>{selectedExercise.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Divider style={[styles.modalDivider, { backgroundColor: theme.colors.outline }]} />

              <ScrollView style={styles.modalScrollContent}>
                <Text style={[styles.descriptionTitle, { color: theme.colors.onSurface }]}>
                  Açıklama
                </Text>
                <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                  {selectedExercise.description}
                </Text>

                <Text style={[styles.tipsTitle, { color: theme.colors.onSurface }]}>İpuçları</Text>
                <Text style={[styles.tipsText, { color: theme.colors.onSurfaceVariant }]}>
                  Bu egzersizi yaparken doğru form kullanmaya özen gösterin. Nefes almayı unutmayın
                  ve egzersiz sırasında sıvı tüketmeyi ihmal etmeyin.
                </Text>
              </ScrollView>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setExerciseModalVisible(false)}
              >
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>KAPAT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={addExerciseModalVisible}
        onClose={() => setAddExerciseModalVisible(false)}
        onSave={handleAddExercise}
      />

      {/* New Plan Modal */}
      <EditWorkoutPlanModal
        visible={newPlanModalVisible}
        onClose={() => setNewPlanModalVisible(false)}
        onSave={handleCreatePlan}
        exercises={storeExercises}
      />

      {/* Edit Plan Modal */}
      <EditWorkoutPlanModal
        visible={editPlanModalVisible}
        onClose={() => setEditPlanModalVisible(false)}
        onSave={handleEditPlan}
        plan={selectedPlan}
        exercises={storeExercises}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setAddExerciseModalVisible(true)}
      >
        <FontAwesomeIcon icon={faPlus} size={24} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  planDetailRow: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
  },
  planDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 4,
  },
  planDetailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 13,
  },
  divider: {
    marginVertical: 12,
  },
  exercisesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  exerciseIcon: {},
  exerciseContent: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontWeight: 'bold',
  },
  exerciseDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  difficultyIndicator: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  editButtonContainer: {
    borderColor: '#4285F4',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4285F4',
    textAlign: 'center',
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: '#4285F4',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginLeft: 5,
  },
  addButton: {
    backgroundColor: '#4285F4',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  workoutHistoryContainer: {
    marginTop: 16,
  },
  sessionContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  completedIndicator: {
    width: 8,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 10,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
    flexWrap: 'wrap',
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalScrollContent: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: '#4285F4',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4285F4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  actionButton: {
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  setChip: {
    backgroundColor: '#4285F4',
    marginRight: 4,
    marginBottom: 4,
    height: 26,
  },
  setChipText: {
    color: 'white',
    fontSize: 12,
  },
  modalDifficultyIndicator: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
});

export default ExerciseScreen;
