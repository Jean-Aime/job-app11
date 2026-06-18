import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Radius, Spacing, Palette } from '@/constants/theme';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  success,
  leftIcon,
  rightIcon,
  isPassword,
  containerStyle,
  required,
  style,
  ...props
}: InputProps) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const hasError   = !!error;
  const hasSuccess = !!success && !hasError;

  const borderColor = hasError
    ? Colors.error
    : hasSuccess
    ? Colors.success
    : focused
    ? Colors.primary
    : Colors.border;

  const bgColor = hasError
    ? Colors.errorLight
    : focused
    ? Palette.blue50
    : Colors.bgInput;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={[styles.inputRow, { borderColor, backgroundColor: bgColor }]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !showPass}
          accessibilityLabel={label}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setShowPass(!showPass)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPass
              ? <EyeOff color={Colors.textMuted} size={18} />
              : <Eye     color={Colors.textMuted} size={18} />}
          </TouchableOpacity>
        ) : hasError ? (
          <View style={styles.iconRight}>
            <AlertCircle color={Colors.error} size={18} />
          </View>
        ) : hasSuccess ? (
          <View style={styles.iconRight}>
            <CheckCircle2 color={Colors.success} size={18} />
          </View>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {hasError && (
        <Text style={styles.error} accessibilityRole="alert">{error}</Text>
      )}
      {hint && !hasError && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    ...Typography.inputLabel,
    color: Colors.textPrimary,
  },
  required: { color: Colors.error },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    minHeight: 52,
    gap: Spacing[3],
  },
  input: {
    flex: 1,
    ...Typography.input,
    color: Colors.textPrimary,
    padding: 0,
  },
  iconLeft:  { opacity: 0.6 },
  iconRight: { opacity: 0.8 },
  error: {
    ...Typography.label,
    color: Colors.error,
    marginTop: 2,
  },
  hint: {
    ...Typography.label,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
