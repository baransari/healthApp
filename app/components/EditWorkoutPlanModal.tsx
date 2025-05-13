import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  useColorScheme,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Exercise, WorkoutPlan } from '../store/exerciseTrackerSlice';
import { useTheme } from '../context/ThemeContext';

// Utility function to get exercise icon based on category
const getExerciseIcon = (category: string) => {
  switch (category) {
    case 'kardiyo':
      return 'run';
    case 'kuvvet':
      return 'weight-lifter';
    case 'esneklik':
      return 'yoga';
    case 'denge':
      return 'scale-balance';
    default:
      return 'arm-flex';
  }
};

// Shared Divider component
const Divider = ({ style }: { style?: object }) => {
  const { theme } = useTheme();
  return <View style={[{ height: 1, backgroundColor: theme.colors.outline, marginVertical: 16 }, style]} />;
};

// Shared Checkbox component
interface CheckboxProps {
  status: 'checked' | 'unchecked';
  onPress: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ status, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkbox}>
      <MaterialCommunityIcons
        name={status === 'checked' ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={status === 'checked' ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
};

// Shared ListItem component
interface ListItemProps {
  title: string;
  description: string;
  left: () => React.ReactNode;
  right: () => React.ReactNode;
  onPress: () => void;
  style?: object;
}

const ListItem: React.FC<ListItemProps> = ({ title, description, left, right, onPress, style }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.listItem, style]}>
      <View style={styles.listItemLeft}>
        {left()}
        <View style={styles.listItemContent}>
          <Text style={[styles.listItemTitle, { color: theme.colors.onSurface }]}>{title}</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}>{description}</Text>
        </View>
      </View>
      <View style={styles.listItemRight}>{right()}</View>
    </TouchableOpacity>
  );
};

interface EditWorkoutPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (plan: Omit<WorkoutPlan, 'id'>) => void;
  plan?: WorkoutPlan;
  exercises: Exercise[];
}

