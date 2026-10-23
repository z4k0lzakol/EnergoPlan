import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Switch } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const TeacherNewRequest: React.FC = () => {
  const { addRequest, setTeacherTab } = useApp();

  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('2026-10-23');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [people, setPeople] = useState('12');
  const [needScreen, setNeedScreen] = useState(true);
  const [needComputers, setNeedComputers] = useState(false);
  const [needAccessibility, setNeedAccessibility] = useState(false);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Walidacja
    if (!subject.trim()) {
      setErrorMessage('Podaj nazwę zajęć.');
      return;
    }

    const peopleNum = parseInt(people, 10);
    if (isNaN(peopleNum) || peopleNum <= 0) {
      setErrorMessage('Liczba uczestników musi być większa od zera.');
      return;
    }

    if (endTime <= startTime) {
      setErrorMessage('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.');
      return;
    }

    setIsSubmitting(true);

    try {
      const equipmentNeeds: ('ekran' | 'komputery')[] = [];
      if (needScreen) equipmentNeeds.push('ekran');
      if (needComputers) equipmentNeeds.push('komputery');

      await addRequest({
        ownerId: 'teacher-1',
        ownerName: 'Jan Kowalski',
        subject: subject.trim(),
        date,
        startTime,
        endTime,
        people: peopleNum,
        equipmentNeeds,
        accessibilityNeeded: needAccessibility,
        notes: notes.trim() || undefined,
      });

      setIsSubmitting(false);
      setTeacherTab('requests');
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Wystąpił błąd podczas zapisywania wniosku. Spróbuj ponownie.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => setTeacherTab('today')} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={Theme.colors.forest} />
          <Text style={styles.backText}>Wróć do planu</Text>
        </Pressable>
        <Text style={styles.title}>Zgłoszenie zajęć pozalekcyjnych</Text>
        <Text style={styles.subtitle}>
          Wypełnij formularz potrzeb grupy. Administrator sprawdzi dostępność sal i optymalizację energii.
        </Text>
      </View>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Icon name="alert-circle" size={18} color="#DC3545" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.formCard}>
        {/* Nazwa zajęć */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nazwa zajęć / koła zainteresowań *</Text>
          <TextInput
            placeholder="np. Kółko szachowe, Warsztaty teatralne"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            placeholderTextColor={Theme.colors.muted}
          />
        </View>

        {/* Data i godziny */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data zajęć (RRRR-MM-DD) *</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-23"
            style={styles.input}
          />
        </View>

        <View style={styles.timeRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Godzina rozpoczęcia *</Text>
            <TextInput
              value={startTime}
              onChangeText={setStartTime}
              placeholder="16:00"
              style={styles.input}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Godzina zakończenia *</Text>
            <TextInput
              value={endTime}
              onChangeText={setEndTime}
              placeholder="17:30"
              style={styles.input}
            />
          </View>
        </View>

        {/* Liczba uczestników */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Przewidywana liczba uczniów *</Text>
          <TextInput
            value={people}
            onChangeText={setPeople}
            keyboardType="numeric"
            placeholder="np. 12"
            style={styles.input}
          />
          <Text style={styles.fieldHint}>
            Zbieramy wyłącznie liczebność grupy (zgodnie z ochroną prywatności uczniów).
          </Text>
        </View>

        {/* Wymagania techniczne */}
        <Text style={styles.sectionHeader}>Wymagania dotyczące sali</Text>

        <View style={styles.switchItem}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.switchTitle}>Ekran multimedialny / projektor</Text>
            <Text style={styles.switchDesc}>Potrzebny do prezentacji lub materiałów wideo</Text>
          </View>
          <Switch
            value={needScreen}
            onValueChange={setNeedScreen}
            trackColor={{ true: Theme.colors.green, false: '#DDD' }}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.switchTitle}>Stanowiska komputerowe</Text>
            <Text style={styles.switchDesc}>Wymaga pracowni informatycznej</Text>
          </View>
          <Switch
            value={needComputers}
            onValueChange={setNeedComputers}
            trackColor={{ true: Theme.colors.green, false: '#DDD' }}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.switchTitle}>Dostęp bez barier architektonicznych</Text>
            <Text style={styles.switchDesc}>Sala na parterze lub z dostępem do windy</Text>
          </View>
          <Switch
            value={needAccessibility}
            onValueChange={setNeedAccessibility}
            trackColor={{ true: Theme.colors.green, false: '#DDD' }}
          />
        </View>

        {/* Uwagi */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Dodatkowe informacje dla administratora (opcjonalnie)</Text>
          <TextInput
            placeholder="np. Potrzebne dodatkowe gniazdka, specyficzny układ ławek..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            placeholderTextColor={Theme.colors.muted}
          />
        </View>

        {/* Przyciski */}
        <View style={styles.submitSection}>
          <PrimaryButton
            title={isSubmitting ? 'Wysyłanie wniosku...' : 'Wyślij wniosek do szkoły'}
            loading={isSubmitting}
            disabled={isSubmitting}
            icon="paper-plane-outline"
            onPress={handleSubmit}
          />
          <View style={{ marginTop: 10 }}>
            <SecondaryButton
              title="Anuluj i wróć"
              disabled={isSubmitting}
              onPress={() => setTeacherTab('today')}
            />
          </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: Theme.colors.forest,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    lineHeight: 18,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Theme.colors.dangerBg,
    padding: 12,
    borderRadius: Theme.radii.md,
    marginBottom: 16,
  },
  errorText: {
    color: Theme.colors.dangerText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  formGroup: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAFCFA',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Theme.colors.text,
  },
  fieldHint: {
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.forest,
    marginTop: 8,
    marginBottom: 12,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  switchDesc: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  submitSection: {
    marginTop: 24,
  },
});

