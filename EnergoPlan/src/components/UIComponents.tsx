import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { Theme } from '../constants/theme';
import { Icon } from './Icons';
import { RequestStatus } from '../types';

export const PrimaryButton: React.FC<{
  title: string;
  onPress: () => void;
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'forest' | 'green' | 'danger';
  style?: StyleProp<ViewStyle>;
}> = ({ title, onPress, icon, loading = false, disabled = false, variant = 'forest', style }) => {
  const bgColor =
    variant === 'green'
      ? Theme.colors.green
      : variant === 'danger'
      ? Theme.colors.dangerText
      : Theme.colors.forest;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: bgColor, opacity: disabled ? 0.6 : pressed ? 0.88 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <Icon name={icon} size={18} color="#FFFFFF" />}
          <Text style={styles.primaryButtonText} numberOfLines={2}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export const SecondaryButton: React.FC<{
  title: string;
  onPress: () => void;
  icon?: any;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ title, onPress, icon, disabled = false, style }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon && <Icon name={icon} size={16} color={Theme.colors.forest} />}
        <Text style={styles.secondaryButtonText} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus | 'zmiana' | 'zaakceptowany' }> = ({
  status,
}) => {
  let bg: string = Theme.colors.borderLight;
  let text: string = Theme.colors.muted;
  let label: string = status;

  switch (status) {
    case 'oczekujący':
      bg = Theme.colors.warningBg;
      text = Theme.colors.warningText;
      label = 'Oczekujący';
      break;
    case 'przydzielony':
    case 'zaakceptowany':
      bg = Theme.colors.successBg;
      text = Theme.colors.successText;
      label = 'Przydzielony';
      break;
    case 'odrzucony':
      bg = Theme.colors.dangerBg;
      text = Theme.colors.dangerText;
      label = 'Odrzucony';
      break;
    case 'anulowany':
      bg = '#EAEAEA';
      text = '#777777';
      label = 'Anulowany';
      break;
    case 'szkic':
      bg = '#E8F0FE';
      text = '#1967D2';
      label = 'Szkic';
      break;
    case 'zmiana':
      bg = Theme.colors.warningBg;
      text = Theme.colors.warningText;
      label = 'Zmiana sali';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const MetricCard: React.FC<{
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  highlight?: boolean;
}> = ({ title, value, unit, subtitle, highlight = false }) => {
  return (
    <View
      style={[
        styles.metricCard,
        highlight && { backgroundColor: Theme.colors.forest, borderColor: Theme.colors.forest },
      ]}
    >
      <Text style={[styles.metricTitle, highlight && { color: '#E1EBE6' }]}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.metricValue, highlight && { color: '#FFFFFF' }]}>{value}</Text>
        {unit && (
          <Text style={[styles.metricUnit, highlight && { color: Theme.colors.lime }]}>
            {' ' + unit}
          </Text>
        )}
      </View>
      <Text style={[styles.metricSubtitle, highlight && { color: Theme.colors.lime }]}>
        {subtitle}
      </Text>
    </View>
  );
};

export const RoomChip: React.FC<{
  roomId: string;
  accessible?: boolean;
  capacity?: number;
  selected?: boolean;
  onPress?: () => void;
}> = ({ roomId, accessible, capacity, selected = false, onPress }) => {
  const content = (
    <View style={[styles.roomChip, selected && styles.roomChipSelected]}>
      <Text style={[styles.roomChipText, selected && styles.roomChipTextSelected]}>{roomId}</Text>
      {accessible && (
        <View style={styles.accessibleDot}>
          <Icon name="walk-outline" size={13} color={selected ? '#FFFFFF' : Theme.colors.green} />
        </View>
      )}
      {capacity && (
        <Text style={[styles.roomCapText, selected && { color: '#D4EF97' }]}>({capacity} os.)</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ marginRight: 6, marginBottom: 6 }}>
        {content}
      </Pressable>
    );
  }

  return <View style={{ marginRight: 6, marginBottom: 6 }}>{content}</View>;
};

const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 46,
    borderRadius: Theme.radii.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexShrink: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: Theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  metricTitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    fontWeight: '500',
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  metricUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  metricSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.green,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radii.sm,
    gap: 5,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  roomChipSelected: {
    backgroundColor: Theme.colors.forest,
    borderColor: Theme.colors.forest,
  },
  roomChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  roomChipTextSelected: {
    color: '#FFFFFF',
  },
  roomCapText: {
    fontSize: 11,
    color: Theme.colors.muted,
  },
  accessibleDot: {
    marginLeft: 2,
  },
});