const EditWorkoutPlanModal: React.FC<EditWorkoutPlanModalProps> = ({
  visible,
  onClose,
  onSave,
  plan,
  exercises,
}) => {
  const { theme, isDarkMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const actualDarkMode = isDarkMode ?? systemColorScheme === 'dark';
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('Haftada 3 gün');
  const [selectedExercises, setSelectedExercises] = useState<
    Array<{
      exerciseId: string;
      recommendedDuration?: number;
      recommendedSets?: number;
      recommendedReps?: number;
    }>
  >([]);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description || '');
      setFrequency(plan.frequency || 'Haftada 3 gün');
      setSelectedExercises(plan.exercises || []);
    } else {
      setName('');
      setDescription('');
      setFrequency('Haftada 3 gün');
      setSelectedExercises([]);
    }
  }, [plan, visible]);

  const toggleExerciseSelection = (exerciseId: string) => {
    const isSelected = selectedExercises.some(e => e.exerciseId === exerciseId);

    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(e => e.exerciseId !== exerciseId));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        {
          exerciseId,
          recommendedDuration: 30,
          recommendedSets: 3,
          recommendedReps: 10,
        },
      ]);
    }
  };

  const updateExerciseDetail = (exerciseId: string, field: string, value: number) => {
    setSelectedExercises(prev =>
      prev.map(e => (e.exerciseId === exerciseId ? { ...e, [field]: value } : e)),
    );
  };

  const handleSave = () => {
    if (name.trim() === '') {
      Alert.alert('Hata', 'Lütfen program adını girin.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir egzersiz seçin.');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      frequency,
      exercises: selectedExercises,
    });

    if (!plan) {
      setName('');
      setDescription('');
      setSelectedExercises([]);
    }
  };

  return (
    <Modal 
      animationType="slide" 
      transparent 
      visible={visible} 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView, 
          { 
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {plan ? 'Programı Düzenle' : 'Yeni Program Oluştur'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Program Adı</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Program adını giriniz"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Açıklama</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea, 
                { 
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Program hakkında açıklama girin"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Frekans</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                }
              ]}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="Örn: Haftada 3 gün"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Egzersizler</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Programa eklemek istediğiniz egzersizleri seçin
            </Text>

            {exercises.length > 0 ? (
              <View style={styles.exerciseList}>
                {exercises.map(exercise => {
                  const isSelected = selectedExercises.some(e => e.exerciseId === exercise.id);
                  const selectedExercise = selectedExercises.find(
                    e => e.exerciseId === exercise.id,
                  );

                  return (
                    <View key={exercise.id}>
                      <ListItem
                        title={exercise.name}
                        description={exercise.category}
                        left={() => (
                          <MaterialCommunityIcons
                            name={getExerciseIcon(exercise.category)}
                            size={24}
                            color={theme.colors.primary}
                            style={{ margin: 8 }}
                          />
                        )}
                        right={() => (
                          <Checkbox
                            status={isSelected ? 'checked' : 'unchecked'}
                            onPress={() => toggleExerciseSelection(exercise.id)}
                          />
                        )}
                        onPress={() => toggleExerciseSelection(exercise.id)}
                        style={styles.exerciseItem}
                      />

                      {isSelected && selectedExercise && (
                        <View style={[
                          styles.exerciseDetails, 
                          { 
                            backgroundColor: actualDarkMode 
                              ? theme.colors.surfaceVariant 
                              : '#f9f9f9'
                          }
                        ]}>
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                              Süre (dk):
                            </Text>
                            <TextInput
                              style={[
                                styles.detailInput, 
                                { 
                                  borderColor: theme.colors.outline,
                                  color: theme.colors.onSurface,
                                  backgroundColor: theme.colors.surface,
                                }
                              ]}
                              value={selectedExercise.recommendedDuration?.toString() || ''}
                              onChangeText={val =>
                                updateExerciseDetail(
                                  exercise.id,
                                  'recommendedDuration',
                                  parseInt(val) || 0,
                                )
                              }
                              keyboardType="numeric"
                              placeholderTextColor={theme.colors.onSurfaceVariant}
                            />
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                              Set:
                            </Text>
                            <TextInput
                              style={[
                                styles.detailInput, 
                                { 
                                  borderColor: theme.colors.outline,
                                  color: theme.colors.onSurface,
                                  backgroundColor: theme.colors.surface,
                                }
                              ]}
                              value={selectedExercise.recommendedSets?.toString() || ''}
                              onChangeText={val =>
                                updateExerciseDetail(
                                  exercise.id,
                                  'recommendedSets',
                                  parseInt(val) || 0,
                                )
                              }
                              keyboardType="numeric"
                              placeholderTextColor={theme.colors.onSurfaceVariant}
                            />
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                              Tekrar:
                            </Text>
                            <TextInput
                              style={[
                                styles.detailInput, 
                                { 
                                  borderColor: theme.colors.outline,
                                  color: theme.colors.onSurface,
                                  backgroundColor: theme.colors.surface,
                                }
                              ]}
                              value={selectedExercise.recommendedReps?.toString() || ''}
                              onChangeText={val =>
                                updateExerciseDetail(
                                  exercise.id,
                                  'recommendedReps',
                                  parseInt(val) || 0,
                                )
                              }
                              keyboardType="numeric"
                              placeholderTextColor={theme.colors.onSurfaceVariant}
                            />
                          </View>
                        </View>
                      )}
                      <Divider />
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.noExerciseText, { color: theme.colors.onSurfaceVariant }]}>
                Henüz egzersiz eklenmemiş. Lütfen önce egzersiz listesine ekleme yapın.
              </Text>
            )}
          </ScrollView>

          <Divider />

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[
                styles.cancelButton, 
                { borderColor: theme.colors.outline }
              ]} 
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>
                İptal
              </Text>
            </Pressable>
            <Pressable 
              style={[
                styles.saveButton, 
                { backgroundColor: theme.colors.primary }
              ]} 
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>
                Kaydet
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: '70%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  exerciseList: {
    marginTop: 10,
  },
  exerciseItem: {
    paddingVertical: 8,
  },
  exerciseDetails: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
  },
  detailInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    marginLeft: 10,
    fontSize: 14,
  },
  noExerciseText: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    padding: 4,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemContent: {
    marginLeft: 8,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
  },
  listItemRight: {
    padding: 4,
  },
});

export default EditWorkoutPlanModal;
