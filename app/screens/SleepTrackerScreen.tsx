import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from '../utils/paperComponents';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../store';
import { RootState } from '../store';
import {
  addSleepEntry,
  loadSleepData,
  setSleepGoal,
  setSleepEntries,
  SleepEntry,
} from '../store/sleepTrackerSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBed, faPlus, faMoon, faSun, faClock } from '@fortawesome/free-solid-svg-icons';
import StorageService from '../services/StorageService';
import { useFocusEffect } from '@react-navigation/native';
import useTheme from '../hooks/useTheme';

interface SleepTrackerScreenProps {
  navigation: any;
}

const SleepTrackerScreen: React.FC<SleepTrackerScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { entries, lastSleep, averageDuration, sleepGoal, loading } = useAppSelector(
    (state: RootState) => state.sleepTracker,
  );
  
  const { theme, isDarkMode } = useTheme();
  const themeAsAny = theme as any;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newSleepEntry, setNewSleepEntry] = useState<Partial<SleepEntry>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '23:00',
    endTime: '07:00',
    duration: 8,
    quality: 'good',
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Ekran her odaklandığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      console.log('SleepTrackerScreen is now focused, loading data...');
      dispatch(loadSleepData());
      return () => {
        // Ekrandan ayrılınca yapılacak temizleme işlemi
        console.log('SleepTrackerScreen is unfocused');
      };
    }, [dispatch]),
  );

  // Komponent mount olduğunda verileri yükle
  useEffect(() => {
    // Load sleep data when component mounts
    dispatch(loadSleepData());
  }, [dispatch]);

  const calculateAverageSleepDuration = () => {
    return averageDuration.toFixed(1);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'poor':
        return '#FF6B6B';
      case 'fair':
        return '#FFD166';
      case 'good':
        return '#06D6A0';
      case 'excellent':
        return '#118AB2';
      default:
        return '#ccc';
    }
  };

  const getQualityEmoji = (quality: string) => {
    switch (quality) {
      case 'poor':
        return '😴';
      case 'fair':
        return '😐';
      case 'good':
        return '😊';
      case 'excellent':
        return '😃';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  };

  // AI Öneri oluşturma
  const getSleepRecommendation = () => {
    const avgDuration = parseFloat(calculateAverageSleepDuration());

    if (avgDuration < 7) {
      return 'Uyku süreniz önerilen 7-9 saat aralığının altında. Uyku kalitenizi artırmak için daha erken yatmayı deneyebilirsiniz.';
    } else if (avgDuration > 9) {
      return 'Uyku süreniz önerilen 7-9 saat aralığının üzerinde. Aşırı uyku da yorgunluğa neden olabilir.';
    } else {
      return 'Uyku süreniz ideal aralıkta. Düzenli uyku saatlerinizi korumaya devam edin.';
    }
  };

  const handleAddSleepEntry = () => {
    try {
      // Validate input
      if (!newSleepEntry.startTime || !newSleepEntry.endTime) {
        Alert.alert('Hata', 'Yatış ve kalkış saatlerini girmelisiniz.');
        return;
      }

      // Calculate duration based on bed time and wake time
      const bedHour = parseInt(newSleepEntry.startTime?.split(':')[0] || '0');
      const bedMinute = parseInt(newSleepEntry.startTime?.split(':')[1] || '0');
      const wakeHour = parseInt(newSleepEntry.endTime?.split(':')[0] || '0');
      const wakeMinute = parseInt(newSleepEntry.endTime?.split(':')[1] || '0');

      let duration = wakeHour - bedHour + (wakeMinute - bedMinute) / 60;
      // If wake time is earlier than bed time, add 24 hours
      if (duration < 0) {
        duration += 24;
      } else if (duration > 24) {
        Alert.alert('Hata', 'Uyku süresi 24 saatten fazla olamaz.');
        return;
      }
      duration = parseFloat(duration.toFixed(2));

      // Bugünün tarihini YYYY-MM-DD formatında al
      const today = new Date().toISOString().split('T')[0];

      // Validate quality
      if (!newSleepEntry.quality) {
        Alert.alert('Hata', 'Uyku kalitesini seçmelisiniz.');
        return;
      }

      const entry: SleepEntry = {
        id: uuidv4(), // Benzersiz ID
        date: today, // Bugünün tarihi
        startTime: newSleepEntry.startTime || '23:00',
        endTime: newSleepEntry.endTime || '07:00',
        duration: duration,
        quality: (newSleepEntry.quality as 'poor' | 'fair' | 'good' | 'excellent') || 'good',
      };

      // Yeni kaydı Redux store'a ekle
      dispatch(addSleepEntry(entry));

      // Verileri yeniden yükle - reduxtan sonra async storage'da saklamak için
      setTimeout(() => {
        dispatch(loadSleepData());
      }, 300);

      setModalVisible(false);

      // Kullanıcıya detaylı geri bildirim göster
      Alert.alert(
        'Uyku Kaydı Eklendi',
        `${entry.startTime} - ${entry.endTime} arasında ${entry.duration.toFixed(
          1,
        )} saat uyku kaydedildi.`,
        [
          {
            text: 'Tamam',
            onPress: () => console.log('Sleep entry added confirmation'),
          },
        ],
      );

      // Reset form - bir sonraki giriş için hazırla
      setNewSleepEntry({
        date: today,
        startTime: '23:00',
        endTime: '07:00',
        duration: 8,
        quality: 'good',
      });
    } catch (error) {
      console.error('Uyku verisi eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Uyku verisi eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowStartTimePicker(Platform.OS === 'ios');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    setNewSleepEntry({ ...newSleepEntry, startTime: `${hours}:${minutes}` });
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowEndTimePicker(Platform.OS === 'ios');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    setNewSleepEntry({ ...newSleepEntry, endTime: `${hours}:${minutes}` });
  };

  // Render date picker based on platform
  const renderDateTimePicker = (
    visible: boolean,
    value: string,
    onChange: (event: any, date?: Date) => void,
  ) => {
    if (Platform.OS === 'ios') {
      // iOS her zaman gösterilir, modal içinde
      return visible ? (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (value || '').split(':');
            const date = new Date();
            date.setHours(parseInt(hours || '0'));
            date.setMinutes(parseInt(minutes || '0'));
            return date;
          })()}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onChange}
        />
      ) : null;
    } else {
      // Android için popup tarzında
      return visible ? (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (value || '').split(':');
            const date = new Date();
            date.setHours(parseInt(hours || '0'));
            date.setMinutes(parseInt(minutes || '0'));
            return date;
          })()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      ) : null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}>
      <View style={[styles.header, { backgroundColor: themeAsAny.colors.primary }]}>
        <Text style={styles.headerTitle}>Uyku Takibi</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
            <Card.Content>
              <Text style={{ color: themeAsAny.colors.onSurface }}>Yükleniyor...</Text>
            </Card.Content>
          </Card>
        ) : lastSleep ? (
          <Card style={[styles.sleepSummaryCard, { backgroundColor: themeAsAny.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: themeAsAny.colors.onSurface }}>Son Uyku Özeti</Title>
              <View style={styles.sleepSummary}>
                <View style={styles.sleepTime}>
                  <FontAwesomeIcon icon={faMoon} size={24} color={themeAsAny.colors.primary} />
                  <Text style={[styles.timeLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Yatış</Text>
                  <Text style={[styles.timeValue, { color: themeAsAny.colors.onSurface }]}>{lastSleep.startTime}</Text>
                </View>
                <View style={styles.sleepDuration}>
                  <Text style={[styles.durationValue, { color: themeAsAny.colors.primary }]}>{lastSleep.duration}s</Text>
                  <FontAwesomeIcon icon={faBed} size={32} color={themeAsAny.colors.primary} />
                </View>
                <View style={styles.sleepTime}>
                  <FontAwesomeIcon icon={faSun} size={24} color={themeAsAny.colors.primary} />
                  <Text style={[styles.timeLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Kalkış</Text>
                  <Text style={[styles.timeValue, { color: themeAsAny.colors.onSurface }]}>{lastSleep.endTime}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.qualityIndicator,
                  { backgroundColor: getQualityColor(lastSleep.quality) },
                ]}
              >
                <Text style={styles.qualityText}>
                  {getQualityEmoji(lastSleep.quality)} Uyku Kalitesi:{' '}
                  {lastSleep.quality === 'poor'
                    ? 'Kötü'
                    : lastSleep.quality === 'fair'
                    ? 'Orta'
                    : lastSleep.quality === 'good'
                    ? 'İyi'
                    : 'Mükemmel'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: themeAsAny.colors.onSurface }}>Uyku Kaydı Bulunamadı</Title>
              <Paragraph style={{ color: themeAsAny.colors.onSurfaceVariant }}>İlk uyku kaydınızı ekleyin.</Paragraph>
            </Card.Content>
          </Card>
        )}

        <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: themeAsAny.colors.onSurface }}>Uyku İstatistikleri</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeAsAny.colors.primary }]}>{calculateAverageSleepDuration()}s</Text>
                <Text style={[styles.statLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Ort. Süre</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeAsAny.colors.primary }]}>{entries.length}</Text>
                <Text style={[styles.statLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Kayıt Sayısı</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeAsAny.colors.primary }]}>
                  {entries.length > 0 ? entries[0].startTime : '--:--'}
                </Text>
                <Text style={[styles.statLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Son Yatış</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: themeAsAny.colors.onSurface }}>AI Uyku Tavsiyeleri</Title>
            <Paragraph style={{ color: themeAsAny.colors.onSurfaceVariant }}>{getSleepRecommendation()}</Paragraph>
            <Paragraph style={[styles.recommendationText, { color: themeAsAny.colors.onSurfaceVariant }]}>
              Daha iyi bir uyku için yatmadan 1 saat önce ekranlardan uzak durun ve kafein
              tüketimini öğleden sonra sınırlayın. Ayrıca yatak odasının karanlık ve serin (18-20°C)
              olması önemlidir.
            </Paragraph>
          </Card.Content>
        </Card>

        <Title style={[styles.historyTitle, { color: themeAsAny.colors.onSurface }]}>Uyku Geçmişi</Title>

        {entries.length > 0 ? (
          entries.map(entry => (
            <Card key={entry.id} style={[styles.historyCard, { backgroundColor: themeAsAny.colors.surface }]}>
              <Card.Content>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyDate, { color: themeAsAny.colors.onSurface }]}>{formatDate(entry.date)}</Text>
                  <View
                    style={[
                      styles.historyQuality,
                      { backgroundColor: getQualityColor(entry.quality) },
                    ]}
                  >
                    <Text style={styles.historyQualityText}>
                      {entry.quality === 'poor'
                        ? 'Kötü'
                        : entry.quality === 'fair'
                        ? 'Orta'
                        : entry.quality === 'good'
                        ? 'İyi'
                        : 'Mükemmel'}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.historyDetails}>
                  <View style={styles.historyTime}>
                    <FontAwesomeIcon icon={faMoon} size={16} color={themeAsAny.colors.onSurfaceVariant} />
                    <Text style={[styles.historyTimeText, { color: themeAsAny.colors.onSurface }]}>{entry.startTime}</Text>
                  </View>
                  <View style={[styles.historyDuration, { backgroundColor: themeAsAny.colors.surfaceVariant }]}>
                    <Text style={[styles.historyDurationText, { color: themeAsAny.colors.onSurfaceVariant }]}>{entry.duration} saat</Text>
                  </View>
                  <View style={styles.historyTime}>
                    <FontAwesomeIcon icon={faSun} size={16} color={themeAsAny.colors.onSurfaceVariant} />
                    <Text style={[styles.historyTimeText, { color: themeAsAny.colors.onSurface }]}>{entry.endTime}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={[styles.noDataText, { color: themeAsAny.colors.onSurfaceVariant }]}>Henüz kayıt bulunmuyor</Text>
        )}

        <Button
          mode="contained"
          icon={({ size, color }: { size: number; color: string }) => (
            <FontAwesomeIcon icon={faPlus} size={size} color={color} />
          )}
          style={styles.addButton}
          buttonColor={themeAsAny.colors.primary}
          onPress={() => setModalVisible(true)}
        >
          Yeni Uyku Kaydı Ekle
        </Button>
      </ScrollView>

      {/* Yeni Uyku Kaydı Ekleme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themeAsAny.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: themeAsAny.colors.onSurface }]}>Yeni Uyku Kaydı Ekle</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeAsAny.colors.onSurface }]}>Uyku Kalitesi</Text>
              <View style={styles.qualityOptions}>
                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: themeAsAny.colors.surfaceVariant },
                    newSleepEntry.quality === 'poor' && styles.selectedQuality,
                    newSleepEntry.quality === 'poor' && { borderColor: getQualityColor('poor') },
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'poor' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('poor')}</Text>
                  <Text style={[styles.qualityLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Kötü</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: themeAsAny.colors.surfaceVariant },
                    newSleepEntry.quality === 'fair' && styles.selectedQuality,
                    newSleepEntry.quality === 'fair' && { borderColor: getQualityColor('fair') },
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'fair' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('fair')}</Text>
                  <Text style={[styles.qualityLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Orta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: themeAsAny.colors.surfaceVariant },
                    newSleepEntry.quality === 'good' && styles.selectedQuality,
                    newSleepEntry.quality === 'good' && { borderColor: getQualityColor('good') },
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'good' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('good')}</Text>
                  <Text style={[styles.qualityLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>İyi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: themeAsAny.colors.surfaceVariant },
                    newSleepEntry.quality === 'excellent' && styles.selectedQuality,
                    newSleepEntry.quality === 'excellent' && {
                      borderColor: getQualityColor('excellent'),
                    },
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'excellent' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('excellent')}</Text>
                  <Text style={[styles.qualityLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>Mükemmel</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeAsAny.colors.onSurface }]}>Yatış Saati</Text>
              <TouchableOpacity
                style={[styles.timeInput, { borderColor: themeAsAny.colors.outline }]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={{ color: themeAsAny.colors.onSurface }}>{newSleepEntry.startTime}</Text>
              </TouchableOpacity>
              {renderDateTimePicker(
                showStartTimePicker,
                newSleepEntry.startTime || '',
                onStartTimeChange,
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeAsAny.colors.onSurface }]}>Kalkış Saati</Text>
              <TouchableOpacity 
                style={[styles.timeInput, { borderColor: themeAsAny.colors.outline }]} 
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={{ color: themeAsAny.colors.onSurface }}>{newSleepEntry.endTime}</Text>
              </TouchableOpacity>
              {renderDateTimePicker(
                showEndTimePicker,
                newSleepEntry.endTime || '',
                onEndTimeChange,
              )}
            </View>

            <View style={styles.modalButtons}>
              <Button 
                onPress={() => setModalVisible(false)} 
                style={styles.cancelButton}
                textColor={themeAsAny.colors.primary}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleAddSleepEntry}
                style={styles.saveButton}
                buttonColor={themeAsAny.colors.primary}
                disabled={!newSleepEntry.startTime || !newSleepEntry.endTime}
              >
                Kaydet
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sleepSummaryCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  sleepSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  sleepTime: {
    alignItems: 'center',
  },
  timeLabel: {
    marginTop: 8,
    color: '#666',
  },
  timeValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sleepDuration: {
    alignItems: 'center',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  qualityIndicator: {
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  qualityText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
  recommendationText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#555',
  },
  historyTitle: {
    marginVertical: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyCard: {
    marginBottom: 12,
    elevation: 1,
    borderRadius: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyQuality: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  historyQualityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTimeText: {
    marginLeft: 4,
    fontSize: 14,
  },
  historyDuration: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  historyDurationText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    marginVertical: 20,
    backgroundColor: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  qualityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  qualityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedQuality: {
    borderWidth: 2,
    backgroundColor: '#f0f0f0',
  },
  qualityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityLabel: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#007AFF',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

export default SleepTrackerScreen;
