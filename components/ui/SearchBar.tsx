import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors, Typography, Radius, Spacing, Shadows } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  rightSlot?: React.ReactNode;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  rightSlot,
  autoFocus,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Search color={focused ? Colors.primary : Colors.textMuted} size={18} strokeWidth={2.5} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X color={Colors.textMuted} size={16} />
        </TouchableOpacity>
      )}
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing[2.5],
    ...(Shadows.xs as object),
  },
  focused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    padding: 0,
  },
});
