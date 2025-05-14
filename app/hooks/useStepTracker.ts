import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
// Redux imports - doğrudan store ve dispatch kullanımına geçiyoruz
import store from '../store';
import { AnyAction } from 'redux';
import { setDailySteps, updateStepGoal, setIsStepAvailable } from '../store/stepTrackerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  STEP_GOAL: '@HealthTrackAI:stepGoal',
};

// Default daily step goal
const DEFAULT_STEP_GOAL = 10000;

// Safer Redux helpers that don't depend on hooks
const safeStore = {
  getState: () => {
    try {
      return store.getState();
    } catch (error) {
      console.error('Error accessing Redux store state:', error);
      return null;
    }
  },
  
  dispatch: (action: AnyAction) => {
    try {
      return store.dispatch(action);
    } catch (error) {
      console.error('Error dispatching Redux action:', error);
      return null;
    }
  },
  
  getStepTrackerState: () => {
    try {
      const state = store.getState();
      return state?.stepTracker || null;
    } catch (error) {
      console.error('Error accessing step tracker state:', error);
      return null;
    }
  },
  
  subscribe: (listener: () => void) => {
    try {
      return store.subscribe(listener);
    } catch (error) {
      console.error('Error subscribing to Redux store:', error);
      // Return a no-op unsubscribe function to prevent errors
      return () => {};
    }
  }
};

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

// Fix RNPedometer linter error by adding type
interface RNPedometerType {
  getStepCountForPeriod: (start: Date, end: Date) => Promise<PedometerResult>;
  startPedometerUpdatesFromDate: (date: Date) => void;
  stopPedometerUpdates: () => void;
  addListener: (event: string, callback: (data: any) => void) => { remove: () => void };
}

// Safely import Pedometer module
let Pedometer: Pedometer | null = null;

// Try to import the pedometer module safely
const loadPedometer = () => {
  try {
    // For React Native CLI projects, we should use a direct import if available
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Since we don't have any pedometer modules installed, we'll use simulation mode
      console.log('No pedometer modules detected in package.json, using simulation mode');
      return null;
    }
    
    console.log('No pedometer implementation available, using simulation mode');
    return null;
  } catch (error: any) {
    console.warn('Failed to import any Pedometer implementation:', error.message);
    console.log('Using step simulation mode');
    return null;
  }
};

