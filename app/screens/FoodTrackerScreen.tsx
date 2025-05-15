import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput as RNTextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ViewStyle,
  TextStyle,
  FlexAlignType,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Button,
  Divider,
  useTheme as usePaperTheme,
  Text as PaperText,
  Surface,
  Avatar,
  Chip,
  IconButton,
  Title,
  TextInput,
  List,
  Searchbar,
  FAB,
  ProgressBar,
} from '../utils/paperComponents';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import useFoodTracker from '../hooks/useFoodTracker';
import { FoodEntry, Nutrition } from '../store/foodTrackerSlice';
import foodDatabase, {
  FoodData,
  searchByName,
  getFrequentFoodsForMealType,
  filterByCategory,
  FoodCategory,
  addCustomFood,
  removeCustomFood,
  loadCustomFoods,
  getAllFoods,
} from '../data/foodDatabase';
import { useTheme } from '../hooks/useTheme';
import type { ExtendedMD3Theme } from '../types';

// FontAwesome icons - updated to modern versions
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  // Temel kullanıcı arayüzü ikonları
  faPlus,
  faMinus,
  faXmark,
  faTrash,
  faMagnifyingGlass,
  faCheckCircle,
  faClipboardCheck,
  faCog,
  faStar,

  // Yemek ve içecek kategorileri
  faUtensils,
  faEgg,
  faBreadSlice,
  faDrumstickBite,
  faCookie,
  faAppleWhole,
  faCheese,
  faBurger,
  faBowlFood,
  faMugHot,
  faCarrot,
  faFish,
  faCake,
  faIceCream,

  // Beslenme ve sağlık ikonları
  faWeightScale,
  faFire,
  faLeaf,
  faCubes,
  faOilCan,
  faDumbbell,
  faSeedling,
  faWheatAwn,
  faScaleBalanced,

  // Diğer yardımcı ikonlar
  faTruckFast,
} from '@fortawesome/free-solid-svg-icons';

type FoodTrackerScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'FoodTracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface FoodTrackerScreenProps {
  navigation: FoodTrackerScreenNavigationProp;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealTypeConfig {
  type: MealType;
  label: string;
  icon: any;
}

interface CategoryConfig {
  type: FoodCategory;
  label: string;
  icon: any;
}

interface StylesType {
  container: ViewStyle;
  scrollView: ViewStyle;
  mealCard: ViewStyle;
  modalView: ViewStyle;
  searchBar: ViewStyle;
  categoryChips: ViewStyle;
  categoryChip: ViewStyle;
  categoryScroll: ViewStyle;
  foodItem: ViewStyle;
  customAmountContainer: ViewStyle;
  nutritionRow: ViewStyle;
  fab: ViewStyle;
  nutritionItem: ViewStyle;
  nutritionLabel: TextStyle;
  nutritionValue: TextStyle;
  nutritionUnit: TextStyle;
  nutritionGoal: TextStyle;
  mealHeader: ViewStyle;
  modalHeader: ViewStyle;
  mealTitleWrapper: ViewStyle;
  mealTitle: TextStyle;
  mealCalories: TextStyle;
  foodEntry: ViewStyle;
  foodInfo: ViewStyle;
  foodName: TextStyle;
  foodAmount: TextStyle;
  foodCalories: ViewStyle;
  addFoodButton: ViewStyle;
  calorieContent: ViewStyle;
  calorieRow: ViewStyle;
  calorieText: TextStyle;
  progressBar: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  divider: ViewStyle;
  modalTitle: TextStyle;
  headerBar: ViewStyle;
  headerTitle: TextStyle;
  headerIcons: ViewStyle;
  iconButton: ViewStyle;
  scrollContent: ViewStyle;
  calorieCard: ViewStyle;
  calorieNumber: TextStyle;
  goalNumber: TextStyle;
  goalText: TextStyle;
  summaryCard: ViewStyle;
  summaryHeader: ViewStyle;
  summaryTitle: TextStyle;
  dateText: TextStyle;
  dividerLine: ViewStyle;
  mealRow: ViewStyle;
  mealIconContainer: ViewStyle;
  mealInfo: ViewStyle;
  mealName: ViewStyle;
  mealStats: TextStyle;
  addButton: ViewStyle;
  mealDivider: ViewStyle;
  nutritionCard: ViewStyle;
  nutritionHeader: ViewStyle;
  nutritionTitle: TextStyle;
  nutritionGrid: ViewStyle;
  mealCardIcon: ViewStyle;
  mealAddButton: ViewStyle;
  mealCardContent: ViewStyle;
  emptyMeal: TextStyle;
  foodEntryInfo: ViewStyle;
  foodEntryName: TextStyle;
  foodEntryDetails: TextStyle;
  deleteButton: ViewStyle;
  floatingActionButton: ViewStyle;
  formSection: ViewStyle;
  formGrid: ViewStyle;
  gridItem: ViewStyle;
  customFoodInput: ViewStyle;
  helpText: TextStyle;
  unitText: TextStyle;
  foodItemRight: ViewStyle;
  amountInput: ViewStyle;
  sectionTitle: TextStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  headerLeft: ViewStyle;
  headerSubtitle: TextStyle;
  headerInfo: TextStyle;
  calorieCircleContainer: ViewStyle;
  calorieCircle: ViewStyle;
  calorieValue: TextStyle;
  calorieUnit: TextStyle;
  caloriePercentage: ViewStyle;
  caloriePercentageText: TextStyle;
  progressContainer: ViewStyle;
  progressBarContainer: ViewStyle;
  progressBarFill: ViewStyle;
  card: ViewStyle;
  cardContent: ViewStyle;
  sectionTitleContainer: ViewStyle;
  cardTitle: TextStyle;
  nutritionItemIcon: ViewStyle;
  nutritionItemContent: ViewStyle;
  nutritionProgress: ViewStyle;
  nutritionProgressFill: ViewStyle;
  mealCardHeader: ViewStyle;
  mealHeaderContent: ViewStyle;
  emptyMealContainer: ViewStyle;
}

