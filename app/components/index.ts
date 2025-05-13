/**
 * Bileşen Exportları
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm genel bileşenlerin merkezi export noktasıdır.
 * Bileşenler, kullanım alanlarına göre gruplandırılmıştır.
 */

// ------------------------------
// Genel UI bileşenleri
// ------------------------------
export { default as LoadingComponent } from './LoadingComponent';

// ------------------------------
// Modal bileşenleri
// ------------------------------
export { default as AddExerciseModal } from './AddExerciseModal';
export { default as EditWorkoutPlanModal } from './EditWorkoutPlanModal';

// ------------------------------
// Uygulama altyapı bileşenleri
// ------------------------------
export { default as AutoUpdaterComponent } from './AutoUpdaterComponent';

/**
 * Not: Yeni bir bileşen eklerken, lütfen uygun kategoriye ekleyin veya
 * gerekirse yeni bir kategori oluşturun. Bu, kod organizasyonunu ve okunabilirliği artırır.
 */
