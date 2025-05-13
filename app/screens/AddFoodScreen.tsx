import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faSearch, 
  faUtensils, 
  faAppleWhole,
  faCarrot,
  faCheese,
  faDrumstickBite,
  faBreadSlice,
  faBowlFood,
  faSeedling,
  faCake,
  faTruckFast,
  faIceCream,
  faMugHot,
  faFish,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { 
  Card, 
  Divider, 
  Button, 
  Chip,
  Searchbar,
  IconButton
} from '../utils/paperComponents';
import useFoodTracker from '../hooks/useFoodTracker';
import { 
  FoodData, 
  FoodCategory, 
  getAllFoods, 
  searchByName, 
  filterByCategory,
  getFrequentFoodsForMealType
} from '../data/foodDatabase';

type AddFoodScreenRouteProp = RouteProp<RootStackParamList, 'AddFood'>;

type AddFoodScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddFood'
>;

interface AddFoodScreenProps {
  route: AddFoodScreenRouteProp;
  navigation: AddFoodScreenNavigationProp;
}

// Kategori yapılandırması
interface CategoryConfig {
  type: FoodCategory;
  label: string;
  icon: any;
}

const AddFoodScreen: React.FC<AddFoodScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { mealType = 'breakfast' } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [foodResults, setFoodResults] = useState<FoodData[]>([]);
  const [customAmount, setCustomAmount] = useState('100');
  const [customAmountFoodId, setCustomAmountFoodId] = useState('');
  
  const { addFood } = useFoodTracker();

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

  // Component yüklendiğinde ve kategori veya arama değiştiğinde çalışır
  useEffect(() => {
    loadFoods();
  }, [searchQuery, selectedCategory]);

  // Başlangıç yüklenmesi
  useEffect(() => {
    // İlk yüklemede sık kullanılan besinleri göster
    const initialFoods = getFrequentFoodsForMealType(mealType);
    setFoodResults(initialFoods);
  }, [mealType]);

  // Yemekleri yükleme fonksiyonu
  const loadFoods = () => {
    try {
      if (selectedCategory) {
        // Kategori seçilmişse, kategori filtrele
        setFoodResults(filterByCategory(selectedCategory));
      } else if (searchQuery.trim() !== '') {
        // Arama yapılıyorsa, isme göre ara
        const results = searchByName(searchQuery);
        setFoodResults(results);
      } else {
        // Hiçbir filtreleme yoksa, öğün tipine göre sık kullanılanları göster
        setFoodResults(getFrequentFoodsForMealType(mealType));
      }
    } catch (error) {
      console.error("Yemekler yüklenirken hata:", error);
      setFoodResults([]);
    }
  };

  // Yemek ekleme fonksiyonu
  const handleAddFood = (food: FoodData) => {
    try {
      const amount = parseInt(customAmountFoodId === food.id ? customAmount : '100') || 100;

      if (amount <= 0 || amount > 10000) {
        alert('Lütfen 1-10000 arasında bir miktar girin');
        return;
      }

      // Oranı hesapla (100g üzerinden verilen değerleri istenilen miktara göre ayarla)
      const ratio = amount / (food.amount || 100);

      addFood({
        name: food.name,
        amount: amount,
        mealType: mealType,
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

      navigation.goBack();
    } catch (error) {
      console.error('Yemek eklenirken hata:', error);
      alert('Yemek eklenirken bir hata oluştu');
    }
  };

  // Kategori ikonu getiren yardımcı fonksiyon
  const getCategoryIcon = (category: FoodCategory) => {
    const categoryConfig = categories.find(c => c.type === category);
    return categoryConfig?.icon || faUtensils;
  };

  // Mealtype türüne göre başlık
  const getMealTypeTitle = () => {
    switch (mealType) {
      case 'breakfast': return 'Kahvaltı';
      case 'lunch': return 'Öğle Yemeği';
      case 'dinner': return 'Akşam Yemeği';
      case 'snack': return 'Atıştırmalık';
      default: return 'Öğün';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          {getMealTypeTitle()} için Besin Ekle
        </Text>
      </View>

      <Searchbar
        placeholder="Besin ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
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
        data={foodResults}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Besin listesi yüklenemedi'}
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.foodCard}>
            <View style={styles.foodItem}>
              <View style={styles.foodIconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                  <FontAwesomeIcon 
                    icon={getCategoryIcon(item.category)} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </View>
              </View>
              <View style={styles.foodInfo}>
                <Text style={[styles.foodName, { color: theme.colors.onSurface }]}>
                  {item.name}
                </Text>
                <Text style={[styles.foodDetails, { color: theme.colors.onSurfaceVariant }]}>
                  {item.nutrition.calories} kcal / {item.amount}{item.unit || 'g'}
                </Text>
              </View>
              <View style={styles.foodActions}>
                <TextInput
                  style={[styles.amountInput, { 
                    borderColor: theme.colors.outline, 
                    color: theme.colors.onSurface 
                  }]}
                  value={customAmountFoodId === item.id ? customAmount : '100'}
                  onChangeText={(text) => {
                    setCustomAmount(text);
                    setCustomAmountFoodId(item.id);
                  }}
                  keyboardType="numeric"
                  placeholder="100"
                />
                <Text style={[styles.unitText, { color: theme.colors.onSurfaceVariant }]}>
                  {item.unit || 'g'}
                </Text>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleAddFood(item)}
                >
                  <FontAwesomeIcon icon={faPlus} size={16} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.cancelButton, { borderColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.primary }}
        >
          İptal
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  categoryScroll: {
    marginVertical: 8,
    maxHeight: 40,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  foodCard: {
    marginBottom: 8,
    marginHorizontal: 8,
  },
  foodItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  foodIconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodDetails: {
    fontSize: 14,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderRadius: 4,
    textAlign: 'center',
    marginRight: 4,
  },
  unitText: {
    marginRight: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    width: '100%',
  },
});

export default AddFoodScreen; 