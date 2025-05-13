import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import {
  Card,
  Button,
  Divider,
  ProgressBar,
  useTheme,
  IconButton,
  FAB,
  Text,
  Title,
  Paragraph,
} from '../utils/paperComponents';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../navigation/types';
import useStepTracker from '../hooks/useStepTracker';
// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faRulerHorizontal,
  faFire,
  faClock,
  faCircleExclamation,
  faPlus,
  faMinus,
  faCheck,
  faClose,
  faWalking,
  faPersonWalking,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';
import type { ExtendedMD3Theme } from '../types';
// Redux hooks'ları özelleştirilmiş tiplerle doğrudan import ediyoruz
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';

// Type-safe hooks oluşturuyoruz
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector = useSelector as (selector: (state: RootState) => any) => any;

// Create a simple tab param list for StepTracker
type StepTabParamList = {
  StepTracker: undefined;
};

type StepTrackerScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StepTabParamList, 'StepTracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type StepTrackerScreenProps = {
  navigation: StepTrackerScreenNavigationProp;
};

const StepTrackerScreen: React.FC<StepTrackerScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [goalModalVisible, setGoalModalVisible] = useState<boolean>(false);
  const [addStepsModalVisible, setAddStepsModalVisible] = useState<boolean>(false);
  const [newGoal, setNewGoal] = useState<number>(10000);
  const [stepsToAdd, setStepsToAdd] = useState<number>(500);

  // useStepTracker hook kullanımı
  const { dailySteps, stepGoal, isStepAvailable, updateGoal, addSteps, stepPercentage } =
    useStepTracker();

  const { user } = useUser();

  // Adım hedefini güncelle
  const handleUpdateGoal = () => {
    updateGoal(newGoal);
    setGoalModalVisible(false);
  };

  // Manuel adım ekleme
  const handleAddSteps = () => {
    addSteps(stepsToAdd);
    setAddStepsModalVisible(false);
  };

  // Kalan adımları hesapla
  const remainingSteps = Math.max(0, stepGoal - dailySteps);

  // Yakılan kalorileri yaklaşık olarak hesapla (70 kg'lık biri için ortalama)
  const calculateCalories = (steps: number) => {
    // Ortalama olarak, 1 adım yaklaşık 0.04 kalori yakımına karşılık gelir
    return Math.round(steps * 0.04);
  };

  // Kilometre cinsinden mesafeyi hesapla (ortalama adım uzunluğu 0.75 metre)
  const calculateDistance = (steps: number) => {
    const meters = steps * 0.75;
    return (meters / 1000).toFixed(2);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Adım Takibi</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon={() => <FontAwesomeIcon icon={faCog} color="white" size={24} />}
            size={24}
            onPress={() => setGoalModalVisible(true)}
            style={{ marginRight: 8 }}
          />
          <View style={[styles.stepsCircle, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.stepsValue, { color: theme.colors.primary }]}>
              {dailySteps.toLocaleString()}
            </Text>
            <Text style={[styles.stepsLabel, { color: theme.colors.primary }]}>adım</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Title style={{ color: theme.colors.onSurface }}>
                  Günlük Hedef: {stepGoal.toLocaleString()} adım
                </Title>
                <Text style={[styles.progressText, { color: theme.colors.primary }]}>
                  {dailySteps.toLocaleString()} / {stepGoal.toLocaleString()}
                </Text>
              </View>
              <ProgressBar
                progress={stepPercentage / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.remainingSteps}>
                {remainingSteps > 0
                  ? `${remainingSteps.toLocaleString()} adım kaldı`
                  : 'Hedef tamamlandı!'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>Bugünkü İstatistikler</Title>
            <Divider style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <FontAwesomeIcon icon={faRulerHorizontal} size={32} color={theme.colors.primary} />
                <Text style={styles.statValue}>{calculateDistance(dailySteps)} km</Text>
                <Text style={styles.statLabel}>Mesafe</Text>
              </View>

              <View style={styles.statItem}>
                <FontAwesomeIcon icon={faFire} size={32} color="#FF9800" />
                <Text style={styles.statValue}>{calculateCalories(dailySteps)}</Text>
                <Text style={styles.statLabel}>Kalori</Text>
              </View>

              <View style={styles.statItem}>
                <FontAwesomeIcon icon={faClock} size={32} color="#4CAF50" />
                <Text style={styles.statValue}>{Math.round(dailySteps / 100)}</Text>
                <Text style={styles.statLabel}>Dakika</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>Haftalık Özet</Title>
            <Paragraph>
              Bu özellik yakında eklenecek. Haftalık adım verilerinizi burada görebileceksiniz.
            </Paragraph>
          </Card.Content>
        </Card>

        {!isStepAvailable && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.warningContainer}>
                <FontAwesomeIcon icon={faCircleExclamation} size={32} color={theme.colors.error} />
                <View style={styles.warningContent}>
                  <Title style={{ color: theme.colors.error }}>Sensör Erişilemez</Title>
                  <Paragraph>
                    Adım sayar sensörüne erişilemiyor. Bu cihazda adım sensörü bulunmayabilir veya
                    izin gerekebilir.
                  </Paragraph>
                  <Paragraph style={{ fontStyle: 'italic', marginTop: 8 }}>
                    Uygulama şu an simülasyon modunda çalışıyor. Manuel olarak adım
                    ekleyebilirsiniz.
                  </Paragraph>
                  <Button
                    mode="contained"
                    onPress={() => setAddStepsModalVisible(true)}
                    style={{ marginTop: 12, backgroundColor: theme.colors.primary }}
                    icon={({ size, color }: { size: number; color: string }) => (
                      <FontAwesomeIcon icon={faPlus} size={size} color={color} />
                    )}
                  >
                    Manuel Adım Ekle
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Adım hedefi modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Title style={{ color: theme.colors.onSurface }}>Adım Hedefini Ayarla</Title>
            <View style={styles.goalInputContainer}>
              <Button
                mode="contained"
                onPress={() => setNewGoal(Math.max(1000, newGoal - 1000))}
                style={[styles.goalControlButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faMinus} size={size} color={color} />
                )}
              >
                -
              </Button>
              <Text style={[styles.goalText, { color: theme.colors.onSurface }]}>
                {newGoal.toLocaleString()}
              </Text>
              <Button
                mode="contained"
                onPress={() => setNewGoal(newGoal + 1000)}
                style={[styles.goalControlButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faPlus} size={size} color={color} />
                )}
              >
                +
              </Button>
            </View>
            <View style={styles.goalPresets}>
              {[5000, 7500, 10000, 12500, 15000].map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    { borderColor: theme.colors.primary },
                    newGoal === preset ? { backgroundColor: theme.colors.primaryContainer } : null,
                  ]}
                  onPress={() => setNewGoal(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: theme.colors.primary },
                      newGoal === preset ? { fontWeight: 'bold' } : null,
                    ]}
                  >
                    {preset.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setGoalModalVisible(false)}
                style={styles.modalButton}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faClose} size={size} color={color} />
                )}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateGoal}
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faCheck} size={size} color={color} />
                )}
              >
                Kaydet
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manuel adım ekleme modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addStepsModalVisible}
        onRequestClose={() => setAddStepsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Title style={{ color: theme.colors.onSurface }}>Manuel Adım Ekle</Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: 16 }}>
              Yürüyüş, koşu veya diğer aktivitelerden elde ettiğiniz adımları manuel olarak ekleyin.
            </Paragraph>
            <View style={styles.goalInputContainer}>
              <Button
                mode="contained"
                onPress={() => setStepsToAdd(Math.max(100, stepsToAdd - 100))}
                style={[styles.goalControlButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faMinus} size={size} color={color} />
                )}
              >
                -
              </Button>
              <Text style={[styles.goalText, { color: theme.colors.onSurface }]}>
                {stepsToAdd.toLocaleString()}
              </Text>
              <Button
                mode="contained"
                onPress={() => setStepsToAdd(stepsToAdd + 100)}
                style={[styles.goalControlButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faPlus} size={size} color={color} />
                )}
              >
                +
              </Button>
            </View>
            <View style={styles.goalPresets}>
              {[500, 1000, 2000, 5000, 10000].map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    { borderColor: theme.colors.primary },
                    stepsToAdd === preset
                      ? { backgroundColor: theme.colors.primaryContainer }
                      : null,
                  ]}
                  onPress={() => setStepsToAdd(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: theme.colors.primary },
                      stepsToAdd === preset ? { fontWeight: 'bold' } : null,
                    ]}
                  >
                    {preset.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setAddStepsModalVisible(false)}
                style={styles.modalButton}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faClose} size={size} color={color} />
                )}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleAddSteps}
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faCheck} size={size} color={color} />
                )}
              >
                Ekle
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manuel adım eklemek için FAB */}
      <FAB
        icon={() => <FontAwesomeIcon icon={faPersonWalking} color="white" size={22} />}
        style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setAddStepsModalVisible(true)}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  stepsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepsLabel: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  remainingSteps: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  divider: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  statValue: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
  },
  warningContent: {
    flex: 1,
    marginLeft: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    width: '100%',
  },
  goalControlButton: {
    minWidth: 50,
  },
  goalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 100,
    textAlign: 'center',
  },
  goalPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    width: '48%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default StepTrackerScreen;