// Örnek yemek verileri
const sampleFoods = [
  {
    name: 'Elma',
    amount: 100,
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  },
  {
    name: 'Tavuk Göğsü',
    amount: 100,
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  },
  {
    name: 'Pirinç (Pişmiş)',
    amount: 100,
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  },
  {
    name: 'Yoğurt',
    amount: 100,
    nutrition: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  },
  {
    name: 'Yulaf Ezmesi',
    amount: 100,
    nutrition: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
  },
  {
    name: 'Muz',
    amount: 100,
    nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  },
];

// Add proper type definitions for List.Item function parameters
type ListItemProps = {
  size: number;
  color: string;
};

type InputChangeProps = {
  text: string;
};

const FoodTrackerScreen: React.FC<FoodTrackerScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const themeAsAny = theme as any;
  
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
  
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [foodSearchQuery, setFoodSearchQuery] = React.useState<string>('');
  const [foodSearchResults, setFoodSearchResults] = React.useState<FoodData[]>([]);
  const [selectedMealType, setSelectedMealType] = React.useState<MealType>('breakfast');
  const [selectedCategory, setSelectedCategory] = React.useState<FoodCategory | null>(null);
  const [customAmount, setCustomAmount] = React.useState<string>('100');
  const [customAmountFoodId, setCustomAmountFoodId] = React.useState<string>('');

  // Custom food states
  const [customFoodModalVisible, setCustomFoodModalVisible] = React.useState<boolean>(false);
  const [newFoodName, setNewFoodName] = React.useState<string>('');
  const [newFoodCategory, setNewFoodCategory] = React.useState<FoodCategory>('tahil');
  const [newFoodAmount, setNewFoodAmount] = React.useState<string>('100');
  const [newFoodUnit, setNewFoodUnit] = React.useState<'g' | 'ml' | 'adet'>('g');
  const [newFoodCalories, setNewFoodCalories] = React.useState<string>('');
  const [newFoodProtein, setNewFoodProtein] = React.useState<string>('');
  const [newFoodCarbs, setNewFoodCarbs] = React.useState<string>('');
  const [newFoodFat, setNewFoodFat] = React.useState<string>('');
  const [newFoodFiber, setNewFoodFiber] = React.useState<string>('');
  const [newFoodSugar, setNewFoodSugar] = React.useState<string>('');

  // Custom foods list modal state
  const [customFoodsListModalVisible, setCustomFoodsListModalVisible] =
    React.useState<boolean>(false);
  const [customFoodsList, setCustomFoodsList] = React.useState<FoodData[]>([]);

  // useFoodTracker hook
  const {
    todayEntries,
    goals,
    dailyNutrition,
    goalPercentages,
    addFood,
    removeFood,
    getEntriesByMealType,
  } = useFoodTracker();

  // Renk teması
  const primaryColor = themeAsAny.colors.primary || '#4285F4';
  const secondaryColor = isDarkMode ? '#1E1E2E' : '#fff';
  const headerColor = isDarkMode ? '#1E1E2E' : 'rgba(255, 87, 51, 0.95)'; // Turuncu gıda teması

  // Load custom foods on app start
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await loadCustomFoods();
        setFoodSearchResults(getFrequentFoodsForMealType(selectedMealType));
      } catch (error) {
        console.error("Failed to load custom foods:", error);
      }
    };

    loadData();
  }, [selectedMealType]);

  // Food search effect
  React.useEffect(() => {
    try {
      if (selectedCategory) {
        setFoodSearchResults(filterByCategory(selectedCategory));
      } else if (foodSearchQuery.trim() !== '') {
        const results = searchByName(foodSearchQuery);
        console.log('Search results:', foodSearchQuery, results.length);
        setFoodSearchResults(results);
      } else {
        setFoodSearchResults(getFrequentFoodsForMealType(selectedMealType));
      }
    } catch (error) {
      console.error("Error during food search:", error);
      // Fallback to empty results if something goes wrong
      setFoodSearchResults([]);
    }
  }, [foodSearchQuery, selectedMealType, selectedCategory]);

  // Yemek ekleme
  const handleAddFood = (food: FoodData) => {
    try {
      const amount = parseInt(customAmount) || 100;

      // Miktar doğrulama
      if (isNaN(amount) || amount <= 0 || amount > 10000) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount between 1 and 10,000 grams.');
        return;
      }

      const ratio = amount / (food.amount || 100);

      // Make sure nutrition values exist
      if (!food.nutrition) {
        console.error('Missing nutrition data for food:', food.name);
        Alert.alert('Error', 'Missing nutrition data for this food.');
        return;
      }

      addFood({
        name: food.name,
        amount: amount,
        mealType: selectedMealType,
        nutrition: {
          calories: Math.round((food.nutrition.calories || 0) * ratio),
          protein: parseFloat(((food.nutrition.protein || 0) * ratio).toFixed(1)),
          carbs: parseFloat(((food.nutrition.carbs || 0) * ratio).toFixed(1)),
          fat: parseFloat(((food.nutrition.fat || 0) * ratio).toFixed(1)),
          fiber: food.nutrition.fiber
            ? parseFloat((food.nutrition.fiber * ratio).toFixed(1))
            : undefined,
          sugar: food.nutrition.sugar
            ? parseFloat((food.nutrition.sugar * ratio).toFixed(1))
            : undefined,
        },
      });
      setModalVisible(false);
      setCustomAmount('100');
      setFoodSearchQuery('');
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Could not add food. Please try again.');
    }
  };

  // Yemek silme
  const handleRemoveFood = (id: string) => {
    try {
      if (!id) {
        console.error('Invalid food ID for removal');
        return;
      }
      removeFood(id);
    } catch (error) {
      console.error('Error removing food:', error);
      Alert.alert('Error', 'Could not remove food item. Please try again.');
    }
  };

  // Öğün türü seçme
  const mealTypes: Array<MealTypeConfig> = [
    { type: 'breakfast', label: 'Kahvaltı', icon: faEgg },
    { type: 'lunch', label: 'Öğle Yemeği', icon: faUtensils },
    { type: 'dinner', label: 'Akşam Yemeği', icon: faDrumstickBite },
    { type: 'snack', label: 'Atıştırmalık', icon: faCookie },
  ];

  // Kategoriler
  const categories: Array<CategoryConfig> = [
    { type: 'meyve', label: 'Meyveler', icon: faAppleWhole },
    { type: 'sebze', label: 'Sebzeler', icon: faCarrot },
    { type: 'et', label: 'Et Ürünleri', icon: faDrumstickBite },
    { type: 'tavuk', label: 'Tavuk', icon: faDrumstickBite },
    { type: 'balik', label: 'Balık', icon: faFish },
    { type: 'sut_urunleri', label: 'Süt Ürünleri', icon: faCheese },
    { type: 'tahil', label: 'Tahıllar', icon: faBreadSlice },
    { type: 'bakliyat', label: 'Bakliyat', icon: faBowlFood },
    { type: 'kuruyemis', label: 'Kuruyemiş', icon: faSeedling },
    { type: 'tatli', label: 'Tatlılar', icon: faCake },
    { type: 'hazir_yemek', label: 'Hazır Yemekler', icon: faTruckFast },
    { type: 'atistirmalik', label: 'Atıştırmalıklar', icon: faIceCream },
    { type: 'icecek', label: 'İçecekler', icon: faMugHot },
  ];

  // Modal açıldığında sık kullanılan besinleri göster
  const resetSearchAndShowFrequent = () => {
    setFoodSearchQuery('');
    setSelectedCategory(null);
    setFoodSearchResults(getFrequentFoodsForMealType(selectedMealType));
  };

  // Özel yemek eklemek için modal açma fonksiyonu
  const handleOpenCustomFoodModal = () => {
    console.log('handleOpenCustomFoodModal çağrıldı');
    setModalVisible(false); // Ana modalı kapat
    setTimeout(() => {
      // Zaman aşımından sonra özel yemek modalını aç
      setCustomFoodModalVisible(true);
      resetNewFoodForm();
      console.log('customFoodModalVisible: ', customFoodModalVisible);
    }, 300); // Animasyon için kısa bir gecikme
  };

  // Yemek arama modalı açıldığında çalışacak fonksiyon
  const handleOpenModal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    console.log('handleOpenModal çağrıldı, mealType:', mealType);
    setSelectedMealType(mealType);
    // Modal açmak yerine doğrudan AddFood ekranına yönlendir
    navigation.navigate('AddFood', { mealType });
  };

  // Besin değerlerini gösterme fonksiyonu
  const renderNutritionValue = (
    label: string,
    value: number,
    unit: string,
    goal: number,
    color: string,
  ) => (
    <View style={styles.nutritionItem}>
      <PaperText variant="bodyMedium" style={styles.nutritionLabel}>
        {label}
      </PaperText>
      <PaperText variant="headlineMedium" style={[styles.nutritionValue, { color }]}>
        {value.toString()}
      </PaperText>
      <PaperText variant="bodyMedium" style={styles.nutritionUnit}>
        {unit}
      </PaperText>
      <PaperText
        variant="bodySmall"
        style={styles.nutritionGoal}
      >{`Goal: ${goal} ${unit}`}</PaperText>
    </View>
  );

  // Öğün kartını render etme
  const renderMealCard = (mealType: MealType, title: string, icon: any) => {
    const entries = getEntriesByMealType(mealType);
    const totalCalories = entries.reduce((sum, entry) => sum + entry.nutrition.calories, 0);

    return (
      <Card style={[styles.mealCard, getCardStyle()]}>
        <Card.Content style={{ padding: 0 }}>
          <View style={styles.mealCardHeader}>
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
              elevation: 3,
              marginRight: 12
            }}>
              <FontAwesomeIcon icon={icon} size={24} color={primaryColor} />
            </View>
            <View style={styles.mealHeaderContent}>
              <Text style={[styles.mealTitle, { color: theme.colors.onSurface }]}>
                {title}
              </Text>
              <Text style={[styles.mealCalories, { color: theme.colors.onSurfaceVariant }]}>
                {totalCalories} kalori • {entries.length} öğe
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {entries.length === 0 ? (
            <View style={styles.emptyMealContainer}>
              <FontAwesomeIcon 
                icon={icon} 
                size={30} 
                color={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'} 
                style={{ marginBottom: 12 }} 
              />
              <Text style={[styles.emptyMeal, { color: theme.colors.onSurfaceVariant }]}>
                Henüz bu öğüne yemek eklenmemiş
              </Text>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {entries.map(entry => (
                <View 
                  key={entry.id} 
                  style={[styles.foodEntry, { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 16,
                    marginBottom: 10,
                    padding: 12
                  }]}
                >
                  <View style={styles.foodInfo}>
                    <Text style={[styles.foodName, { 
                      color: theme.colors.onSurface,
                      fontSize: 16,
                      fontWeight: '600'
                    }]}>
                      {entry.name}
                    </Text>
                    <Text style={[styles.foodAmount, { 
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 14
                    }]}>
                      {entry.amount}g
                    </Text>
                  </View>
                  <View style={styles.foodCalories}>
                    <Text style={[styles.calorieText, { 
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 14,
                      fontWeight: '600',
                      marginRight: 8
                    }]}>
                      {entry.nutrition.calories} kcal
                    </Text>
                    <TouchableOpacity
                      style={[styles.deleteButton, {
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)'
                      }]}
                      onPress={() => handleRemoveFood(entry.id)}
                    >
                      <FontAwesomeIcon 
                        icon={faTrash} 
                        size={16} 
                        color={theme.colors.error} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => handleOpenModal(mealType)}
            style={[styles.addFoodButton, {
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }]}
          >
            <FontAwesomeIcon 
              icon={faPlus} 
              size={16} 
              color={primaryColor} 
              style={{ marginRight: 8 }} 
            />
            <Text style={{
              color: primaryColor,
              fontWeight: '600',
              fontSize: 16
            }}>
              Yemek Ekle
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  // Özel yemek formu sıfırlama
  const resetNewFoodForm = () => {
    setNewFoodName('');
    setNewFoodCategory('tahil');
    setNewFoodAmount('100');
    setNewFoodUnit('g');
    setNewFoodCalories('');
    setNewFoodProtein('');
    setNewFoodCarbs('');
    setNewFoodFat('');
    setNewFoodFiber('');
    setNewFoodSugar('');
  };

  // Özel yemek ekleme fonksiyonu - güncellendi
  const handleAddCustomFood = async () => {
    try {
      // Form doğrulama
      if (!newFoodName || !newFoodCalories || !newFoodProtein || !newFoodCarbs || !newFoodFat) {
        Alert.alert(
          'Hata',
          'Lütfen gerekli tüm alanları doldurun (Yemek adı, kalori, protein, karbonhidrat ve yağ alanları zorunludur)',
        );
        return;
      }

      // Sayısal değerleri dönüştürme
      const amount = parseInt(newFoodAmount) || 100;
      const calories = parseInt(newFoodCalories) || 0;
      const protein = parseFloat(newFoodProtein) || 0;
      const carbs = parseFloat(newFoodCarbs) || 0;
      const fat = parseFloat(newFoodFat) || 0;
      const fiber = newFoodFiber ? parseFloat(newFoodFiber) : undefined;
      const sugar = newFoodSugar ? parseFloat(newFoodSugar) : undefined;

      // Değer doğrulama
      if (amount <= 0 || calories <= 0 || protein < 0 || carbs < 0 || fat < 0) {
        Alert.alert('Hata', 'Lütfen geçerli pozitif değerler girin');
        return;
      }

      // Özel yemeği veritabanına ekle
      const customFood = await addCustomFood({
        name: newFoodName.trim(),
        category: newFoodCategory,
        amount: amount,
        unit: newFoodUnit,
        nutrition: {
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          fiber: fiber,
          sugar: sugar,
        },
      });

      if (!customFood || !customFood.id) {
        throw new Error('Failed to create custom food');
      }

      // Yemeği kullanıcının günlük takibine ekle
      addFood({
        name: customFood.name,
        amount: amount,
        mealType: selectedMealType,
        nutrition: customFood.nutrition,
      });

      // Formu sıfırla ve modalı kapat
      setCustomFoodModalVisible(false);
      resetNewFoodForm();
      setModalVisible(false); // Ana modalı da kapat

      Alert.alert('Başarılı', 'Özel yemek başarıyla eklendi');
    } catch (error) {
      console.error('Özel yemek eklenirken hata:', error);
      Alert.alert('Hata', 'Yemek eklenirken bir sorun oluştu');
    }
  };

  // Yemek arama işlevini geliştiren yardımcı fonksiyon
  const performSearch = (query: string) => {
    try {
      if (!query || query.trim() === '') {
        setFoodSearchResults(getFrequentFoodsForMealType(selectedMealType));
        return;
      }

      // Arama yapıldığında kategori seçimini sıfırla
      setSelectedCategory(null);

      const results = searchByName(query);
      console.log(`"${query}" için ${results.length} sonuç bulundu`);
      setFoodSearchResults(results);

      // Sonuç yoksa kullanıcıya bildir
      if (results.length === 0) {
        // Kullanıcıya geri bildirim ver (UI'da zaten görünecek)
        console.log('Sonuç bulunamadı');
      }
    } catch (error) {
      console.error("Search error:", error);
      // If an error occurs, set empty results and don't crash
      setFoodSearchResults([]);
    }
  };

  // Yemek detay sayfasına yönlendirme
  const handleViewFoodDetails = (food: FoodData) => {
    if (!food || !food.nutrition) {
      Alert.alert('Error', 'Food data is incomplete');
      return;
    }
    
    // Alert.alert yerine FoodDetails ekranına yönlendiriyoruz
    navigation.navigate('FoodDetails', { foodId: food.id });
  };

  // Özel yemekler listesini açarken güncel listeyi yükle
  const handleOpenCustomFoodsList = async () => {
    try {
      await loadCustomFoods();
      const allFoods = getAllFoods();
      const customFoods = allFoods.filter(food => food.isCustom);
      setCustomFoodsList(customFoods);
      setCustomFoodsListModalVisible(true);
    } catch (error) {
      console.error('Özel yemekler yüklenirken hata:', error);
      Alert.alert('Hata', 'Özel yemekler yüklenirken bir sorun oluştu');
    }
  };

  // Özel yemek silme
  const handleDeleteCustomFood = async (id: string) => {
    try {
      await removeCustomFood(id);
      // Listeyi güncelle
      const allFoods = getAllFoods();
      const updatedCustomFoods = allFoods.filter(food => food.isCustom);
      setCustomFoodsList(updatedCustomFoods);
      Alert.alert('Başarılı', 'Özel yemek silindi');
    } catch (error) {
      console.error('Özel yemek silinirken hata:', error);
      Alert.alert('Hata', 'Yemek silinirken bir sorun oluştu');
    }
  };

  // Özel yemekler listesi modalı
  const renderCustomFoodsListModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={customFoodsListModalVisible}
      onRequestClose={() => setCustomFoodsListModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { 
          backgroundColor: theme.colors.surface,
          borderRadius: 24,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8
        }]}>
          <View style={styles.mealHeader}>
            <Title style={{ color: theme.colors.surface }}>Özel Yemeklerim</Title>
            <IconButton
              icon="close-circle"
              size={24}
              onPress={() => setCustomFoodsListModalVisible(false)}
            />
          </View>

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            icon="plus"
            onPress={() => {
              setCustomFoodsListModalVisible(false);
              handleOpenCustomFoodModal();
            }}
            style={{ marginBottom: 16 }}
          >
            Yeni Özel Yemek Ekle
          </Button>

          {customFoodsList.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.primary }}>
              Henüz özel yemek eklenmemiş. Kendi özel yemeklerinizi eklemek için "Yeni Özel Yemek
              Ekle" butonunu kullanın.
            </Text>
          ) : (
            <FlatList
              data={customFoodsList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.foodEntry}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text
                      style={styles.foodAmount}
                    >{`${item.amount}${item.unit} • ${item.nutrition.calories} kcal • ${item.category}`}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton
                      icon="delete-circle"
                      size={20}
                      color={theme.colors.error}
                      onPress={() => {
                        Alert.alert(
                          'Yemek Sil',
                          `"${item.name}" özel yemeğini silmek istediğinize emin misiniz?`,
                          [
                            { text: 'İptal', style: 'cancel' },
                            {
                              text: 'Sil',
                              onPress: () => handleDeleteCustomFood(item.id),
                              style: 'destructive',
                            },
                          ],
                        );
                      }}
                    />
                    <IconButton
                      icon="plus-circle"
                      size={20}
                      color={theme.colors.primary}
                      onPress={() => {
                        // Yemeği şuanki öğüne ekle
                        handleAddFood(item);
                        setCustomFoodsListModalVisible(false);
                      }}
                    />
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  // Besin arama modalını render etme fonksiyonu - Daha iyi kullanıcı deneyimi için yeniden yazıldı
  const renderFoodSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalContent, {
          backgroundColor: theme.colors.surface,
          borderRadius: 24,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8
        }]}>
          <View style={styles.modalHeader}>
            <PaperText variant="headlineMedium" style={styles.modalTitle} children="Yemek Ekle" />
            <IconButton 
              icon="close-circle"
              size={24} 
              onPress={() => setModalVisible(false)} 
            />
          </View>

          <Searchbar
            placeholder="Yemek ara..."
            onChangeText={performSearch}
            value={foodSearchQuery}
            style={styles.searchBar}
            icon="magnify"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <Chip
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
              style={styles.categoryChip}
            >
              Tümü
            </Chip>
            {categories.map(category => (
              <Chip
                key={category.type}
                selected={selectedCategory === category.type}
                onPress={() => setSelectedCategory(category.type)}
                style={styles.categoryChip}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>

          <FlatList
            data={foodSearchResults}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${item.nutrition.calories} kcal / ${item.amount}${item.unit || 'g'}`}
                left={(props: ListItemProps) => (
                  <View
                    style={{
                      width: props.size,
                      height: props.size,
                      borderRadius: props.size / 2,
                      backgroundColor: theme.colors.primaryContainer,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={categories.find(c => c.type === item.category)?.icon || faUtensils}
                      size={24}
                      color="#fff"
                    />
                  </View>
                )}
                right={(props: ListItemProps) => (
                  <View style={styles.foodItemRight}>
                    <TextInput
                      mode="outlined"
                      keyboardType="numeric"
                      value={customAmountFoodId === item.id ? customAmount : '100'}
                      onChangeText={(text: string) => {
                        setCustomAmount(text);
                        setCustomAmountFoodId(item.id);
                      }}
                      style={styles.amountInput}
                    />
                    <PaperText
                      variant="bodySmall"
                      style={styles.unitText}
                      children={item.unit || 'g'}
                    />
                    <Button
                      mode="contained"
                      onPress={() => handleAddFood(item)}
                      style={styles.addButton}
                    >
                      Ekle
                    </Button>
                  </View>
                )}
                onPress={() => handleViewFoodDetails(item)}
              />
            )}
          />

          <FAB
            icon="plus"
            onPress={handleOpenCustomFoodModal}
            style={[styles.fab, { 
              backgroundColor: theme.colors.primary,
              position: 'absolute',
              right: 16,
              bottom: 16,
              borderRadius: 28,
              elevation: 5
            }]}
          />
        </View>
      </View>
    </Modal>
  );

  // Özel yemek modalı içeriği - Kullanıcı deneyimi iyileştirildi
  const renderCustomFoodModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={customFoodModalVisible}
      onRequestClose={() => setCustomFoodModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { 
          backgroundColor: theme.colors.surface,
          borderRadius: 24,
          padding: 16
        }]}>
          <View style={styles.mealHeader}>
            <Title style={{ color: theme.colors.surface }}>Özel Yemek Ekle</Title>
            <IconButton 
              icon="close-circle"
              size={24} 
              onPress={() => setCustomFoodModalVisible(false)} 
            />
          </View>

          <Divider style={styles.divider} />

          <ScrollView style={{ flex: 1 }}>
            {/* Temel Bilgiler Bölümü */}
            <Surface style={[styles.formSection, {
              borderRadius: 16,
              elevation: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.colors.background
            }]}>
              <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
              <TextInput
                placeholder="Yemek Adı (zorunlu)"
                value={newFoodName}
                onChangeText={setNewFoodName}
                style={styles.customFoodInput}
                mode="outlined"
                right={<TextInput.Icon icon="food" />}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                  placeholder="Miktar"
                  value={newFoodAmount}
                  onChangeText={setNewFoodAmount}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, { width: '48%' }]}
                  mode="outlined"
                  right={<TextInput.Icon icon="weight" />}
                />

                <View
                  style={{
                    width: '48%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Chip
                    selected={newFoodUnit === 'g'}
                    onPress={() => setNewFoodUnit('g')}
                    style={{ marginRight: 5 }}
                  >
                    g
                  </Chip>
                  <Chip
                    selected={newFoodUnit === 'ml'}
                    onPress={() => setNewFoodUnit('ml')}
                    style={{ marginRight: 5 }}
                  >
                    ml
                  </Chip>
                  <Chip selected={newFoodUnit === 'adet'} onPress={() => setNewFoodUnit('adet')}>
                    adet
                  </Chip>
                </View>
              </View>
            </Surface>

            {/* Kategori Bölümü */}
            <Surface style={[styles.formSection, {
              borderRadius: 16,
              elevation: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.colors.background
            }]}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 8 }}
              >
                {categories.map(category => (
                  <Chip
                    key={category.type}
                    selected={newFoodCategory === category.type}
                    onPress={() => setNewFoodCategory(category.type)}
                    style={{ marginRight: 8, marginBottom: 5 }}
                  >
                    {category.label}
                  </Chip>
                ))}
              </ScrollView>
            </Surface>

            {/* Besin Değerleri Bölümü */}
            <Surface style={[styles.formSection, {
              borderRadius: 16,
              elevation: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.colors.background
            }]}>
              <Text style={styles.sectionTitle}>Besin Değerleri (100g/100ml için)</Text>
              <View style={styles.formGrid}>
                <TextInput
                  placeholder="Kalori (kcal) *"
                  value={newFoodCalories}
                  onChangeText={setNewFoodCalories}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, styles.gridItem]}
                  mode="outlined"
                  right={<TextInput.Icon icon="fire" />}
                />
                <TextInput
                  placeholder="Protein (g) *"
                  value={newFoodProtein}
                  onChangeText={setNewFoodProtein}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, styles.gridItem]}
                  mode="outlined"
                  right={<TextInput.Icon icon="arm-flex" />}
                />
                <TextInput
                  placeholder="Karbonhidrat (g) *"
                  value={newFoodCarbs}
                  onChangeText={setNewFoodCarbs}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, styles.gridItem]}
                  mode="outlined"
                  right={<TextInput.Icon icon="bread-slice" />}
                />
                <TextInput
                  placeholder="Yağ (g) *"
                  value={newFoodFat}
                  onChangeText={setNewFoodFat}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, styles.gridItem]}
                  mode="outlined"
                  right={<TextInput.Icon icon="oil" />}
                />
                <TextInput
                  placeholder="Lif (g)"
                  value={newFoodFiber}
                  onChangeText={setNewFoodFiber}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, styles.gridItem]}
                  mode="outlined"
                  right={<TextInput.Icon icon="tree" />}
                />
                <TextInput
                  placeholder="Şeker (g)"
                  value={newFoodSugar}
                  onChangeText={setNewFoodSugar}
                  keyboardType="numeric"
                  style={[styles.customFoodInput, styles.gridItem]}
                  mode="outlined"
                  right={<TextInput.Icon icon="cube" />}
                />
              </View>
              <Text style={styles.helpText}>* işaretli alanlar zorunludur</Text>
            </Surface>

            <Button
              mode="contained"
              onPress={handleAddCustomFood}
              style={{ marginTop: 16, marginBottom: 24 }}
              disabled={
                !newFoodName || !newFoodCalories || !newFoodProtein || !newFoodCarbs || !newFoodFat
              }
              icon="check-circle"
            >
              Yemek Ekle
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  useEffect(() => {
    setCustomFoodModalVisible(false);
    // Diğer state sıfırlamaları
  }, []);

  // Bugünün tarihini format olarak döndür
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Stiller component içerisinde tanımlanıyor
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    headerBar: {
      flexDirection: 'row' as 'row',
      justifyContent: 'space-between' as 'space-between',
      alignItems: 'center' as 'center',
      padding: 16,
      backgroundColor: '#fff',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 2,
    },
    headerIcons: {
      flexDirection: 'row',
    },
    iconButton: {
      marginLeft: 16,
    },
    scrollContent: {
      flex: 1,
    },
    calorieCard: {
      margin: 16,
      elevation: 2,
    },
    calorieContent: {
      padding: 16,
    },
    calorieRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    calorieNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#4285F4',
    },
    calorieText: {
      fontSize: 14,
      color: '#666',
    },
    goalNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#34A853',
    },
    goalText: {
      fontSize: 14,
      color: '#666',
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    summaryCard: {
      margin: 16,
      marginTop: 0,
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    dateText: {
      fontSize: 14,
      color: '#666',
    },
    dividerLine: {
      marginVertical: 8,
    },
    mealRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    mealIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    mealInfo: {
      flex: 1,
    },
    mealName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    mealStats: {
      fontSize: 14,
      color: '#666',
    },
    addButton: {
      marginLeft: 8,
    },
    mealDivider: {
      marginVertical: 8,
    },
    nutritionCard: {
      margin: 16,
      marginTop: 0,
    },
    nutritionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    nutritionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    nutritionItem: {
      width: '48%',
    },
    nutritionLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    nutritionValue: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    nutritionUnit: {
      fontSize: 12,
      color: '#666',
      marginTop: 2,
    },
    nutritionGoal: {
      fontSize: 12,
      color: '#666',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginHorizontal: 16,
      marginTop: 16,
    },
    mealCard: {
      margin: 16,
      marginTop: 8,
    },
    mealCardIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mealAddButton: {
      marginLeft: 'auto',
    },
    mealCardContent: {
      padding: 16,
    },
    emptyMeal: {
      fontSize: 14,
      color: '#666',
      fontStyle: 'italic',
    },
    foodEntry: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    foodEntryInfo: {
      flex: 1,
    },
    foodEntryName: {
      fontSize: 14,
      fontWeight: '500',
    },
    foodEntryDetails: {
      fontSize: 12,
      color: '#666',
    },
    deleteButton: {
      marginLeft: 8,
    },
    floatingActionButton: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      borderRadius: 28,
      elevation: 5,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      padding: 16,
      borderRadius: 8,
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
    divider: {
      marginVertical: 16,
    },
    formSection: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    formGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridItem: {
      width: '48%',
      marginBottom: 16,
    },
    customFoodInput: {
      marginBottom: 16,
    },
    helpText: {
      fontSize: 12,
      color: '#666',
      marginTop: 8,
    },
    categoryScroll: {
      marginVertical: 16,
    },
    categoryChip: {
      marginRight: 8,
    },
    foodItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    amountInput: {
      width: 60,
      marginRight: 4,
    },
    unitText: {
      marginRight: 8,
    },
    avatarIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    text: {
      fontSize: 16,
    },
    image: {
      width: 100,
      height: 100,
    },
    scrollView: {
      flex: 1,
    },
    modalView: {
      flex: 1,
    },
    searchBar: {
      marginVertical: 10,
    },
    categoryChips: {
      flexDirection: 'row',
    },
    foodItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 6,
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    customAmountContainer: {
      flexDirection: 'row',
    },
    nutritionRow: {
      flexDirection: 'row',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 16,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mealTitleWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mealTitle: {
      marginLeft: 10,
    },
    mealCalories: {
      color: '#666',
    },
    foodInfo: {
      flex: 1,
    },
    foodName: {
      fontWeight: 'bold',
    },
    foodAmount: {
      fontSize: 12,
      color: '#666',
    },
    foodCalories: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addFoodButton: {
      marginTop: 12,
    },
    header: {
      padding: 12,
      paddingTop: 16,
      paddingBottom: 14,
      backgroundColor: '#fff',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerLeft: {
      flex: 1,
    },
    headerSubtitle: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 2,
    },
    headerInfo: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    calorieCircleContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: secondaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    calorieCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: secondaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    calorieValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#FF5733',
    },
    calorieUnit: {
      fontSize: 12,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#FF5733',
    },
    caloriePercentage: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 87, 51, 0.1)',
      marginTop: 4,
    },
    caloriePercentageText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#FF5733',
      textAlign: 'right',
      marginTop: 2,
    },
    progressContainer: {
      marginTop: 2,
      paddingHorizontal: 12,
    },
    progressBarContainer: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: '#ffffff',
    },
    card: {
      margin: 16,
      marginTop: 8,
    },
    cardContent: {
      padding: 16,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    nutritionItemIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    nutritionItemContent: {
      flex: 1,
    },
    nutritionProgress: {
      height: 10,
      borderRadius: 5,
      backgroundColor: '#f0f0f0',
      marginVertical: 4,
    },
    nutritionProgressFill: {
      height: '100%',
      borderRadius: 5,
    },
    mealCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mealHeaderContent: {
      flex: 1,
    },
    emptyMealContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>
              {getFormattedDate()}
            </Text>
            <Text style={styles.headerTitle}>Beslenme Takibi</Text>
            <Text style={styles.headerInfo}>
              Hedef: {goals.calories} kalori
            </Text>
          </View>
          
          <View style={styles.calorieCircleContainer}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieValue}>
                {dailyNutrition.calories}
              </Text>
              <Text style={styles.calorieUnit}>
                kalori
              </Text>
            </View>
          </View>
        </View>
        
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 4}}>
          <Text style={styles.caloriePercentageText}>
            {goalPercentages.calories}% tamamlandı
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(goalPercentages.calories, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Besin Değerleri Kartı */}
        <Card style={[styles.card, getCardStyle()]}>
          <Card.Content style={styles.cardContent}>
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
                <FontAwesomeIcon icon={faScaleBalanced} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Besin Değerleri</Text>
            </View>

            <View style={styles.nutritionGrid}>
              <View style={[styles.nutritionItem, getNutritionItemStyle('#4285F4')]}>
                <View style={styles.nutritionItemIcon}>
                  <FontAwesomeIcon icon={faDumbbell} size={18} color="#4285F4" />
                </View>
                <View style={styles.nutritionItemContent}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={[styles.nutritionValue, { color: '#4285F4' }]}>{dailyNutrition.protein}g</Text>
                  <View style={styles.nutritionProgress}>
                    <View 
                      style={[styles.nutritionProgressFill, { 
                        width: `${Math.min((dailyNutrition.protein / goals.protein) * 100, 100)}%`,
                        backgroundColor: '#4285F4' 
                      }]} 
                    />
                  </View>
                  <Text style={styles.nutritionGoal}>Hedef: {goals.protein}g</Text>
                </View>
              </View>

              <View style={[styles.nutritionItem, getNutritionItemStyle('#FF9800')]}>
                <View style={styles.nutritionItemIcon}>
                  <FontAwesomeIcon icon={faBreadSlice} size={18} color="#FF9800" />
                </View>
                <View style={styles.nutritionItemContent}>
                  <Text style={styles.nutritionLabel}>Karbonhidrat</Text>
                  <Text style={[styles.nutritionValue, { color: '#FF9800' }]}>{dailyNutrition.carbs}g</Text>
                  <View style={styles.nutritionProgress}>
                    <View 
                      style={[styles.nutritionProgressFill, { 
                        width: `${Math.min((dailyNutrition.carbs / goals.carbs) * 100, 100)}%`,
                        backgroundColor: '#FF9800' 
                      }]} 
                    />
                  </View>
                  <Text style={styles.nutritionGoal}>Hedef: {goals.carbs}g</Text>
                </View>
              </View>

              <View style={[styles.nutritionItem, getNutritionItemStyle('#FFD600')]}>
                <View style={styles.nutritionItemIcon}>
                  <FontAwesomeIcon icon={faOilCan} size={18} color="#FFD600" />
                </View>
                <View style={styles.nutritionItemContent}>
                  <Text style={styles.nutritionLabel}>Yağ</Text>
                  <Text style={[styles.nutritionValue, { color: '#FFD600' }]}>{dailyNutrition.fat}g</Text>
                  <View style={styles.nutritionProgress}>
                    <View 
                      style={[styles.nutritionProgressFill, { 
                        width: `${Math.min((dailyNutrition.fat / goals.fat) * 100, 100)}%`,
                        backgroundColor: '#FFD600' 
                      }]} 
                    />
                  </View>
                  <Text style={styles.nutritionGoal}>Hedef: {goals.fat}g</Text>
                </View>
              </View>

              <View style={[styles.nutritionItem, getNutritionItemStyle('#4CAF50')]}>
                <View style={styles.nutritionItemIcon}>
                  <FontAwesomeIcon icon={faLeaf} size={18} color="#4CAF50" />
                </View>
                <View style={styles.nutritionItemContent}>
                  <Text style={styles.nutritionLabel}>Lif</Text>
                  <Text style={[styles.nutritionValue, { color: '#4CAF50' }]}>{dailyNutrition.fiber || 0}g</Text>
                  <View style={styles.nutritionProgress}>
                    <View 
                      style={[styles.nutritionProgressFill, { 
                        width: `${Math.min(((dailyNutrition.fiber || 0) / 25) * 100, 100)}%`,
                        backgroundColor: '#4CAF50' 
                      }]} 
                    />
                  </View>
                  <Text style={styles.nutritionGoal}>Hedef: 25g</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Günlük Öğünler</Text>

        {mealTypes.map(meal => (
          <Card key={meal.type} style={[styles.mealCard, getCardStyle()]}>
            <View
              style={{
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[styles.mealCardIcon, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <FontAwesomeIcon icon={meal.icon} size={22} color={theme.colors.primary} />
                </View>
                <Text style={[styles.mealName, { marginLeft: 10 }]}>{meal.label}</Text>
              </View>
              <TouchableOpacity
                style={styles.mealAddButton}
                onPress={() => handleOpenModal(meal.type)}
              >
                <FontAwesomeIcon icon={faPlus} size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <Card.Content style={styles.mealCardContent}>
              {getEntriesByMealType(meal.type).length === 0 ? (
                <Text style={styles.emptyMeal}>Henüz bu öğüne yemek eklenmemiş.</Text>
              ) : (
                getEntriesByMealType(meal.type).map(entry => (
                  <View key={entry.id} style={styles.foodEntry}>
                    <View style={styles.foodEntryInfo}>
                      <Text style={styles.foodEntryName}>{entry.name}</Text>
                      <Text style={styles.foodEntryDetails}>
                        {entry.amount}g • {entry.nutrition.calories} kcal
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemoveFood(entry.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Yemek arama modalı */}
      {renderFoodSearchModal()}

      {/* Özel yemek modalı */}
      {renderCustomFoodModal()}

      {/* Özel yemekler listesi modalı */}
      {renderCustomFoodsListModal()}

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
        onPress={() => handleOpenModal('snack')}
      >
        <FontAwesomeIcon icon={faPlus} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FoodTrackerScreen;
