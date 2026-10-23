import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Modal, Switch } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';
import { EnergyZone, Room } from '../types';

export const AdminRooms: React.FC = () => {
  const { rooms, zones, updateZoneParams, addRoom } = useApp();

  // Stan edycji strefy
  const [editingZone, setEditingZone] = useState<EnergyZone | null>(null);
  const [editPower, setEditPower] = useState<string>('');
  const [editBuffer, setEditBuffer] = useState<string>('');

  // Stan dodawania sali
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomZone, setNewRoomZone] = useState(zones[0]?.id || 'zone-A');
  const [newRoomCapacity, setNewRoomCapacity] = useState('20');
  const [newRoomFloor, setNewRoomFloor] = useState('Parter');
  const [newRoomAccessible, setNewRoomAccessible] = useState(true);
  const [newRoomEquipment, setNewRoomEquipment] = useState<string[]>(['ekran']);

  const openEditZone = (zone: EnergyZone) => {
    setEditingZone(zone);
    setEditPower(zone.powerKw.toString());
    setEditBuffer(zone.bufferMinutes.toString());
  };

  const handleSaveZone = () => {
    if (editingZone) {
      const power = parseFloat(editPower.replace(',', '.')) || editingZone.powerKw;
      const buffer = parseInt(editBuffer, 10) || editingZone.bufferMinutes;
      updateZoneParams(editingZone.id, power, buffer);
      setEditingZone(null);
    }
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    const capacity = parseInt(newRoomCapacity, 10) || 15;
    addRoom({
      name: newRoomName.trim(),
      zoneId: newRoomZone,
      capacity,
      floor: newRoomFloor,
      accessibility: newRoomAccessible,
      equipment: newRoomEquipment as any,
    });
    setNewRoomName('');
    setIsAddRoomModalOpen(false);
  };

  const toggleEquipmentOption = (item: string) => {
    setNewRoomEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sale i strefy energetyczne</Text>
          <Text style={styles.subtitle}>
            Inwentaryzacja sal lekcyjnych oraz parametryzacja niezależnych stref wentylacji i oświetlenia
          </Text>
        </View>
        <PrimaryButton
          title="+ Dodaj salę"
          icon="add-outline"
          onPress={() => setIsAddRoomModalOpen(true)}
        />
      </View>

      {/* Sekcja 1: Strefy energetyczne */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Strefy energetyczne budynku (Instalacje HVAC i Oświetlenie)</Text>
          <Text style={styles.sectionSubtitle}>
            Kliknij „Edytuj parametry”, aby zmienić moc znamionową strefy lub bufor pracy
          </Text>
        </View>

        <View style={styles.zonesGrid}>
          {zones.map((z) => (
            <View key={z.id} style={styles.zoneCard}>
              <View style={styles.zoneCardTop}>
                <View style={styles.zoneBadge}>
                  <Text style={styles.zoneBadgeText}>{z.wing}</Text>
                </View>
                <Pressable onPress={() => openEditZone(z)} style={styles.editBtn}>
                  <Icon name="create-outline" size={16} color={Theme.colors.green} />
                  <Text style={styles.editBtnText}>Edytuj</Text>
                </Pressable>
              </View>

              <Text style={styles.zoneName}>{z.name}</Text>
              <Text style={styles.zoneLocation}>Kondygnacja: {z.floor}</Text>

              <View style={styles.zoneParamsBox}>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Moc znamionowa:</Text>
                  <Text style={styles.paramValue}>{z.powerKw} kW</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Bufor po zajęciach:</Text>
                  <Text style={styles.paramValue}>{z.bufferMinutes} min</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Sterowalność:</Text>
                  <Text style={[styles.paramValue, { color: z.controllable ? Theme.colors.green : Theme.colors.dangerText }]}>
                    {z.controllable ? 'Tak (niezależna)' : 'Brak (blokada)'}
                  </Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Źródło danych:</Text>
                  <Text style={styles.paramSource} numberOfLines={1}>
                    {z.source} ({z.status})
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Sekcja 2: Katalog sal */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Katalog sal lekcyjnych i wyposażenia</Text>
        <Text style={styles.sectionSubtitle}>
          Dostępność sal dla optymalizatora przydziału
        </Text>

        <View style={styles.roomsGrid}>
          {rooms.map((r) => {
            const zone = zones.find((z) => z.id === r.zoneId);
            return (
              <View key={r.id} style={styles.roomCard}>
                <View style={styles.roomCardHeader}>
                  <Text style={styles.roomId}>{r.id}</Text>
                  <View style={styles.capacityBadge}>
                    <Icon name="people-outline" size={13} color={Theme.colors.forest} />
                    <Text style={styles.capacityText}>{r.capacity} os.</Text>
                  </View>
                </View>

                <Text style={styles.roomFullName}>{r.name}</Text>
                <Text style={styles.roomZoneInfo}>
                  {zone?.name} • {r.floor}
                </Text>

                <View style={styles.featuresRow}>
                  {r.accessibility ? (
                    <View style={[styles.featurePill, { backgroundColor: '#E2F3E7' }]}>
                      <Icon name="walk-outline" size={13} color="#137333" />
                      <Text style={[styles.featureText, { color: '#137333' }]}>Bez barier</Text>
                    </View>
                  ) : (
                    <View style={[styles.featurePill, { backgroundColor: '#FCE8E6' }]}>
                      <Text style={[styles.featureText, { color: '#C5221F' }]}>Schody</Text>
                    </View>
                  )}
                  {r.equipment.map((eq, i) => (
                    <View key={i} style={styles.featurePill}>
                      <Text style={styles.featureText}>{eq}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Modal edycji parametrów strefy */}
      <Modal visible={editingZone !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edytuj parametry strefy</Text>
            <Text style={styles.modalSubtitle}>{editingZone?.name}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Moc instalacji wentylacji/oświetlenia (kW):</Text>
              <TextInput
                value={editPower}
                onChangeText={setEditPower}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              <Text style={styles.inputHint}>
                Zmiana mocy wpłynie na przeliczenie potencjału oszczędności we wszystkich wariantach.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bufor techniczny po zajęciach (minuty):</Text>
              <TextInput
                value={editBuffer}
                onChangeText={setEditBuffer}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              <Text style={styles.inputHint}>
                Czas pracy strefy po opuszczeniu sali przez uczniów (np. przewietrzenie, sprzątanie).
              </Text>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton title="Anuluj" onPress={() => setEditingZone(null)} />
              <PrimaryButton title="Zapisz i przelicz" onPress={handleSaveZone} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal dodawania nowej sali */}
      <Modal visible={isAddRoomModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 520 }]}>
            <Text style={styles.modalTitle}>Dodaj nową salę do katalogu</Text>
            <Text style={styles.modalSubtitle}>Wprowadź dane techniczne i wyposażenie</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nazwa sali:</Text>
              <TextInput
                placeholder="np. Pracownia biologiczna A105"
                value={newRoomName}
                onChangeText={setNewRoomName}
                style={styles.modalInput}
                placeholderTextColor={Theme.colors.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Przypisana strefa energetyczna:</Text>
              <View style={styles.optionsRow}>
                {zones.map((z) => (
                  <Pressable
                    key={z.id}
                    onPress={() => setNewRoomZone(z.id)}
                    style={[styles.optionPill, newRoomZone === z.id && styles.optionPillActive]}
                  >
                    <Text
                      style={[
                        styles.optionPillText,
                        newRoomZone === z.id && styles.optionPillTextActive,
                      ]}
                    >
                      {z.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Pojemność (osób):</Text>
                <TextInput
                  value={newRoomCapacity}
                  onChangeText={setNewRoomCapacity}
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Piętro:</Text>
                <TextInput
                  value={newRoomFloor}
                  onChangeText={setNewRoomFloor}
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Dostęp bez barier (parter / winda):</Text>
              <Switch
                value={newRoomAccessible}
                onValueChange={setNewRoomAccessible}
                trackColor={{ true: Theme.colors.green, false: '#DDD' }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dostępne wyposażenie:</Text>
              <View style={styles.optionsRow}>
                {['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica'].map((item) => {
                  const isChecked = newRoomEquipment.includes(item);
                  return (
                    <Pressable
                      key={item}
                      onPress={() => toggleEquipmentOption(item)}
                      style={[styles.optionPill, isChecked && styles.optionPillActive]}
                    >
                      <Text
                        style={[styles.optionPillText, isChecked && styles.optionPillTextActive]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton title="Anuluj" onPress={() => setIsAddRoomModalOpen(false)} />
              <PrimaryButton title="Dodaj salę" onPress={handleCreateRoom} />
            </View>
          </View>
        </View>
      </Modal>
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  section: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionHeaderRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  zoneCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#F9FAF9',
    borderRadius: Theme.radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  zoneCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneBadge: {
    backgroundColor: Theme.colors.forest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radii.sm,
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 13,
    color: Theme.colors.green,
    fontWeight: '600',
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  zoneLocation: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 12,
  },
  zoneParamsBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: Theme.radii.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  paramValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  paramSource: {
    fontSize: 11,
    color: Theme.colors.muted,
    maxWidth: 150,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  roomCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  roomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomId: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF3EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radii.full,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  roomFullName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  roomZoneInfo: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 10,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F2F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
  },
  featureText: {
    fontSize: 11,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Theme.colors.text,
    backgroundColor: '#FAFAFA',
  },
  inputHint: {
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  optionPillActive: {
    backgroundColor: Theme.colors.forest,
    borderColor: Theme.colors.forest,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  optionPillTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
});

