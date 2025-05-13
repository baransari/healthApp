declare module 'react-native-vector-icons/MaterialCommunityIcons';
declare module 'react-native-vector-icons/MaterialIcons';
declare module 'react-native-vector-icons/Ionicons';
declare module 'react-native-vector-icons/FontAwesome';
declare module 'react-native-vector-icons/FontAwesome5';
declare module 'react-native-vector-icons/AntDesign';
declare module 'react-native-vector-icons/Entypo';
declare module 'react-native-vector-icons/EvilIcons';
declare module 'react-native-vector-icons/Feather';
declare module 'react-native-vector-icons/Foundation';
declare module 'react-native-vector-icons/Octicons';
declare module 'react-native-vector-icons/SimpleLineIcons';
declare module 'react-native-vector-icons/Zocial';

// React Native Paper iç modülü için tip tanımlaması
declare module 'src/types' {
  import type { TextStyle } from 'react-native';
  
  export interface ThemeProp {
    theme: ReactNativePaper.Theme;
  }
  
  export interface EllipsizeProp {
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  }
  
  export interface InternalTheme extends ReactNativePaper.Theme {
    isV3: boolean;
    version: 2 | 3;
  }
  
  export type Font = {
    fontFamily: string;
    fontWeight?:
      | 'normal'
      | 'bold'
      | '100'
      | '200'
      | '300'
      | '400'
      | '500'
      | '600'
      | '700'
      | '800'
      | '900';
  };
  
  export type Fonts = {
    regular: Font;
    medium: Font;
    light: Font;
    thin: Font;
  };
}

// React Native Vector Icons iç modül tanımlaması
declare module '@react-native-vector-icons/material-design-icons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}
