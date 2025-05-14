import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
// Redux imports
import * as ReactRedux from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setDailySteps, updateStepGoal, setIsStepAvailable } from '../store/stepTrackerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extract hooks from ReactRedux
const useDispatch = ReactRedux.useDispatch;
const useSelector = ReactRedux.useSelector;

// Type-safe hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: <T>(selector: (state: RootState) => T) => T = useSelector;

// Storage keys
const STORAGE_KEYS = {
  STEP_GOAL: '@HealthTrackAI:stepGoal',
};

// Default daily step goal
const DEFAULT_STEP_GOAL = 10000;

// Pedometer type definitions
interface PedometerResult {
  steps: number;
}

interface Subscription {
  remove: () => void;
}

interface Pedometer {
  isAvailableAsync: () => Promise<boolean>;
  getStepCountAsync: (start: Date, end: Date) => Promise<PedometerResult>;
  watchStepCount: (callback: (result: PedometerResult) => void) => Subscription;
}

// Import Pedometer or create a mock if unavailable
let Pedometer: Pedometer | null = null;

// Safely import Pedometer module
try {
  // Import Expo Sensors explicitly with require
  const ExpoSensors = require('expo-sensors');
  // Check if Pedometer exists in the module
  if (ExpoSensors && ExpoSensors.Pedometer) {
    Pedometer = ExpoSensors.Pedometer;
  } else {
    console.warn('Pedometer not found in expo-sensors');
  }
} catch (error) {
  console.warn('Failed to import Pedometer from expo-sensors:', error);
}

// Create mock/simulation if Pedometer is not available
if (!Pedometer) {
  console.log('Using simulated Pedometer');
  Pedometer = {
    isAvailableAsync: async () => false,
    getStepCountAsync: async () => ({ steps: 0 }),
    watchStepCount: () => ({ remove: () => {} }),
  };
}

// Step simulator for devices without pedometer
class StepSimulator {
  private steps: number = 0;
  private callbacks: ((steps: number) => void)[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    // Generate random steps (every 5-10 seconds)
    this.timer = setInterval(() => {
      // Add 10-30 random steps
      const newSteps = Math.floor(Math.random() * 20) + 10;
      this.steps += newSteps;

      // Call all callbacks
      this.callbacks.forEach(callback => callback(this.steps));
    }, Math.random() * 5000 + 5000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  registerCallback(callback: (steps: number) => void): Subscription {
    this.callbacks.push(callback);
    return {
      remove: () => {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
      },
    };
  }

  getTotalSteps(): number {
    return this.steps;
  }

  reset(): void {
    this.steps = 0;
  }
}

// Create step simulator instance
const stepSimulator = new StepSimulator();

// Calculate start and end time (beginning and end of today)
const getStartAndEndTime = () => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

export default function useStepTracker() {
  const dispatch = useAppDispatch();

  // Get step data from Redux state
  const { dailySteps, stepGoal, isStepAvailable } = useAppSelector(
    (state: RootState) => state.stepTracker
  );

  // Load step goal from AsyncStorage
  useEffect(() => {
    const loadStepGoal = async () => {
      try {
        const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.STEP_GOAL);
        if (savedGoal) {
          dispatch(updateStepGoal(parseInt(savedGoal, 10)));
        }
      } catch (error) {
        console.error('Error loading step goal:', error);
      }
    };

    loadStepGoal();
  }, [dispatch]);

  // Check if sensor is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        if (!Pedometer) {
          dispatch(setIsStepAvailable(false));
          console.log('Pedometer module not found, simulation mode active.');

          // Start simulation mode and add some random steps to redux
          stepSimulator.start();
          dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // Random steps between 3000-5000
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        dispatch(setIsStepAvailable(isAvailable));
        console.log('Pedometer availability:', isAvailable);

        if (!isAvailable) {
          // Start simulation mode if sensor is not available
          stepSimulator.start();
          dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // Random steps between 3000-5000
        }
      } catch (error) {
        console.error('Error checking pedometer:', error);
        dispatch(setIsStepAvailable(false));

        // Start simulation mode in case of error
        stepSimulator.start();
        dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // Random steps between 3000-5000
      }
    };

    checkAvailability();

    // Stop simulator when component unmounts
    return () => {
      stepSimulator.stop();
    };
  }, [dispatch]);

  // Track daily steps (if Pedometer is available)
  useEffect(() => {
    if (!isStepAvailable || !Pedometer) return;

    const { start, end } = getStartAndEndTime();
    let subscription: Subscription | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const trackSteps = async () => {
      try {
        // Get today's step count
        const result = await Pedometer.getStepCountAsync(start, end);
        dispatch(setDailySteps(result.steps));
        console.log('Daily steps:', result.steps);
        retryCount = 0; // Reset retry count on success

        // Start real-time step tracking
        subscription = Pedometer.watchStepCount((result: PedometerResult) => {
          console.log('Steps detected:', result.steps);
          const { start: newStart, end: newEnd } = getStartAndEndTime();

          // Get total daily step count
          Pedometer.getStepCountAsync(newStart, newEnd)
            .then((data: PedometerResult) => {
              dispatch(setDailySteps(data.steps));
            })
            .catch((error: Error) => {
              console.error('Error getting steps:', error);
            });
        });
      } catch (error) {
        console.error('Error tracking steps:', error);
        
        // Retry on error a limited number of times
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying pedometer connection (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(trackSteps, 2000); // Try again after 2 seconds
        } else {
          console.log('Max retries reached, switching to simulation mode');
          dispatch(setIsStepAvailable(false));
          stepSimulator.start();
          dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // Random steps between 3000-5000
        }
      }
    };

    trackSteps();

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [dispatch, isStepAvailable]);

  // Update step count from simulation (if sensor is not available)
  useEffect(() => {
    if (isStepAvailable || !stepSimulator) return;

    // Listen for step updates from simulator
    const subscription = stepSimulator.registerCallback(steps => {
      dispatch(setDailySteps(steps));
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch, isStepAvailable]);

  // Update step goal - optimized with callback
  const updateGoal = useCallback(async (newGoal: number) => {
    try {
      dispatch(updateStepGoal(newGoal));
      await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, newGoal.toString());
    } catch (error) {
      console.error('Error saving step goal:', error);
    }
  }, [dispatch]);

  // Manually add steps (for simulation mode)
  const addSteps = useCallback((steps: number) => {
    dispatch(setDailySteps(dailySteps + steps));
  }, [dispatch, dailySteps]);

  // Calculate step percentage
  const calculateStepPercentage = useCallback((): number => {
    if (!stepGoal) return 0;
    return Math.min(Math.round((dailySteps / stepGoal) * 100), 100);
  }, [dailySteps, stepGoal]);

  return {
    dailySteps,
    stepGoal: stepGoal || DEFAULT_STEP_GOAL,
    isStepAvailable,
    updateGoal,
    addSteps,
    stepPercentage: calculateStepPercentage(),
  };
}