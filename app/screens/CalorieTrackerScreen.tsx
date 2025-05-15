import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  SafeAreaView,
} from 'react-native';
// Import from paperComponents utility
import { Card, Divider, Button, Chip, IconButton, ProgressBar, Surface } from '../utils/paperComponents';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import useTheme from '../hooks/useTheme';
import type { ExtendedMD3Theme } from '../types';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUtensils,
  faPlus,
  faMinus,
  faXmark,
  faTrash,
  faSearch,
  faEgg,
  faBreadSlice,
  faDrumstickBite,
  faCookie,
  faAppleAlt,
  faPizzaSlice,
  faCheese,
  faBurger,
  faBowlFood,
  faMugHot,
  faCarrot,
  faFire,
  faWeightScale,
  faScaleBalanced,
  faLeaf,
  faCubes,
  faOilCan,
  faFish,
} from '@fortawesome/free-solid-svg-icons';

// Define navigation type
type CalorieTrackerScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CalorieTracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface CalorieTrackerScreenProps {
  navigation: CalorieTrackerScreenNavigationProp;
}

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  portion: string;
  category?: string;
}

const CalorieTrackerScreen: React.FC<CalorieTrackerScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
    'breakfast',
  );

  // Örnek besin veritabanı
  const foodDatabase: FoodItem[] = [
    {
      id: '1',
      name: 'Elma',
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.3,
      portion: '1 orta boy (100g)',
      category: 'meyve'
    },
    {
      id: '2',
      name: 'Tavuk Göğsü',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      portion: '100g',
      category: 'tavuk'
    },
    {
      id: '3',
      name: 'Yulaf Ezmesi',
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      fiber: 10.6,
      portion: '100g',
      category: 'tahil'
    },
    {
      id: '4',
      name: 'Tam Buğday Ekmeği',
      calories: 247,
      protein: 13,
      carbs: 41,
      fat: 3,
      fiber: 7,
      portion: '100g',
      category: 'tahil'
    },
    {
      id: '5',
      name: 'Muz',
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      portion: '1 orta boy (100g)',
      category: 'meyve'
    },
    {
      id: '6',
      name: 'Somon',
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      portion: '100g',
      category: 'balik'
    },
    {
      id: '7',
      name: 'Avokado',
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      portion: '100g',
      category: 'meyve'
    },
    {
      id: '8',
      name: 'Tam Yağlı Süt',
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      portion: '100ml',
      category: 'sut_urunleri'
    },
  ];

  // Günlük besin kaydı
  const [dailyFood, setDailyFood] = useState<{
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snack: FoodItem[];
  }>({
    breakfast: [foodDatabase[2], foodDatabase[7]],
    lunch: [foodDatabase[1], foodDatabase[3]],
    dinner: [foodDatabase[5]],
    snack: [foodDatabase[0]],
  });

  // Filtrelenmiş besinler
  const filteredFoods = searchQuery
    ? foodDatabase.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : foodDatabase;

  // Yardımcı fonksiyonlar
  const addFoodToMeal = (food: FoodItem) => {
    setDailyFood({
      ...dailyFood,
      [selectedMeal]: [...dailyFood[selectedMeal], food],
    });
    setModalVisible(false);
    setSearchQuery('');
  };

  const removeFoodFromMeal = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    foodId: string,
  ) => {
    setDailyFood({
      ...dailyFood,
      [mealType]: dailyFood[mealType].filter(item => item.id !== foodId),
    });
  };

  const calculateTotalCalories = () => {
    const allFoods = [
      ...dailyFood.breakfast,
      ...dailyFood.lunch,
      ...dailyFood.dinner,
      ...dailyFood.snack,
    ];

    return allFoods.reduce((total, food) => total + food.calories, 0);
  };

  const calculateNutrients = (foods: FoodItem[]) => {
    return foods.reduce(
      (acc, food) => {
        acc.calories += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
        if (food.fiber) acc.fiber += food.fiber;
        if (food.sugar) acc.sugar += food.sugar;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
    );
  };
  
  const calculateTotalNutrients = () => {
    const allFoods = [
      ...dailyFood.breakfast,
      ...dailyFood.lunch,
      ...dailyFood.dinner,
      ...dailyFood.snack,
    ];
    
    return calculateNutrients(allFoods);
  };

  // Hedefler ve ilerleme
  const calorieGoal = 2500;
  const proteinGoal = 140;
  const carbsGoal = 300;
  const fatGoal = 80;
  
  // İlerleme hesaplamaları
  const calculateProgressPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };
  
  const totalNutrients = calculateTotalNutrients();
  const calorieProgress = calculateProgressPercentage(totalNutrients.calories, calorieGoal);
  const proteinProgress = calculateProgressPercentage(totalNutrients.protein, proteinGoal);
  const carbsProgress = calculateProgressPercentage(totalNutrients.carbs, carbsGoal);
  const fatProgress = calculateProgressPercentage(totalNutrients.fat, fatGoal);

  // Tema renkleri
  const primaryColor = theme.colors.primary;
  const proteinColor = '#3F51B5'; // Mavi
  const carbsColor = '#FF9800';   // Turuncu
  const fatColor = '#F44336';     // Kırmızı
  
  // Yemek türüne göre ikon seçimi
  const getMealIcon = () => {
    switch (selectedMeal) {
      case 'breakfast':
        return faEgg;
      case 'lunch':
        return faBowlFood;
      case 'dinner':
        return faDrumstickBite;
      case 'snack':
        return faCookie;
      default:
        return faUtensils;
    }
  };

  // Besin türüne göre uygun ikonu getir
  const getFoodIcon = (foodName: string, category?: string) => {
    if (category) {
      switch(category) {
        case 'meyve': return faAppleAlt;
        case 'tahil': return faBreadSlice;
        case 'tavuk': return faDrumstickBite;
        case 'balik': return faFish;
        case 'sut_urunleri': return faCheese;
        default: break;
      }
    }
    
    const lowerName = foodName.toLowerCase();
    if (lowerName.includes('elma') || lowerName.includes('muz') || lowerName.includes('meyve')) {
      return faAppleAlt;
    } else if (lowerName.includes('ekmek') || lowerName.includes('yulaf')) {
      return faBreadSlice;
    } else if (lowerName.includes('tavuk') || lowerName.includes('et')) {
      return faDrumstickBite;
    } else if (lowerName.includes('süt') || lowerName.includes('peynir')) {
      return faCheese;
    } else if (lowerName.includes('pizza') || lowerName.includes('makarna')) {
      return faPizzaSlice;
    } else if (lowerName.includes('burger') || lowerName.includes('sandviç')) {
      return faBurger;
    } else if (lowerName.includes('çorba') || lowerName.includes('yemek')) {
      return faBowlFood;
    } else if (lowerName.includes('kahve') || lowerName.includes('çay')) {
      return faMugHot;
    } else if (lowerName.includes('sebze') || lowerName.includes('havuç')) {
      return faCarrot;
    } else {
      return faUtensils;
    }
  };

  // Create a consistent card styling function
  const getCardStyle = () => ({
    backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
    borderWidth: 0,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    margin: 16,
    marginTop: 8
  });
  
  // Create a consistent nutritionItem styling function
  const getNutritionItemStyle = (color: string) => ({
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : `${color}10`,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : `${color}20`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  });

  // Öğün bölümünü render etme
  const renderMealSection = (
    title: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  ) => {
    const nutrients = calculateNutrients(dailyFood[mealType]);

    // Yemek türüne göre ikon seçimi
    const getMealTypeIcon = () => {
      switch (mealType) {
        case 'breakfast':
          return faEgg;
        case 'lunch':
          return faBowlFood;
        case 'dinner':
          return faDrumstickBite;
        case 'snack':
          return faCookie;
        default:
          return faUtensils;
      }
    };
    
    // Öğün için uygun vurgu rengi
    const getMealAccentColor = () => {
      switch (mealType) {
        case 'breakfast': return '#3F51B5'; // Mavi
        case 'lunch': return '#4CAF50'; // Yeşil
        case 'dinner': return '#FF5722'; // Turuncu-kırmızı
        case 'snack': return '#FF9800'; // Turuncu
        default: return primaryColor;
      }
    };
    
    const accentColor = getMealAccentColor();

    return (
      <Card style={getCardStyle()}>
        <Card.Content style={{ padding: 0 }}>
          {/* Öğün başlığı */}
          <View style={[styles.mealHeaderContainer, { backgroundColor: `${accentColor}15`, paddingVertical: 16, paddingHorizontal: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
            <View style={styles.mealTitleContainer}>
              <View style={[styles.mealIconContainer, { backgroundColor: accentColor }]}>
                <FontAwesomeIcon
                  icon={getMealTypeIcon()}
                  size={20}
                  color="white"
                />
              </View>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : '#333' }]}>{title}</Text>
            </View>
            <Surface style={[styles.calorieContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }]}>
              <Text style={[styles.mealCalories, { color: accentColor }]}>{nutrients.calories}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </Surface>
          </View>
          
          {/* Besin listesi */}
          <View style={{ padding: 16 }}>
            {dailyFood[mealType].length > 0 ? (
              dailyFood[mealType].map((food, index) => (
                <View key={`${food.id}-${index}`}>
                  <View style={styles.foodItem}>
                    <View style={styles.foodInfo}>
                      <View style={styles.foodNameContainer}>
                        <View style={[styles.foodIconContainer, { backgroundColor: `${accentColor}15` }]}>
                          <FontAwesomeIcon
                            icon={getFoodIcon(food.name, food.category)}
                            size={16}
                            color={accentColor}
                          />
                        </View>
                        <View>
                          <Text style={[styles.foodName, { color: isDarkMode ? 'white' : '#333' }]}>{food.name}</Text>
                          <Text style={[styles.foodPortion, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#666' }]}>{food.portion}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.foodNutrients}>
                      <Text style={[styles.calorieLabelText, { color: accentColor }]}>{food.calories} kcal</Text>
                      <TouchableOpacity 
                        onPress={() => removeFoodFromMeal(mealType, food.id)}
                        style={[styles.removeButton, { backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)' }]}
                      >
                        <FontAwesomeIcon icon={faXmark} size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < dailyFood[mealType].length - 1 && (
                    <Divider style={{ marginVertical: 8, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.emptyMealContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Text style={[styles.emptyText, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#999' }]}>Henüz öğün eklenmemiş</Text>
              </View>
            )}
          </View>
          
          {/* Öğün makro dağılımı */}
          {dailyFood[mealType].length > 0 && (
            <View style={styles.macroSection}>
              <Text style={[styles.macroTitle, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#555' }]}>Makro Dağılımı</Text>
              <View style={styles.macroRow}>
                <View style={[styles.macroItem, { backgroundColor: `${proteinColor}15` }]}>
                  <FontAwesomeIcon icon={faWeightScale} size={14} color={proteinColor} style={styles.macroIcon} />
                  <Text style={[styles.macroValue, { color: proteinColor }]}>{nutrients.protein.toFixed(1)}g</Text>
                  <Text style={[styles.macroLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666' }]}>Protein</Text>
                </View>
                <View style={[styles.macroItem, { backgroundColor: `${carbsColor}15` }]}>
                  <FontAwesomeIcon icon={faCubes} size={14} color={carbsColor} style={styles.macroIcon} />
                  <Text style={[styles.macroValue, { color: carbsColor }]}>{nutrients.carbs.toFixed(1)}g</Text>
                  <Text style={[styles.macroLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666' }]}>Karbonhidrat</Text>
                </View>
                <View style={[styles.macroItem, { backgroundColor: `${fatColor}15` }]}>
                  <FontAwesomeIcon icon={faOilCan} size={14} color={fatColor} style={styles.macroIcon} />
                  <Text style={[styles.macroValue, { color: fatColor }]}>{nutrients.fat.toFixed(1)}g</Text>
                  <Text style={[styles.macroLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666' }]}>Yağ</Text>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => openAddFoodModal(mealType)}
            style={[styles.addFoodButton, { borderColor: accentColor }]}
            contentStyle={{ height: 40 }}
            labelStyle={{ color: accentColor }}
            icon={({ size, color }: { size: number; color: string }) => (
              <FontAwesomeIcon icon={faPlus} size={size} color={color} />
            )}
          >
            Besin Ekle
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const handleAddFoodDetails = (food: FoodItem) => {
    // Navigate to FoodDetails with the correct foodId
    navigation.navigate('FoodDetails', { foodId: food.id });
  };

  const openAddFoodModal = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  // Diğer yardımcı fonksiyonlar
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>
              {getFormattedDate()}
            </Text>
            <Text style={styles.headerTitle}>Beslenme Takibi</Text>
            <Text style={styles.headerInfo}>
              Günlük Hedef: {calorieGoal} kalori
            </Text>
          </View>
          
          <View style={styles.calorieCircleContainer}>
            <View style={[styles.calorieCircle, { 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 3,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }]}>
              <Text style={styles.calorieNumber}>{totalNutrients.calories}</Text>
              <Text style={styles.calorieUnitText}>kalori</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(calorieProgress, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
        
        {/* Streak Chip */}
        <Chip
          icon={({ size, color }: { size: number; color: string }) => (
            <FontAwesomeIcon icon={faFire} size={size} color={color} />
          )}
          style={styles.streakChip}
          textStyle={styles.streakChipText}
        >
          Hedefinizin %{calorieProgress}'ine ulaştınız
        </Chip>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Nutrition Summary Card */}
        <Card style={[getCardStyle(), { marginTop: 16 }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionIconContainer, { backgroundColor: `${primaryColor}20` }]}>
                <FontAwesomeIcon icon={faUtensils} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: isDarkMode ? 'white' : '#333' }]}>Günlük Beslenme Özeti</Text>
            </View>
            
            <View style={styles.nutritionSummary}>
              <View style={styles.nutritionContainer}>
                <View style={[styles.nutritionItem, getNutritionItemStyle(proteinColor)]}>
                  <FontAwesomeIcon icon={faWeightScale} size={18} color={proteinColor} style={{ marginBottom: 8 }} />
                  <Text style={[styles.nutritionLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666' }]}>Protein</Text>
                  <Text style={[styles.nutritionValue, { color: proteinColor }]}>{totalNutrients.protein.toFixed(1)}g</Text>
                  <Text style={[styles.nutritionGoal, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#888' }]}>/ {proteinGoal}g</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: `${proteinProgress}%`, backgroundColor: proteinColor }]} />
                  </View>
                </View>
                
                <View style={[styles.nutritionItem, getNutritionItemStyle(carbsColor)]}>
                  <FontAwesomeIcon icon={faCubes} size={18} color={carbsColor} style={{ marginBottom: 8 }} />
                  <Text style={[styles.nutritionLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666' }]}>Karbonhidrat</Text>
                  <Text style={[styles.nutritionValue, { color: carbsColor }]}>{totalNutrients.carbs.toFixed(1)}g</Text>
                  <Text style={[styles.nutritionGoal, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#888' }]}>/ {carbsGoal}g</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: `${carbsProgress}%`, backgroundColor: carbsColor }]} />
                  </View>
                </View>
                
                <View style={[styles.nutritionItem, getNutritionItemStyle(fatColor)]}>
                  <FontAwesomeIcon icon={faOilCan} size={18} color={fatColor} style={{ marginBottom: 8 }} />
                  <Text style={[styles.nutritionLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666' }]}>Yağ</Text>
                  <Text style={[styles.nutritionValue, { color: fatColor }]}>{totalNutrients.fat.toFixed(1)}g</Text>
                  <Text style={[styles.nutritionGoal, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#888' }]}>/ {fatGoal}g</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: `${fatProgress}%`, backgroundColor: fatColor }]} />
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Meals Section */}
        <Text style={[styles.sectionHeading, { color: isDarkMode ? 'white' : '#333', marginTop: 16, marginLeft: 16 }]}>Günlük Öğünler</Text>
        {renderMealSection('Kahvaltı', 'breakfast')}
        {renderMealSection('Öğle Yemeği', 'lunch')}
        {renderMealSection('Akşam Yemeği', 'dinner')}
        {renderMealSection('Atıştırmalıklar', 'snack')}
        
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Food Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1E1E2E' : 'white' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : '#333' }]}>
                <FontAwesomeIcon icon={getMealIcon()} size={20} color={theme.colors.primary} />
                {' '}
                {selectedMeal === 'breakfast' && 'Kahvaltı'}
                {selectedMeal === 'lunch' && 'Öğle Yemeği'}
                {selectedMeal === 'dinner' && 'Akşam Yemeği'}
                {selectedMeal === 'snack' && 'Atıştırmalıklar'}
                {' için Besin Ekle'}
              </Text>
              <IconButton 
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faXmark} size={size} color={color} />
                )}
                size={24} 
                onPress={() => setModalVisible(false)} 
              />
            </View>

            <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f2f2f2' }]}>
              <View style={styles.searchBarInner}>
                <FontAwesomeIcon 
                  icon={faSearch} 
                  size={20} 
                  color={isDarkMode ? 'rgba(255,255,255,0.5)' : '#666'} 
                  style={styles.searchIcon} 
                />
                <TextInput
                  placeholder="Besin ara..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={[styles.searchInput, { color: isDarkMode ? 'white' : '#333' }]}
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : '#999'}
                />
              </View>
            </View>

            <ScrollView style={styles.searchResults}>
              {filteredFoods.map(food => (
                <TouchableOpacity
                  key={food.id}
                  style={[styles.searchResultItem, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e0e0e0' }]}
                  onPress={() => addFoodToMeal(food)}
                >
                  <View style={styles.foodResultLeft}>
                    <View style={[styles.resultIconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : `${primaryColor}15` }]}>
                      <FontAwesomeIcon
                        icon={getFoodIcon(food.name, food.category)}
                        size={18}
                        color={primaryColor}
                      />
                    </View>
                    <View>
                      <Text style={[styles.foodResultName, { color: isDarkMode ? 'white' : '#333' }]}>{food.name}</Text>
                      <Text style={[styles.foodResultPortion, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#666' }]}>{food.portion}</Text>
                    </View>
                  </View>
                  <View style={styles.foodResultRight}>
                    <Text style={[styles.foodResultCalories, { color: primaryColor }]}>{food.calories} kcal</Text>
                    <View style={[styles.addButtonSmall, { backgroundColor: `${primaryColor}20` }]}>
                      <FontAwesomeIcon icon={faPlus} size={14} color={primaryColor} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {searchQuery && filteredFoods.length === 0 && (
                <Text style={[styles.noResults, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#666' }]}>Sonuç bulunamadı</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faXmark} size={size} color={color} />
                )}
              >
                Kapat
              </Button>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.floatingActionButton, { 
          backgroundColor: theme.colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 6
        }]}
        onPress={() => openAddFoodModal('snack')}
      >
        <FontAwesomeIcon icon={faPlus} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 8,
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
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  streakChip: {
    marginTop: 0,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  streakChipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calorieCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calorieNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  calorieUnitText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  nutritionSummary: {
    marginTop: 8,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  nutritionItem: {
    alignItems: 'center',
    width: '30%',
    borderRadius: 16,
    padding: 12,
  },
  nutritionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  nutritionGoal: {
    fontSize: 12,
    marginBottom: 6,
  },
  progressBarSmall: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  mealHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  calorieContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calorieUnit: {
    fontSize: 12,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodPortion: {
    fontSize: 12,
    marginTop: 2,
  },
  foodNutrients: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMealContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  macroSection: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    width: '30%',
    borderRadius: 12,
    padding: 8,
  },
  macroIcon: {
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  addFoodButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  foodResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  resultIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodResultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodResultPortion: {
    fontSize: 12,
    marginTop: 2,
  },
  foodResultRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodResultCalories: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButtonSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
  },
  modalFooter: {
    paddingTop: 16,
  },
  closeButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  floatingActionButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginLeft: 16,
  },
});

export default CalorieTrackerScreen;
