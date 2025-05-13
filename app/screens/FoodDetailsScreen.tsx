import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faArrowLeft, 
  faUtensils, 
  faFire, 
  faWeight,
  faEgg,
  faBreadSlice,
  faOilCan
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card, Divider } from '../utils/paperComponents';
import type { ExtendedMD3Theme } from '../types';
import useFoodTracker from '../hooks/useFoodTracker';
import { FoodData } from '../data/foodDatabase';

type FoodDetailsScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetails'>;

type FoodDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FoodDetails'
>;

interface FoodDetailsScreenProps {
  route: FoodDetailsScreenRouteProp;
  navigation: FoodDetailsScreenNavigationProp;
}

const FoodDetailsScreen: React.FC<FoodDetailsScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { foodId } = route.params;
  const [food, setFood] = useState<FoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addFood } = useFoodTracker();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        setLoading(true);
        // Dinamik olarak foodDatabase modülünü import etme
        const foodDatabaseModule = await import('../data/foodDatabase');
        // ID'ye göre seçilen yiyeceği bul
        const allFoods = foodDatabaseModule.getAllFoods();
        const foundFood = allFoods.find(item => item.id === foodId);
        
        if (foundFood) {
          setFood(foundFood);
        } else {
          console.error('Yiyecek bulunamadı, ID:', foodId);
        }
      } catch (error) {
        console.error('Yiyecek detayları yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFoodDetails();
  }, [foodId]);

  const handleAddFood = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (food) {
      // foodData nesnesini FoodEntry nesnesine dönüştürme
      addFood({
        name: food.name,
        amount: food.amount,
        mealType: mealType,
        nutrition: food.nutrition,
      });
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!food) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>
          Yiyecek bulunamadı. Lütfen tekrar deneyin.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            size={24} 
            color={theme.colors.onPrimary} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          {food.name}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.foodIconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
              <FontAwesomeIcon 
                icon={faUtensils} 
                size={40} 
                color={theme.colors.onPrimaryContainer} 
              />
            </View>
            <Text style={[styles.foodName, { color: theme.colors.onBackground }]}>
              {food.name}
            </Text>
            <Text style={[styles.foodCategory, { color: theme.colors.onSurfaceVariant }]}>
              {food.category}
            </Text>
            <Text style={[styles.portionInfo, { color: theme.colors.onSurfaceVariant }]}>
              {food.amount} {food.unit || 'g'} porsiyon
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.nutritionContainer}>
            <Text style={[styles.nutritionTitle, { color: theme.colors.onBackground }]}>
              Besin Değerleri
            </Text>
            
            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: theme.colors.errorContainer }]}>
                <FontAwesomeIcon icon={faFire} size={18} color={theme.colors.error} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  Kalori
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.calories} kcal
                </Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                <FontAwesomeIcon icon={faEgg} size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  Protein
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.protein} g
                </Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                <FontAwesomeIcon icon={faBreadSlice} size={18} color={theme.colors.secondary} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  Karbonhidrat
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.carbs} g
                </Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <FontAwesomeIcon icon={faOilCan} size={18} color={theme.colors.tertiary} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  Yağ
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.fat} g
                </Text>
              </View>
            </View>

            {food.nutrition.fiber !== undefined && (
              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                  <FontAwesomeIcon icon={faWeight} size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.nutritionTextContainer}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                    Lif
                  </Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                    {food.nutrition.fiber} g
                  </Text>
                </View>
              </View>
            )}

            {food.nutrition.sugar !== undefined && (
              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIconContainer, { backgroundColor: theme.colors.errorContainer }]}>
                  <FontAwesomeIcon icon={faWeight} size={18} color={theme.colors.error} />
                </View>
                <View style={styles.nutritionTextContainer}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                    Şeker
                  </Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                    {food.nutrition.sugar} g
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        <View style={styles.actionsContainer}>
          <Text style={[styles.addToMealTitle, { color: theme.colors.onBackground }]}>
            Öğüne Ekle
          </Text>
          
          <View style={styles.mealButtonsContainer}>
            <Button
              mode="contained"
              onPress={() => handleAddFood('breakfast')}
              style={[styles.mealButton, { backgroundColor: theme.colors.primary }]}
            >
              Kahvaltı
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleAddFood('lunch')}
              style={[styles.mealButton, { backgroundColor: theme.colors.secondary }]}
            >
              Öğle Yemeği
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleAddFood('dinner')}
              style={[styles.mealButton, { backgroundColor: theme.colors.tertiary }]}
            >
              Akşam Yemeği
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleAddFood('snack')}
              style={[styles.mealButton, { backgroundColor: theme.colors.primary }]}
            >
              Atıştırmalık
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  foodIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  foodCategory: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  portionInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  nutritionContainer: {
    marginTop: 8,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nutritionTextContainer: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 14,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  addToMealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealButtonsContainer: {
    gap: 12,
  },
  mealButton: {
    marginBottom: 8,
  },
});

export default FoodDetailsScreen; 