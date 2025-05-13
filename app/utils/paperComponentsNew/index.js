/**
 * This file provides compatibility for React Native Paper components
 * with React Native 0.79.2 and above
 * 
 * Provides a custom implementation of React Native Paper components
 * compatible with theme system using ExtendedMD3Theme
 */

import React from 'react';
import {
  View,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  Switch as RNSwitch,
  TextInput as RNTextInput,
} from 'react-native';
import { useTheme as useRNPaperTheme } from 'react-native-paper';

// Use the theme hook from React Native Paper
export const useTheme = useRNPaperTheme;

// Basic components
export const Text = props => {
  const theme = useTheme();
  return <RNText style={[{ color: theme.colors.onSurface }, props.style]}>{props.children}</RNText>;
};

export const Surface = props => {
  const theme = useTheme();
  return (
    <View style={[{ backgroundColor: theme.colors.surface }, props.style]}>{props.children}</View>
  );
};

// Button component
export const Button = props => {
  const {
    mode = 'text',
    onPress,
    style,
    labelStyle,
    children,
    icon,
    buttonColor,
    textColor,
  } = props;

  const theme = useTheme();
  const backgroundColor =
    mode === 'contained' ? buttonColor || theme.colors.primary : 'transparent';

  const buttonTextColor =
    mode === 'contained' ? textColor || '#fff' : textColor || buttonColor || theme.colors.primary;

  const borderWidth = mode === 'outlined' ? 1 : 0;
  const borderColor = buttonColor || theme.colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor,
          borderWidth,
          borderColor,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: theme.roundness,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {icon && icon({ size: 16, color: buttonTextColor })}
      <RNText style={[{ color: buttonTextColor, marginLeft: icon ? 8 : 0 }, labelStyle]}>
        {children}
      </RNText>
    </TouchableOpacity>
  );
};

// Card component
const CardContent = props => {
  return <View style={[{ padding: 16 }, props.style]}>{props.children}</View>;
};

// Card.Actions component
const CardActions = props => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 8,
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
};

export const Card = props => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          elevation: 2,
          margin: 4,
        },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
};

// Add Content and Actions properties to Card
Card.Content = CardContent;
Card.Actions = CardActions;

// Divider component
export const Divider = props => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.colors.outlineVariant,
          marginVertical: 8,
        },
        props.style,
      ]}
    />
  );
};

// Avatar component
const AvatarImage = props => {
  const { size = 64, source, style } = props;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: '#ccc',
        },
        style,
      ]}
    />
  );
};

const AvatarIcon = props => {
  const { size = 64, icon, style } = props;
  const theme = useTheme();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: theme.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {typeof icon === 'function' ? icon() : icon}
    </View>
  );
};

export const Avatar = props => {
  return <View style={props.style}>{props.children}</View>;
};

// Add Image and Icon properties to Avatar
Avatar.Image = AvatarImage;
Avatar.Icon = AvatarIcon;

// Chip component
export const Chip = props => {
  const { children, style, onPress } = props;
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginRight: 8,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
    >
      <RNText style={{ color: theme.colors.onSurface }}>{children}</RNText>
    </TouchableOpacity>
  );
};

// Title component
export const Title = props => {
  const theme = useTheme();
  return (
    <RNText
      style={[
        {
          fontSize: 20,
          fontWeight: 'bold',
          color: theme.colors.onSurface,
          marginBottom: 8,
        },
        props.style,
      ]}
    >
      {props.children}
    </RNText>
  );
};

// Paragraph component
export const Paragraph = props => {
  const theme = useTheme();
  return (
    <RNText
      style={[
        {
          fontSize: 14,
          lineHeight: 20,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 8,
        },
        props.style,
      ]}
    >
      {props.children}
    </RNText>
  );
};

// HelperText component
export const HelperText = props => {
  const { style, children, type = 'info' } = props;
  const theme = useTheme();
  return (
    <RNText
      style={[
        {
          fontSize: 12,
          color: type === 'error' ? theme.colors.error : theme.colors.onSurfaceVariant,
          marginTop: 4,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
};

// IconButton component
export const IconButton = props => {
  const { icon, size = 24, color, onPress, style } = props;
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: size * 0.75,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {icon({ size, color: color || theme.colors.primary })}
    </TouchableOpacity>
  );
};

// TouchableRipple component
export const TouchableRipple = props => {
  const { onPress, style, children } = props;
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      {children}
    </TouchableOpacity>
  );
};

// ProgressBar component
export const ProgressBar = props => {
  const { progress = 0, color, style } = props;
  const theme = useTheme();

  const progressColor = color || theme.colors.primary;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        {
          height: 4,
          backgroundColor: '#e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          width: '100%',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${clampedProgress * 100}%`,
          backgroundColor: progressColor,
          borderRadius: 2,
        }}
      />
    </View>
  );
};

