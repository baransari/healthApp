import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faWater,
  faAppleWhole,
  faFire,
  faRunning,
  faPersonWalking,
  faUser,
  faQuestion,
  faBed,
  faCog,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';

// Auth Screens
import LoginScreen from '../screens/AuthScreens/LoginScreen';
import RegisterScreen from '../screens/AuthScreens/RegisterScreen';
import ForgotPasswordScreen from '../screens/AuthScreens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import FoodTrackerScreen from '../screens/FoodTrackerScreen';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import StepTrackerScreen from '../screens/StepTrackerScreen';
import SleepTrackerScreen from '../screens/SleepTrackerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NutritionGoalsScreen from '../screens/NutritionGoalsScreen';
import SplashScreen from '../screens/SplashScreen';
import FoodDetailsScreen from '../screens/FoodDetailsScreen';
import AddFoodScreen from '../screens/AddFoodScreen';

// Components
import AutoUpdaterComponent from '../components/AutoUpdaterComponent';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// String indexing interface
interface TabIconInfo {
  icon: IconDefinition;
  label: string;
}

// Tab icons mapping
const TAB_ICONS: Record<keyof MainTabParamList, TabIconInfo> = {
  Home: { icon: faHome, label: 'Ana Sayfa' },
  WaterTracker: { icon: faWater, label: 'Su' },
  FoodTracker: { icon: faAppleWhole, label: 'Beslenme' },
  CalorieTracker: { icon: faFire, label: 'Kalori' },
  ExerciseTracker: { icon: faRunning, label: 'Egzersiz' },
  StepTracker: { icon: faPersonWalking, label: 'Adımlar' },
  SleepTracker: { icon: faBed, label: 'Uyku' },
  Profile: { icon: faUser, label: 'Profil' },
};

const MainTabs: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        const routeName = route.name as keyof MainTabParamList;
        const icon = TAB_ICONS[routeName]?.icon || faQuestion;

        return {
          tabBarIcon: ({ color, size }) => {
            return <FontAwesomeIcon icon={icon} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        };
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Ana Sayfa',
          tabBarLabel: TAB_ICONS.Home.label,
        }}
      />
      <Tab.Screen
        name="WaterTracker"
        component={WaterTrackerScreen}
        options={{
          headerTitle: 'Su Takibi',
          tabBarLabel: TAB_ICONS.WaterTracker.label,
        }}
      />
      <Tab.Screen
        name="FoodTracker"
        component={FoodTrackerScreen}
        options={{
          headerTitle: 'Beslenme Takibi',
          tabBarLabel: TAB_ICONS.FoodTracker.label,
        }}
      />
      <Tab.Screen
        name="CalorieTracker"
        component={CalorieTrackerScreen}
        options={{
          headerTitle: 'Kalori Takibi',
          tabBarLabel: TAB_ICONS.CalorieTracker.label,
        }}
      />
      <Tab.Screen
        name="ExerciseTracker"
        component={ExerciseScreen}
        options={{
          headerTitle: 'Egzersiz',
          tabBarLabel: TAB_ICONS.ExerciseTracker.label,
        }}
      />
      <Tab.Screen
        name="StepTracker"
        component={StepTrackerScreen}
        options={{
          headerTitle: 'Adım Takibi',
          tabBarLabel: TAB_ICONS.StepTracker.label,
        }}
      />
      <Tab.Screen
        name="SleepTracker"
        component={SleepTrackerScreen}
        options={{
          headerTitle: 'Uyku Takibi',
          tabBarLabel: TAB_ICONS.SleepTracker.label,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profil',
          tabBarLabel: TAB_ICONS.Profile.label,
        }}
      />
    </Tab.Navigator>
  );
});

const AppNavigator: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="NutritionGoals"
          component={NutritionGoalsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Beslenme Hedefleri',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Ayarlar',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="ExerciseDetails"
          component={ExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Egzersiz Detayları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="AddWorkout"
          component={ExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Yeni Egzersiz Ekle',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerTitle: 'Profil Düzenle',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="NotificationsSettings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Bildirim Ayarları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="GoalSettings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Hedef Ayarları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="ThemeSettings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Tema Ayarları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="FoodDetails"
          component={FoodDetailsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Beslenme Detayları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="AddFood"
          component={AddFoodScreen}
          options={{
            headerShown: true,
            headerTitle: 'Beslenme Ekle',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
      </Stack.Navigator>
      <AutoUpdaterComponent />
    </>
  );
});

export default AppNavigator;