// Helper to create RNPedometer adapter for iOS
function createRNPedometerAdapter(RNPedometer: any): Pedometer {
  if (!RNPedometer) {
    console.error('Cannot create adapter for null RNPedometer');
    return null as unknown as Pedometer;
  }
  
  console.log('Creating RNPedometer adapter');
  return {
    isAvailableAsync: () => Promise.resolve(true), // Assuming availability for now
    getStepCountAsync: (start: Date, end: Date) => {
      return RNPedometer.getStepCountForPeriod(start, end);
    },
    watchStepCount: (callback: (result: PedometerResult) => void) => {
      RNPedometer.startPedometerUpdatesFromDate(new Date());
      const subscription = RNPedometer.addListener('pedometerDataDidUpdate', (data: any) => {
        callback({ steps: data.numberOfSteps });
      });
      return {
        remove: () => {
          subscription.remove();
          RNPedometer.stopPedometerUpdates();
        }
      };
    }
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
  // Track initialization state to ensure we only do setup work once
  const [isInitialized, setIsInitialized] = useState(false);
  // Use error state to track any critical errors
  const [criticalError, setCriticalError] = useState<string | null>(null);
  
  // Get initial data from Redux store
  const [dailySteps, setLocalDailySteps] = useState<number>(0);
  const [stepGoal, setLocalStepGoal] = useState<number>(DEFAULT_STEP_GOAL);
  const [isStepAvailable, setLocalStepAvailable] = useState<boolean>(false);

  // Local Redux dispatch helper function
  const safeDispatch = useCallback((action: AnyAction) => {
    try {
      safeStore.dispatch(action);
      return true;
    } catch (error) {
      console.error('Error dispatching action:', error);
      return false;
    }
  }, []);

  // Initialize pedometer module more safely
  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return;

    const initialize = async () => {
      try {
        console.log("Initializing step tracker...");
        
        // Step 1: Get initial data from Redux (once, at startup)
        try {
          const stepState = safeStore.getStepTrackerState();
          if (stepState) {
            setLocalDailySteps(stepState.dailySteps || 0);
            setLocalStepGoal(stepState.stepGoal || DEFAULT_STEP_GOAL);
            setLocalStepAvailable(stepState.isStepAvailable || false);
          }
        } catch (stateError) {
          console.error("Error getting initial Redux state:", stateError);
        }

        // Step 2: Try to load pedometer module - simplified version
        // We'll immediately use simulation mode since we don't have pedometer packages
        console.log('Using step simulation mode by default');
        
        // Step 3: Try to load data from AsyncStorage
        try {
          const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.STEP_GOAL);
          if (savedGoal) {
            const parsedGoal = parseInt(savedGoal, 10);
            if (!isNaN(parsedGoal) && parsedGoal > 0) {
              safeDispatch(updateStepGoal(parsedGoal));
              setLocalStepGoal(parsedGoal);
            }
          }
        } catch (error) {
          console.error('Error loading step goal from AsyncStorage:', error);
        }

        // We're always using simulation mode for now
        const stepAvailable = false;
        
        // Update state with availability result - handle possible Redux errors
        try {
          safeDispatch(setIsStepAvailable(stepAvailable));
        } catch (dispatchError) {
          console.error('Error dispatching step availability:', dispatchError);
        }
        setLocalStepAvailable(stepAvailable);

        // Start simulator
        console.log("Starting step simulator...");
        stepSimulator.start();
        const randomSteps = Math.floor(Math.random() * 2000) + 3000;
        try {
          safeDispatch(setDailySteps(randomSteps));
        } catch (dispatchError) {
          console.error('Error dispatching initial steps:', dispatchError);
        }
        setLocalDailySteps(randomSteps);

        // Initialization complete
        setIsInitialized(true);
        console.log("Step tracker initialization complete");
      } catch (error) {
        console.error('Critical error during initialization:', error);
        setCriticalError('Initialization failed');
        // Ensure we still mark as initialized to prevent infinite retries
        setIsInitialized(true);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      try {
        stepSimulator.stop();
      } catch (error) {
        console.error('Error stopping step simulator:', error);
      }
    };
  }, [safeDispatch, isInitialized]);

  // Subscribe to Redux store changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const unsubscribe = safeStore.subscribe(() => {
      try {
        const state = safeStore.getState();
        if (state && state.stepTracker) {
          setLocalDailySteps(state.stepTracker.dailySteps);
          setLocalStepGoal(state.stepTracker.stepGoal);
          setLocalStepAvailable(state.stepTracker.isStepAvailable);
        }
      } catch (error) {
        console.error('Error in Redux subscription:', error);
      }
    });
    
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from Redux store:', error);
      }
    };
  }, [isInitialized]);

  // Update step count from simulation (if sensor is not available)
  useEffect(() => {
    // Don't track simulated steps until initialized or if critical error
    if (!isInitialized || criticalError) return;
    
    // Listen for step updates from simulator
    let subscription: Subscription | null = null;
    
    try {
      subscription = stepSimulator.registerCallback(steps => {
        try {
          safeDispatch(setDailySteps(steps));
          setLocalDailySteps(steps);
        } catch (error) {
          console.error('Error updating steps from simulator:', error);
          setLocalDailySteps(steps);
        }
      });
    } catch (error) {
      console.error('Error registering step simulator callback:', error);
    }

    return () => {
      if (subscription) {
        try {
          subscription.remove();
        } catch (error) {
          console.error('Error removing simulator subscription:', error);
        }
      }
    };
  }, [isInitialized, criticalError, safeDispatch]);

  // Update step goal - optimized with callback
  const updateGoal = useCallback(async (newGoal: number) => {
    if (criticalError) {
      console.error('Cannot update goal due to critical error');
      return;
    }
    
    if (!newGoal || isNaN(newGoal) || newGoal <= 0) {
      console.error('Invalid goal value:', newGoal);
      return;
    }
    
    try {
      safeDispatch(updateStepGoal(newGoal));
      setLocalStepGoal(newGoal);
      
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, newGoal.toString());
      } catch (storageError) {
        console.error('Error saving step goal to AsyncStorage:', storageError);
      }
    } catch (error) {
      console.error('Error updating step goal:', error);
    }
  }, [safeDispatch, criticalError]);

  // Manually add steps (for simulation mode)
  const addSteps = useCallback((steps: number) => {
    if (criticalError) {
      console.error('Cannot add steps due to critical error');
      return;
    }
    
    if (!steps || isNaN(steps) || steps <= 0) {
      console.error('Invalid steps value:', steps);
      return;
    }
    
    try {
      const newSteps = dailySteps + steps;
      safeDispatch(setDailySteps(newSteps));
      setLocalDailySteps(newSteps);
    } catch (error) {
      console.error('Error adding steps manually:', error);
      // Update local state even if Redux fails
      setLocalDailySteps(dailySteps + steps);
    }
  }, [dailySteps, safeDispatch, criticalError]);

  // Calculate step percentage - safely
  const calculateStepPercentage = useCallback((): number => {
    try {
      if (!stepGoal) return 0;
      return Math.min(Math.round((dailySteps / stepGoal) * 100), 100);
    } catch (error) {
      console.error('Error calculating step percentage:', error);
      return 0;
    }
  }, [dailySteps, stepGoal]);

  return {
    dailySteps,
    stepGoal: stepGoal || DEFAULT_STEP_GOAL,
    isStepAvailable,
    updateGoal,
    addSteps,
    stepPercentage: calculateStepPercentage(),
    // Return error state to inform UI about critical errors
    error: criticalError
  };
}