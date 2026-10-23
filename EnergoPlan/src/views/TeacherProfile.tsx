import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const TeacherProfile: React.FC = () => {
  const { role, setRole, school, resetToDemoData, publishedVersion } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil i preferencje</Text>
        <Text style={styles.subtitle}>Informacje o koncie, szkole i parametrach pilotażu</Text>
      </View>

      {/* Karta użytkownika */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {role === 'teacher' ? 'JK' : 'AN'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {role === 'teacher' ? 'Jan Kowalski' : 'Anna Nowak'}
          </Text>
          <Text style={styles.userRole}>
            {role === 'teacher' ? 'Nauczyciel języka angielskiego' : 'Główny Administrator Szkoły'}
          </Text>
          <Text style={styles.schoolName}>{school.name}</Text>
        </View>
      </View>

      {/* Przełącznik ról */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Aktywna rola użytkownika</Text>
        <Text style={styles.sectionDesc}>
          Zgodnie ze specyfikacją uprawnienia wynikają z roli, a nie z wielkości ekranu.
          Możesz przetestować aplikację w roli Nauczyciela lub Administratora.
        </Text>

        <View style={styles.roleToggleRow}>
          <Pressable
            onPress={() => setRole('teacher')}
            style={[styles.roleBtn, role === 'teacher' && styles.roleBtnActive]}
          >
            <Icon
              name="person-outline"
              size={18}
              color={role === 'teacher' ? '#FFFFFF' : Theme.colors.forest}
            />
            <Text style={[styles.roleBtnText, role === 'teacher' && styles.roleBtnTextActive]}>
              Nauczyciel (Aplikacja)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setRole('admin')}
            style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
          >
            <Icon
              name="grid-outline"
              size={18}
              color={role === 'admin' ? '#FFFFFF' : Theme.colors.forest}
            />
            <Text style={[styles.roleBtnText, role === 'admin' && styles.roleBtnTextActive]}>
              Administrator (Panel)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Narzędzia demonstracyjne */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Zarządzanie stanem demonstracyjnym</Text>
        <Text style={styles.sectionDesc}>
          Wszystkie formularze, blokady sal i publikacje planu są zapamiętywane w stanie sesji.
          Możesz w każdej chwili przywrócić pierwotny stan wyjściowy (zgodny z tabelą w specyfikacji).
        </Text>

        <View style={{ marginTop: 14 }}>
          <SecondaryButton
            title="Przywróć dane demonstracyjne"
            icon="refresh-outline"
            onPress={resetToDemoData}
          />
        </View>
      </View>

      {/* Informacje o wersji */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wersja aplikacji:</Text>
          <Text style={styles.infoVal}>1.0.0 (Expo SDK 58 Web/Mobile)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wersja planu sal:</Text>
          <Text style={styles.infoVal}>{publishedVersion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Program pilotażowy:</Text>
          <Text style={styles.infoVal}>Future Smart City 2026</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cena referencyjna energii:</Text>
          <Text style={styles.infoVal}>1,20 zł / kWh</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Theme.colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  userRole: {
    fontSize: 13,
    color: Theme.colors.green,
    fontWeight: '600',
    marginTop: 2,
  },
  schoolName: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sectionDesc: {
    fontSize: 13,
    color: Theme.colors.muted,
    lineHeight: 18,
    marginTop: 4,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Theme.radii.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: '#FAFCFA',
  },
  roleBtnActive: {
    backgroundColor: Theme.colors.forest,
    borderColor: Theme.colors.forest,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },
});

