import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  useColorScheme,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload, faXmark } from '@fortawesome/free-solid-svg-icons';
import useTheme from '../hooks/useTheme';

// Bir güncelleme bilgisini tanımlayan arayüz
interface UpdateInfo {
  version: string;
  features: string[];
  isMandatory: boolean;
  downloadUrl: string;
}

// Güncelleme aralığı - 24 saat
const AUTO_UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

// Güncelleme kontrol bileşeni
const UpdateChecker: React.FC<{ setUpdateInfo: (info: UpdateInfo | null) => void }> = ({ 
  setUpdateInfo 
}) => {
  const [checking, setChecking] = useState(true);
  const { theme } = useTheme();
  const themeAsAny = theme as any;

  const checkForUpdates = async (): Promise<void> => {
    setChecking(true);
    try {
      // Gerçek uygulamada API çağrısı yapılacak, şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));
      const hasUpdate = Math.random() > 0.7;

      if (hasUpdate) {
        const updateInfo: UpdateInfo = {
          version: '1.1.0',
          features: [
            'Gelişmiş uyku takibi',
            'Performans iyileştirmeleri',
            'Kullanıcı arayüzü güncellemeleri',
          ],
          isMandatory: false,
          downloadUrl: 'https://example.com/update',
        };
        setUpdateInfo(updateInfo);
      } else {
        setUpdateInfo(null);
      }
    } catch (error) {
      console.error('Güncellemeler kontrol edilirken hata oluştu:', error);
      setUpdateInfo(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkForUpdates();
    const intervalId = setInterval(checkForUpdates, AUTO_UPDATE_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  if (!checking) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={themeAsAny.colors.primary || '#4285F4'} />
      <Text style={[styles.loadingText, { color: themeAsAny.colors.onSurface || '#333' }]}>
        Güncellemeler kontrol ediliyor...
      </Text>
    </View>
  );
};

// Modal buton bileşeni
interface ModalButtonProps {
  text: string;
  icon?: typeof faDownload;
  onPress: () => void;
  isPrimary?: boolean;
}

const ModalButton: React.FC<ModalButtonProps> = ({ 
  text, 
  icon, 
  onPress, 
  isPrimary = false 
}) => {
  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const primaryColor = themeAsAny.colors.primary || '#4285F4';
  
  return (
    <Pressable
      style={[
        styles.button,
        isPrimary 
          ? [styles.primaryButton, { backgroundColor: primaryColor }]
          : [styles.secondaryButton, { borderColor: themeAsAny.colors.outline || '#999' }]
      ]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            size={16}
            color={isPrimary ? '#fff' : themeAsAny.colors.onSurfaceVariant || '#666'}
            style={styles.buttonIcon}
          />
        )}
        <Text 
          style={[
            styles.buttonText, 
            { 
              color: isPrimary 
                ? '#fff' 
                : themeAsAny.colors.onSurfaceVariant || '#666' 
            }
          ]}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

// Ana bileşen
const AutoUpdaterComponent: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const themeAsAny = theme as any;

  useEffect(() => {
    if (updateAvailable) {
      setShowModal(true);
    }
  }, [updateAvailable]);

  const handleUpdateNow = () => {
    console.log('Güncelleme süreci başlatılacak');
    setShowModal(false);
    setUpdateAvailable(null);
  };

  const handleUpdateLater = () => {
    setShowModal(false);
  };

  return (
    <>
      <UpdateChecker setUpdateInfo={setUpdateAvailable} />

      {updateAvailable && (
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={updateAvailable.isMandatory ? undefined : handleUpdateLater}
          statusBarTranslucent
        >
          <View style={styles.modalContainer}>
            <View style={[
              styles.updateCard, 
              { 
                backgroundColor: themeAsAny.colors.surface || 'white',
                shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#000'
              }
            ]}>
              <View style={styles.updateHeader}>
                <Text style={[
                  styles.updateTitle, 
                  { color: themeAsAny.colors.onSurface || '#000' }
                ]}>
                  Yeni Güncelleme Mevcut
                </Text>
                {!updateAvailable.isMandatory && (
                  <TouchableOpacity onPress={handleUpdateLater} style={styles.closeButton}>
                    <FontAwesomeIcon 
                      icon={faXmark} 
                      size={22} 
                      color={themeAsAny.colors.onSurfaceVariant || '#666'} 
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[
                styles.versionText, 
                { color: themeAsAny.colors.primary || '#4285F4' }
              ]}>
                Sürüm {updateAvailable.version}
              </Text>

              <Text style={[
                styles.featuresTitle,
                { color: themeAsAny.colors.onSurface || '#000' }
              ]}>
                Yenilikler:
              </Text>
              
              {updateAvailable.features.map((feature, index) => (
                <Text key={index} style={[
                  styles.featureItem,
                  { color: themeAsAny.colors.onSurfaceVariant || '#333' }
                ]}>
                  • {feature}
                </Text>
              ))}

              <View style={styles.buttonContainer}>
                <ModalButton 
                  text="GÜNCELLE"
                  icon={faDownload}
                  onPress={handleUpdateNow}
                  isPrimary={true}
                />

                {!updateAvailable.isMandatory && (
                  <ModalButton 
                    text="DAHA SONRA"
                    onPress={handleUpdateLater}
                    isPrimary={false}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Modal konteyner stilleri
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  updateCard: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Başlık ve header stilleri
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  versionText: {
    fontSize: 16,
    marginBottom: 15,
  },
  
  // Feature listesi stilleri
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  
  // Buton stilleri
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Yükleme göstergesi stilleri
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default AutoUpdaterComponent;
