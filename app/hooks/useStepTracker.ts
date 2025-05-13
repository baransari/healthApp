import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
// Redux hooks'ları özelleştirilmiş tiplerle doğrudan import ediyoruz
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setDailySteps, updateStepGoal, setIsStepAvailable } from '../store/stepTrackerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type-safe hooks oluşturuyoruz
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector = useSelector as (selector: (state: RootState) => any) => any;

// Depolama anahtarları
const STORAGE_KEYS = {
  STEP_GOAL: '@HealthTrackAI:stepGoal',
};

// Varsayılan günlük adım hedefi
const DEFAULT_STEP_GOAL = 10000;

// Pedometer tipi tanımlaması
interface Pedometer {
  isAvailableAsync: () => Promise<boolean>;
  getStepCountAsync: (start: Date, end: Date) => Promise<PedometerResult>;
  watchStepCount: (callback: (result: PedometerResult) => void) => Subscription;
}

// Pedometer modülünü import et veya mock oluştur
let Pedometer: Pedometer;
try {
  Pedometer = require('expo-sensors').Pedometer;
} catch {
  console.log('Pedometer modülü bulunamadı, simülasyon modu kullanılacak');
  Pedometer = {
    isAvailableAsync: async () => false,
    getStepCountAsync: async () => ({ steps: 0 }),
    watchStepCount: () => ({ remove: () => {} }),
  };
}

// Pedometer result tipi
interface PedometerResult {
  steps: number;
}

// Subscription tipi
interface Subscription {
  remove: () => void;
}

// Simülasyon adım üretici
class StepSimulator {
  private steps: number = 0;
  private callbacks: ((steps: number) => void)[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    // Rastgele adım üret (her 5-10 saniyede bir)
    this.timer = setInterval(() => {
      // 10-30 arası rastgele adım ekle
      const newSteps = Math.floor(Math.random() * 20) + 10;
      this.steps += newSteps;

      // Callback'leri çağır
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

// Simülatör örneği oluştur
const stepSimulator = new StepSimulator();

// Başlangıç ve bitiş zamanını hesapla (bugünün başlangıcı ve sonu)
const getStartAndEndTime = () => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

export default function useStepTracker() {
  const dispatch = useAppDispatch();

  // Redux state'inden adım verilerini çekme
  const { dailySteps, stepGoal, isStepAvailable } = useAppSelector(
    (state: RootState) => state.stepTracker,
  );

  // AsyncStorage'dan adım hedefini yükle
  useEffect(() => {
    const loadStepGoal = async () => {
      try {
        const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.STEP_GOAL);
        if (savedGoal) {
          dispatch(updateStepGoal(parseInt(savedGoal, 10)));
        }
      } catch (error) {
        console.error('Step goal yüklenirken hata oluştu:', error);
      }
    };

    loadStepGoal();
  }, [dispatch]);

  // Sensor'un kullanılabilir olup olmadığını kontrol et
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        if (!Pedometer) {
          dispatch(setIsStepAvailable(false));
          console.log('Pedometer modülü bulunamadı, simülasyon modu aktif.');

          // Simülasyon modunu başlat ve redux'a bir miktar adım ekle
          stepSimulator.start();
          dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // 3000-5000 arası rastgele adım
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        dispatch(setIsStepAvailable(isAvailable));
        console.log('Pedometer availability:', isAvailable);

        if (!isAvailable) {
          // Sensör yoksa simülasyon modunu başlat
          stepSimulator.start();
          dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // 3000-5000 arası rastgele adım
        }
      } catch (error) {
        console.error('Error checking pedometer:', error);
        dispatch(setIsStepAvailable(false));

        // Hata durumunda simülasyon modunu başlat
        stepSimulator.start();
        dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // 3000-5000 arası rastgele adım
      }
    };

    checkAvailability();

    // Component unmount olduğunda simülatörü durdur
    return () => {
      stepSimulator.stop();
    };
  }, [dispatch]);

  // Günlük adım sayısını izle (Pedometer mevcutsa)
  useEffect(() => {
    if (!isStepAvailable || !Pedometer) return;

    const { start, end } = getStartAndEndTime();
    let subscription: Subscription | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const trackSteps = async () => {
      try {
        // Bugünün adım sayısını al
        const result = await Pedometer.getStepCountAsync(start, end);
        dispatch(setDailySteps(result.steps));
        console.log('Daily steps:', result.steps);
        retryCount = 0; // Başarılı olursa retry sayısını sıfırla

        // Gerçek zamanlı adım takibi başlat
        subscription = Pedometer.watchStepCount((result: PedometerResult) => {
          console.log('Steps detected:', result.steps);
          const { start: newStart, end: newEnd } = getStartAndEndTime();

          // Günlük toplam adım sayısını getir
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
        
        // Hata durumunda belirli sayıda tekrar dene
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying pedometer connection (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(trackSteps, 2000); // 2 saniye sonra tekrar dene
        } else {
          console.log('Max retries reached, switching to simulation mode');
          dispatch(setIsStepAvailable(false));
          stepSimulator.start();
          dispatch(setDailySteps(Math.floor(Math.random() * 2000) + 3000)); // 3000-5000 arası rastgele adım
        }
      }
    };

    trackSteps();

    // Component unmount olduğunda subscription'ı temizle
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [dispatch, isStepAvailable]);

  // Simülasyon modu için adım sayısı güncelleme (sensör yoksa)
  useEffect(() => {
    if (isStepAvailable || !stepSimulator) return;

    // Simülasyondan adım güncellemelerini dinle
    const subscription = stepSimulator.registerCallback(steps => {
      dispatch(setDailySteps(steps));
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch, isStepAvailable]);

  // Adım hedefini güncelleme - callback ile optimize et
  const updateGoal = useCallback(async (newGoal: number) => {
    try {
      dispatch(updateStepGoal(newGoal));
      await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, newGoal.toString());
    } catch (error) {
      console.error('Adım hedefi kaydedilirken hata oluştu:', error);
    }
  }, [dispatch]);

  // Manuel olarak adım ekle (simülasyon modu için)
  const addSteps = useCallback((steps: number) => {
    dispatch(setDailySteps(dailySteps + steps));
  }, [dispatch, dailySteps]);

  // Adım yüzdesini hesapla
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
