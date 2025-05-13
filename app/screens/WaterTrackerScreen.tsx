import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import useWaterTracker from '../hooks/useWaterTracker';
import { WaterEntry } from '../store/waterTrackerSlice';
import { useUser } from '../context/UserContext';
import useTheme from '../hooks/useTheme';
import type { ExtendedMD3Theme } from '../types';

// Import components from paperComponents utility
import { Card, Divider, IconButton, Title, ProgressBar, FAB } from '../utils/paperComponents';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faWater,
  faAdjust,
  faPlus,
  faMinus,
  faXmark,
  faCheck,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

type WaterTrackerScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'WaterTracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type WaterTrackerScreenProps = {
  navigation: WaterTrackerScreenNavigationProp;
};

const WaterTrackerScreen: React.FC<WaterTrackerScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(250);

  // useWaterTracker hook kullanımı
  const {
    waterGoal,
    waterEntries,
    updateWaterGoal,
    addWater,
    removeEntry,
    totalIntake,
    percentage,
  } = useWaterTracker();

  const { user } = useUser();

  console.log('WaterTracker - Current totalIntake:', totalIntake, 'ml (', totalIntake / 1000, 'L)');
  // Only log user waterIntake if user exists
  if (user) {
    console.log('WaterTracker - HomeScreen waterIntake:', user.waterIntake, 'L');
  }

  // Su eklemek için fonksiyon
  const handleAddWaterEntry = () => {
    addWater(selectedAmount);
    setModalVisible(false);
    console.log(
      'Su eklendi:',
      selectedAmount,
      'ml - Yeni toplam:',
      totalIntake + selectedAmount,
      'ml',
    );
  };

  // Su kaydını silmek için fonksiyon
  const handleRemoveWaterEntry = (id: string) => {
    const entry = waterEntries.find(e => e.id === id);
    removeEntry(id);
    if (entry) {
      console.log(
        'Su silindi:',
        entry.amount,
        'ml - Yeni toplam:',
        totalIntake - entry.amount,
        'ml',
      );
    }
  };

  // Su hedefini güncellemek için (ileride bir ayarlar modalı eklenebilir)
  const handleGoalUpdate = (goal: number) => {
    updateWaterGoal(goal);
  };

  // Bugünün tarihini format olarak döndür
  const getFormattedDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Kayıt zamanını biçimlendir
  const getFormattedTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Su Takibi</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon={() => <FontAwesomeIcon icon={faAdjust} color="white" size={24} />}
            size={24}
            onPress={() => toggleTheme()}
          />
          <View style={[styles.waterCircle, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.waterValue, { color: theme.colors.primary }]}>
              {(totalIntake / 1000).toFixed(1)}
            </Text>
            <Text style={[styles.waterLabel, { color: theme.colors.primary }]}>litre</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Title style={{ color: theme.colors.onSurface }}>
                  Günlük Hedef: {waterGoal / 1000}L
                </Title>
                <Text style={[styles.progressText, { color: theme.colors.primary }]}>
                  {totalIntake} / {waterGoal} ml
                </Text>
              </View>
              <ProgressBar
                progress={percentage / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>Hızlı Ekle</Title>
            <View style={styles.quickAddContainer}>
              {[150, 250, 330, 500].map(amount => (
                <TouchableOpacity
                  key={`quick-add-${amount}`}
                  style={[
                    styles.amountButton,
                    { backgroundColor: theme.colors.surfaceVariant },
                    selectedAmount === amount ? { backgroundColor: theme.colors.primary } : null,
                  ]}
                  onPress={() => setSelectedAmount(amount)}
                >
                  <Text
                    style={[
                      styles.amountButtonText,
                      { color: theme.colors.onSurface },
                      selectedAmount === amount ? { color: 'white' } : null,
                    ]}
                  >
                    {amount} ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={[styles.customAmountButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.customAmountButtonText}>Özel Miktar</Text>
            </Pressable>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>Bugünkü Kayıtlar</Title>
            <Divider style={styles.divider} />

            {waterEntries
              .slice()
              .sort(
                (a: WaterEntry, b: WaterEntry) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
              )
              .map((entry: WaterEntry) => (
                <View
                  key={entry.id}
                  style={[styles.entryItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                >
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryAmount, { color: theme.colors.onSurface }]}>
                      {entry.amount} ml
                    </Text>
                    <Text style={[styles.entryTime, { color: theme.colors.onSurfaceVariant }]}>
                      {getFormattedTime(entry.timestamp)}
                    </Text>
                  </View>
                  <IconButton
                    icon={() => (
                      <FontAwesomeIcon icon={faTrash} color={theme.colors.error} size={20} />
                    )}
                    size={20}
                    onPress={() => handleRemoveWaterEntry(entry.id)}
                  />
                </View>
              ))}

            {waterEntries.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                Bugün henüz su kaydı eklenmemiş.
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Title style={{ color: theme.colors.onSurface }}>Özel Miktar Ekle</Title>
            <View style={styles.customAmountInput}>
              <Pressable
                onPress={() => setSelectedAmount(Math.max(50, selectedAmount - 50))}
                style={[styles.amountControlButton, { backgroundColor: theme.colors.primary }]}
              >
                <FontAwesomeIcon icon={faMinus} size={18} color="white" />
              </Pressable>
              <Text style={[styles.customAmountText, { color: theme.colors.onSurface }]}>
                {selectedAmount} ml
              </Text>
              <Pressable
                onPress={() => setSelectedAmount(selectedAmount + 50)}
                style={[styles.amountControlButton, { backgroundColor: theme.colors.primary }]}
              >
                <FontAwesomeIcon icon={faPlus} size={18} color="white" />
              </Pressable>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.colors.primary },
                ]}
              >
                <FontAwesomeIcon icon={faXmark} size={18} color={theme.colors.primary} />
                <Text style={[styles.modalButtonText, { color: theme.colors.primary }]}>İptal</Text>
              </Pressable>
              <Pressable
                onPress={handleAddWaterEntry}
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <FontAwesomeIcon icon={faCheck} size={18} color="white" />
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Ekle</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FAB
        icon={() => <FontAwesomeIcon icon={faPlus} color="white" size={24} />}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  waterCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  waterValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  waterLabel: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  progressContainer: {
    padding: 4,
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
  quickAddContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  amountButton: {
    width: '48%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customAmountButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 6,
  },
  customAmountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  entryInfo: {
    flexDirection: 'column',
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryTime: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
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
    borderRadius: 12,
    alignItems: 'center',
  },
  customAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  amountControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAmountText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {},
  modalButtonText: {
    fontWeight: 'bold',
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default WaterTrackerScreen;