// FAB (Floating Action Button) component
export const FAB = props => {
  const { icon, label, onPress, style, color } = props;
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          zIndex: 1,
          position: 'absolute',
          right: 16,
          bottom: 16,
        },
        style,
      ]}
    >
      {typeof icon === 'function' ? (
        icon()
      ) : typeof icon === 'string' ? (
        <RNText style={{ color: 'white', fontSize: 24 }}>{icon}</RNText>
      ) : (
        icon
      )}
      {label && (
        <RNText
          style={{
            color: 'white',
            marginTop: 4,
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {label}
        </RNText>
      )}
    </TouchableOpacity>
  );
};

// Switch component
export const Switch = props => {
  const { value, onValueChange, disabled, color } = props;
  const theme = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: '#e0e0e0',
        true: color || theme.colors.primary,
      }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
      ios_backgroundColor="#e0e0e0"
    />
  );
};

// RadioButton components
const RadioButtonItem = props => {
  const { label, value, position = 'leading', labelStyle, color, status, onPress } = props;
  const theme = useTheme();
  const isSelected = status === 'checked';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: position === 'leading' ? 'row' : 'row-reverse',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 0,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: isSelected ? color || theme.colors.primary : '#757575',
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: 8,
        }}
      >
        {isSelected && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: color || theme.colors.primary,
            }}
          />
        )}
      </View>
      <RNText style={[{ fontSize: 16, color: theme.colors.onSurface }, labelStyle]}>{label}</RNText>
    </TouchableOpacity>
  );
};

const RadioButtonGroup = props => {
  const { children, onValueChange, value } = props;

  // Clone children to add status and onPress
  const modifiedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      status: child.props.value === value ? 'checked' : 'unchecked',
      onPress: () => onValueChange && onValueChange(child.props.value),
    });
  });

  return <View>{modifiedChildren}</View>;
};

export const RadioButton = {
  Group: RadioButtonGroup,
  Item: RadioButtonItem,
};

// TextInput component with Icon
const TextInputIcon = props => {
  const { icon } = props;
  const theme = useTheme();

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8,
        width: 24,
        height: 24,
      }}
    >
      {typeof icon === 'function' ? (
        icon()
      ) : typeof icon === 'string' ? (
        <RNText style={{ color: theme.colors.primary, fontSize: 16 }}>{icon}</RNText>
      ) : (
        icon
      )}
    </View>
  );
};

export const TextInput = props => {
  const {
    mode = 'flat',
    style,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry,
    right,
    left,
    disabled,
    error,
    onBlur,
    onFocus,
    multiline,
  } = props;

  const theme = useTheme();

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    return mode === 'outlined' ? theme.colors.outline : 'transparent';
  };

  return (
    <View
      style={[
        {
          borderWidth: mode === 'outlined' ? 1 : 0,
          borderColor: getBorderColor(),
          borderRadius: theme.roundness,
          backgroundColor: mode === 'outlined' ? 'transparent' : theme.colors.surfaceVariant,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {left}
      <RNTextInput
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 16,
          flex: 1,
          color: theme.colors.onSurface,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        onBlur={onBlur}
        onFocus={onFocus}
        multiline={multiline}
      />
      {right}
    </View>
  );
};

// Add Icon property to TextInput
TextInput.Icon = TextInputIcon;

// Searchbar component
export const Searchbar = props => {
  const { placeholder, value, onChangeText, style, onSubmitEditing } = props;

  const theme = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.roundness,
          paddingHorizontal: 8,
          height: 48,
        },
        style,
      ]}
    >
      <View style={{ marginRight: 8 }}>
        <RNText style={{ fontSize: 16, color: theme.colors.onSurfaceVariant }}>🔍</RNText>
      </View>
      <RNTextInput
        style={{
          flex: 1,
          fontSize: 16,
          color: theme.colors.onSurface,
          height: '100%',
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText && onChangeText('')}>
          <RNText style={{ fontSize: 16, color: theme.colors.onSurfaceVariant, padding: 8 }}>
            ✕
          </RNText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// List components
const ListItem = props => {
  const { title, description, left, right, onPress, style } = props;

  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        },
        style,
      ]}
    >
      {left && <View style={{ marginRight: 16 }}>{left()}</View>}
      <View style={{ flex: 1 }}>
        <RNText
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.onSurface,
            marginBottom: description ? 4 : 0,
          }}
        >
          {title}
        </RNText>
        {description && (
          <RNText
            style={{
              fontSize: 14,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {description}
          </RNText>
        )}
      </View>
      {right && <View>{right()}</View>}
    </TouchableOpacity>
  );
};

export const List = {
  Item: ListItem,
};
