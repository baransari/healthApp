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
} from 'react-native';
// Import from paperComponents utility
import { Card, Divider } from '../utils/paperComponents';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
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
  portion: string;
}

const CalorieTrackerScreen: React.FC<CalorieTrackerScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
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
      portion: '1 orta boy (100g)',
    },
    {
      id: '2',
      name: 'Tavuk Göğsü',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      portion: '100g',
    },
    {
      id: '3',
      name: 'Yulaf Ezmesi',
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      portion: '100g',
    },
    {
      id: '4',
      name: 'Tam Buğday Ekmeği',
      calories: 247,
      protein: 13,
      carbs: 41,
      fat: 3,
      portion: '100g',
    },
    {
      id: '5',
      name: 'Muz',
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      portion: '1 orta boy (100g)',
    },
  ];

  // Günlük besin kaydı
  const [dailyFood, setDailyFood] = useState<{
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snack: FoodItem[];
  }>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const filteredFoods = searchQuery
    ? foodDatabase.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

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
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  };

  const openAddFoodModal = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

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
  const getFoodIcon = (foodName: string) => {
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

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.mealHeaderContainer}>
            <View style={styles.mealTitleContainer}>
              <FontAwesomeIcon
                icon={getMealTypeIcon()}
                size={20}
                color={theme.colors.primary}
                style={styles.mealIcon}
              />
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={[styles.mealCalories, { color: theme.colors.primary }]}>{nutrients.calories} kcal</Text>
          </View>

          {dailyFood[mealType].length > 0 ? (
            dailyFood[mealType].map((food, index) => (
              <View key={`${food.id}-${index}`}>
                <View style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <View style={styles.foodNameContainer}>
                      <FontAwesomeIcon
                        icon={getFoodIcon(food.name)}
                        size={16}
                        color={theme.colors.primary}
                        style={styles.foodItemIcon}
                      />
                      <Text style={styles.foodName}>{food.name}</Text>
                    </View>
                    <Text style={styles.foodPortion}>{food.portion}</Text>
                  </View>
                  <View style={styles.foodNutrients}>
                    <Text style={styles.calorieText}>{food.calories} kcal</Text>
                    <TouchableOpacity onPress={() => removeFoodFromMeal(mealType, food.id)}>
                      <FontAwesomeIcon icon={faTrash} size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
                {index < dailyFood[mealType].length - 1 && <Divider />}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Henüz öğün eklenmemiş</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Pressable 
            style={[styles.addFoodButton, { borderColor: theme.colors.primary }]} 
            onPress={() => openAddFoodModal(mealType)}
          >
            <FontAwesomeIcon icon={faPlus} size={20} color={theme.colors.primary} />
            <Text style={[styles.addFoodButtonText, { color: theme.colors.primary }]}>Besin Ekle</Text>
          </Pressable>
        </Card.Actions>
      </Card>
    );
  };

  const handleAddFoodDetails = (food: FoodItem) => {
    // Navigate to FoodDetails with the correct foodId
    navigation.navigate('FoodDetails', { foodId: food.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Kalori Takibi</Text>
        <View style={styles.headerRight}>
          <View style={styles.calorieCircle}>
            <Text style={[styles.calorieValue, { color: theme.colors.primary }]}>
              {calculateTotalCalories()}
            </Text>
            <Text style={[styles.calorieLabel, { color: theme.colors.primary }]}>
              kalori
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {renderMealSection('Kahvaltı', 'breakfast')}
        {renderMealSection('Öğle Yemeği', 'lunch')}
        {renderMealSection('Akşam Yemeği', 'dinner')}
        {renderMealSection('Atıştırmalıklar', 'snack')}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <FontAwesomeIcon icon={getMealIcon()} size={20} color={theme.colors.primary} />
              <Text style={styles.modalTitle}>
                {selectedMeal === 'breakfast' && 'Kahvaltı'}
                {selectedMeal === 'lunch' && 'Öğle Yemeği'}
                {selectedMeal === 'dinner' && 'Akşam Yemeği'}
                {selectedMeal === 'snack' && 'Atıştırmalıklar'}
                {' için Besin Ekle'}
              </Text>
            </View>

            <View style={styles.searchBar}>
              <View style={styles.searchBarInner}>
                <FontAwesomeIcon icon={faSearch} size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  placeholder="Besin ara..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchInput}
                />
              </View>
            </View>

            <ScrollView style={styles.searchResults}>
              {filteredFoods.map(food => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.searchResultItem}
                  onPress={() => addFoodToMeal(food)}
                >
                  <View style={styles.foodResultLeft}>
                    <FontAwesomeIcon
                      icon={getFoodIcon(food.name)}
                      size={18}
                      color={theme.colors.primary}
                      style={styles.foodIcon}
                    />
                    <View>
                      <Text style={styles.foodResultName}>{food.name}</Text>
                      <Text style={styles.foodResultPortion}>{food.portion}</Text>
                    </View>
                  </View>
                  <Text style={styles.foodResultCalories}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
              {searchQuery && filteredFoods.length === 0 && (
                <Text style={styles.noResults}>Sonuç bulunamadı</Text>
              )}
            </ScrollView>

            <Pressable 
              onPress={() => setModalVisible(false)} 
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            >
              <FontAwesomeIcon icon={faXmark} size={20} color="white" />
              <Text style={styles.closeButtonText}>Kapat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
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
  calorieCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  mealHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    marginRight: 8,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodItemIcon: {
    marginRight: 10,
  },
  foodName: {
    fontSize: 16,
  },
  foodPortion: {
    fontSize: 12,
    color: '#666',
  },
  foodNutrients: {
    alignItems: 'flex-end',
  },
  calorieText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    padding: 4,
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  foodResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodIcon: {
    marginRight: 10,
  },
  foodResultName: {
    fontSize: 16,
  },
  foodResultPortion: {
    fontSize: 12,
    color: '#666',
  },
  foodResultCalories: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
  closeButton: {
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  addFoodButtonText: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CalorieTrackerScreen;
