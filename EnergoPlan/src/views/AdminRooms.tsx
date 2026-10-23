import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Modal, Switch } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';
import { EnergyZone, Room } from '../types';

export const AdminRooms: React.FC = () => {
  const { rooms, zones, updateZoneParams, addRoom, updateRoom, deleteRoom, addZone, deleteZone } = useApp();

  // Filtrowanie sal po strefie
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  // Stan edycji strefy
  const [editingZone, setEditingZone] = useState<EnergyZone | null>(null);
  const [editPower, setEditPower] = useState<string>('');
  const [editBuffer, setEditBuffer] = useState<string>('');

  // Stan dodawania nowej strefy
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneWing, setNewZoneWing] = useState('Skrzydło D');
  const [newZoneFloor, setNewZoneFloor] = useState('Parter');
  const [newZonePower, setNewZonePower] = useState('2.0');
  const [newZoneBuffer, setNewZoneBuffer] = useState('30');
  const [newZoneControllable, setNewZoneControllable] = useState(true);
  const [newZoneSource, setNewZoneSource] = useState('Dokumentacja techniczna');
  const [newZoneStatus, setNewZoneStatus] = useState<'pomiar' | 'dokumentacja' | 'założenie'>('dokumentacja');

  // Stan dodawania sali
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomCustomId, setNewRoomCustomId] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomZone, setNewRoomZone] = useState(zones[0]?.id || 'zone-A');
  const [newRoomCapacity, setNewRoomCapacity] = useState('20');
  const [newRoomFloor, setNewRoomFloor] = useState('Parter');
  const [newRoomAccessible, setNewRoomAccessible] = useState(true);
  const [newRoomEquipment, setNewRoomEquipment] = useState<string[]>(['ekran']);
  const [addCustomEquipInput, setAddCustomEquipInput] = useState('');

  // Stan edycji sali i asortymentu
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomZone, setEditRoomZone] = useState('');
  const [editRoomCapacity, setEditRoomCapacity] = useState('20');
  const [editRoomFloor, setEditRoomFloor] = useState('Parter');
  const [editRoomAccessible, setEditRoomAccessible] = useState(true);
  const [editRoomEquipment, setEditRoomEquipment] = useState<string[]>([]);
  const [editCustomEquipInput, setEditCustomEquipInput] = useState('');

  // Komunikat o akcji
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

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
      showFeedback(`Zaktualizowano parametry strefy ${editingZone.name}.`);
    }
  };

  const handleCreateZone = () => {
    if (!newZoneName.trim()) return;
    const power = parseFloat(newZonePower.replace(',', '.')) || 2.0;
    const buffer = parseInt(newZoneBuffer, 10) || 30;

    addZone({
      name: newZoneName.trim(),
      wing: newZoneWing.trim() || 'Skrzydło D',
      floor: newZoneFloor.trim() || 'Parter',
      powerKw: power,
      bufferMinutes: buffer,
      controllable: newZoneControllable,
      source: newZoneSource.trim() || 'Dokumentacja techniczna',
      status: newZoneStatus,
    });

    setNewZoneName('');
    setIsAddZoneModalOpen(false);
    showFeedback(`Utworzono nową strefę energetyczną: ${newZoneName.trim()}`);
  };

  const handleDeleteZone = (zone: EnergyZone) => {
    if (zones.length <= 1) {
      showFeedback('Nie można usunąć jedynej strefy budynku.');
      return;
    }
    deleteZone(zone.id);
    showFeedback(`Usunięto strefę ${zone.name}.`);
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    const capacity = parseInt(newRoomCapacity, 10) || 15;
    addRoom({
      id: newRoomCustomId.trim() || undefined,
      name: newRoomName.trim(),
      zoneId: newRoomZone,
      capacity,
      floor: newRoomFloor,
      accessibility: newRoomAccessible,
      equipment: newRoomEquipment as any,
    });
    setNewRoomName('');
    setNewRoomCustomId('');
    setAddCustomEquipInput('');
    setIsAddRoomModalOpen(false);
    showFeedback(`Dodano salę: ${newRoomName.trim()}`);
  };

  const handleDeleteRoom = (room: Room) => {
    deleteRoom(room.id);
    showFeedback(`Usunięto salę ${room.id} (${room.name}) z katalogu.`);
  };

  const toggleEquipmentOption = (item: string) => {
    setNewRoomEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustomEquipToNew = () => {
    const trimmed = addCustomEquipInput.trim().toLowerCase();
    if (trimmed && !newRoomEquipment.includes(trimmed)) {
      setNewRoomEquipment((prev) => [...prev, trimmed]);
      setAddCustomEquipInput('');
    }
  };

  // Obsługa edycji istniejącej sali
  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setEditRoomName(room.name);
    setEditRoomZone(room.zoneId);
    setEditRoomCapacity(room.capacity.toString());
    setEditRoomFloor(room.floor);
    setEditRoomAccessible(room.accessibility);
    setEditRoomEquipment([...room.equipment]);
    setEditCustomEquipInput('');
  };

  const toggleEditEquipmentOption = (item: string) => {
    setEditRoomEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustomEquipToEdit = () => {
    const trimmed = editCustomEquipInput.trim().toLowerCase();
    if (trimmed && !editRoomEquipment.includes(trimmed)) {
      setEditRoomEquipment((prev) => [...prev, trimmed]);
      setEditCustomEquipInput('');
    }
  };

  const handleSaveRoom = () => {
    if (!editingRoom) return;
    const capacity = parseInt(editRoomCapacity, 10) || editingRoom.capacity;
    updateRoom(editingRoom.id, {
      name: editRoomName.trim() || editingRoom.name,
      zoneId: editRoomZone,
      capacity,
      floor: editRoomFloor.trim() || editingRoom.floor,
      accessibility: editRoomAccessible,
      equipment: editRoomEquipment as any,
    });
    setEditingRoom(null);
    showFeedback(`Zaktualizowano salę ${editingRoom.id} (wyposażenie: ${editRoomEquipment.length} poz.).`);
  };

  const filteredRooms = rooms.filter((r) => {
    if (selectedZoneFilter === 'all') return true;
    return r.zoneId === selectedZoneFilter;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Nagłówek główny z akcjami */}
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 260 }}>
          <Text style={styles.title}>Sale i strefy energetyczne</Text>
          <Text style={styles.subtitle}>
            Inwentaryzacja sal lekcyjnych oraz parametryzacja niezależnych stref wentylacji i oświetlenia
          </Text>
        </View>

        <View style={styles.headerActions}>
          <SecondaryButton
            title="+ Dodaj strefę"
            icon="flash-outline"
            onPress={() => setIsAddZoneModalOpen(true)}
          />
          <PrimaryButton
            title="+ Dodaj salę"
            icon="business-outline"
            onPress={() => setIsAddRoomModalOpen(true)}
          />
        </View>
      </View>

      {/* Baner informacyjny po akcji */}
      {feedbackNotice && (
        <View style={styles.feedbackBanner}>
          <Icon name="checkmark-circle" size={18} color="#0F5132" />
          <Text style={styles.feedbackText}>{feedbackNotice}</Text>
        </View>
      )}

      {/* Sekcja 1: Strefy energetyczne */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Strefy energetyczne budynku (Instalacje HVAC i Oświetlenie)</Text>
            <Text style={styles.sectionSubtitle}>
              Zarządzaj obwodami zasilania i sterowalnością niezależnych skrzydeł szkoły
            </Text>
          </View>
          <SecondaryButton
            title="+ Nowa strefa"
            icon="add-outline"
            onPress={() => setIsAddZoneModalOpen(true)}
          />
        </View>

        <View style={styles.zonesGrid}>
          {zones.map((z) => {
            const linkedRoomsCount = rooms.filter((r) => r.zoneId === z.id).length;

            return (
              <View key={z.id} style={styles.zoneCard}>
                <View style={styles.zoneCardTop}>
                  <View style={styles.zoneBadge}>
                    <Text style={styles.zoneBadgeText}>{z.wing}</Text>
                  </View>
                  <View style={styles.zoneCardActions}>
                    <Pressable onPress={() => openEditZone(z)} style={styles.editBtn}>
                      <Icon name="create-outline" size={15} color={Theme.colors.green} />
                      <Text style={styles.editBtnText}>Edytuj</Text>
                    </Pressable>
                    {zones.length > 1 && (
                      <Pressable onPress={() => handleDeleteZone(z)} style={styles.deleteZoneBtn}>
                        <Icon name="trash-outline" size={15} color={Theme.colors.dangerText} />
                      </Pressable>
                    )}
                  </View>
                </View>

                <Text style={styles.zoneName}>{z.name}</Text>
                <Text style={styles.zoneLocation}>Kondygnacja: {z.floor} • Sale w strefie: {linkedRoomsCount}</Text>

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
            );
          })}
        </View>
      </View>

      {/* Sekcja 2: Katalog sal */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Katalog sal lekcyjnych i wyposażenia ({rooms.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Sale dostępne dla grup pozalekcyjnych i optymalizatora energii
            </Text>
          </View>
          <PrimaryButton
            title="+ Nowa sala"
            icon="add-outline"
            onPress={() => setIsAddRoomModalOpen(true)}
          />
        </View>

        {/* Filtr sal po strefie */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPillsRow}>
          <Pressable
            onPress={() => setSelectedZoneFilter('all')}
            style={[styles.filterPill, selectedZoneFilter === 'all' && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, selectedZoneFilter === 'all' && styles.filterPillTextActive]}>
              Wszystkie ({rooms.length})
            </Text>
          </Pressable>
          {zones.map((z) => {
            const count = rooms.filter((r) => r.zoneId === z.id).length;
            return (
              <Pressable
                key={z.id}
                onPress={() => setSelectedZoneFilter(z.id)}
                style={[styles.filterPill, selectedZoneFilter === z.id && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, selectedZoneFilter === z.id && styles.filterPillTextActive]}>
                  {z.name} ({count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.roomsGrid}>
          {filteredRooms.map((r) => {
            const zone = zones.find((z) => z.id === r.zoneId);
            return (
              <View key={r.id} style={styles.roomCard}>
                <View style={styles.roomCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                    <Text style={styles.roomId}>{r.id}</Text>
                    <View style={styles.capacityBadge}>
                      <Icon name="people-outline" size={13} color={Theme.colors.forest} />
                      <Text style={styles.capacityText}>{r.capacity} os.</Text>
                    </View>
                  </View>

                  <View style={styles.roomCardActions}>
                    <Pressable
                      onPress={() => openEditRoom(r)}
                      style={styles.editRoomBtn}
                      accessibilityLabel={`Edytuj wyposażenie sali ${r.id}`}
                    >
                      <Icon name="create-outline" size={14} color={Theme.colors.forest} />
                      <Text style={styles.editRoomBtnText}>Edytuj</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteRoom(r)}
                      style={styles.deleteRoomBtn}
                      accessibilityLabel={`Usuń salę ${r.id}`}
                    >
                      <Icon name="trash-outline" size={16} color="#DC3545" />
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.roomFullName}>{r.name}</Text>
                <Text style={styles.roomZoneInfo}>
                  {zone?.name || 'Strefa niezdefiniowana'} • {r.floor}
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

      {/* Modal dodawania nowej strefy energetycznej */}
      <Modal visible={isAddZoneModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 520 }]}>
            <View style={styles.modalHeaderRow}>
              <Icon name="flash" size={24} color={Theme.colors.forest} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Dodaj nową strefę energetyczną</Text>
                <Text style={styles.modalSubtitle}>Zdefiniuj obwód instalacji wentylacji i oświetlenia</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nazwa strefy *</Text>
              <TextInput
                placeholder="np. Strefa D – Nowy Pawilon Sportowy"
                value={newZoneName}
                onChangeText={setNewZoneName}
                style={styles.modalInput}
                placeholderTextColor={Theme.colors.muted}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Oznaczenie skrzydła</Text>
                <TextInput
                  placeholder="np. Skrzydło D"
                  value={newZoneWing}
                  onChangeText={setNewZoneWing}
                  style={styles.modalInput}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Kondygnacja</Text>
                <TextInput
                  placeholder="np. Parter"
                  value={newZoneFloor}
                  onChangeText={setNewZoneFloor}
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Moc instalacji (kW) *</Text>
                <TextInput
                  placeholder="2.0"
                  value={newZonePower}
                  onChangeText={setNewZonePower}
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Bufor po zajęciach (min)</Text>
                <TextInput
                  placeholder="30"
                  value={newZoneBuffer}
                  onChangeText={setNewZoneBuffer}
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.switchLabel}>Niezależne sterowanie instalacją</Text>
                <Text style={styles.inputHint}>Pozwala wyłączyć wentylację/oświetlenie po lekcjach</Text>
              </View>
              <Switch
                value={newZoneControllable}
                onValueChange={setNewZoneControllable}
                trackColor={{ true: Theme.colors.green, false: '#DDD' }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Źródło danych i wiarygodność</Text>
              <TextInput
                placeholder="np. Dokumentacja powykonawcza, audyt 2026"
                value={newZoneSource}
                onChangeText={setNewZoneSource}
                style={styles.modalInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status wiarygodności:</Text>
              <View style={styles.optionsRow}>
                {(['dokumentacja', 'pomiar', 'założenie'] as const).map((st) => (
                  <Pressable
                    key={st}
                    onPress={() => setNewZoneStatus(st)}
                    style={[styles.optionPill, newZoneStatus === st && styles.optionPillActive]}
                  >
                    <Text style={[styles.optionPillText, newZoneStatus === st && styles.optionPillTextActive]}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton title="Anuluj" onPress={() => setIsAddZoneModalOpen(false)} />
              <PrimaryButton title="Utwórz strefę" onPress={handleCreateZone} />
            </View>
          </View>
        </View>
      </Modal>

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
            <View style={styles.modalHeaderRow}>
              <Icon name="business-outline" size={24} color={Theme.colors.forest} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Dodaj nową salę do katalogu</Text>
                <Text style={styles.modalSubtitle}>Wprowadź numer, dane techniczne i wyposażenie</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { width: 130 }]}>
                <Text style={styles.inputLabel}>Numer sali</Text>
                <TextInput
                  placeholder="np. A105"
                  value={newRoomCustomId}
                  onChangeText={setNewRoomCustomId}
                  style={styles.modalInput}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Nazwa sali *</Text>
                <TextInput
                  placeholder="np. Pracownia biologiczna A105"
                  value={newRoomName}
                  onChangeText={setNewRoomName}
                  style={styles.modalInput}
                  placeholderTextColor={Theme.colors.muted}
                />
              </View>
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
                <Text style={styles.inputLabel}>Piętro / Kondygnacja:</Text>
                <TextInput
                  value={newRoomFloor}
                  onChangeText={setNewRoomFloor}
                  style={styles.modalInput}
                />
              </View>
            </View>

            {/* Szybki wybór kondygnacji */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputHint}>Szybki wybór kondygnacji:</Text>
              <View style={[styles.optionsRow, { marginTop: 4 }]}>
                {['Parter', 'I Piętro', 'II Piętro', 'III Piętro', 'Przyziemie'].map((fl) => (
                  <Pressable
                    key={fl}
                    onPress={() => setNewRoomFloor(fl)}
                    style={[styles.smallPill, newRoomFloor === fl && styles.smallPillActive]}
                  >
                    <Text style={[styles.smallPillText, newRoomFloor === fl && styles.smallPillTextActive]}>
                      {fl}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.switchLabel}>Dostęp bez barier (parter / winda):</Text>
                <Text style={styles.inputHint}>Umożliwia przydział dla grup z potrzebą dostępności</Text>
              </View>
              <Switch
                value={newRoomAccessible}
                onValueChange={setNewRoomAccessible}
                trackColor={{ true: Theme.colors.green, false: '#DDD' }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Asortyment i wyposażenie sali:</Text>
              <View style={styles.optionsRow}>
                {['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica', 'projektor', 'mikrofony'].map((item) => {
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
                        {isChecked ? `✓ ${item}` : item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Dodatkowe wyposażenie */}
              {newRoomEquipment.filter((eq) => !['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica', 'projektor', 'mikrofony'].includes(eq)).length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.inputHint}>Własny asortyment:</Text>
                  <View style={[styles.optionsRow, { marginTop: 4 }]}>
                    {newRoomEquipment
                      .filter((eq) => !['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica', 'projektor', 'mikrofony'].includes(eq))
                      .map((eq) => (
                        <Pressable
                          key={eq}
                          onPress={() => toggleEquipmentOption(eq)}
                          style={[styles.optionPill, styles.optionPillActive]}
                        >
                          <Text style={[styles.optionPillText, styles.optionPillTextActive]}>
                            ✓ {eq} ✕
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                </View>
              )}

              {/* Pole dodawania własnego wyposażenia */}
              <View style={styles.customEquipRow}>
                <TextInput
                  placeholder="Wpisz nowe wyposażenie (np. laptopy, rzutnik)"
                  value={addCustomEquipInput}
                  onChangeText={setAddCustomEquipInput}
                  style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                  placeholderTextColor={Theme.colors.muted}
                />
                <Pressable
                  onPress={handleAddCustomEquipToNew}
                  style={styles.addCustomEquipBtn}
                >
                  <Icon name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addCustomEquipBtnText}>Dodaj</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton title="Anuluj" onPress={() => setIsAddRoomModalOpen(false)} />
              <PrimaryButton title="Dodaj salę" onPress={handleCreateRoom} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal edycji sali i asortymentu */}
      <Modal visible={editingRoom !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 540, maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeaderRow}>
                <Icon name="create-outline" size={24} color={Theme.colors.forest} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Edytuj salę i asortyment</Text>
                  <Text style={styles.modalSubtitle}>
                    Sala {editingRoom?.id} • Zmień wyposażenie, strefę lub piętro
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nazwa sali *</Text>
                <TextInput
                  value={editRoomName}
                  onChangeText={setEditRoomName}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Przypisana strefa energetyczna:</Text>
                <View style={styles.optionsRow}>
                  {zones.map((z) => (
                    <Pressable
                      key={z.id}
                      onPress={() => setEditRoomZone(z.id)}
                      style={[styles.optionPill, editRoomZone === z.id && styles.optionPillActive]}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          editRoomZone === z.id && styles.optionPillTextActive,
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
                    value={editRoomCapacity}
                    onChangeText={setEditRoomCapacity}
                    keyboardType="numeric"
                    style={styles.modalInput}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Piętro / Kondygnacja:</Text>
                  <TextInput
                    value={editRoomFloor}
                    onChangeText={setEditRoomFloor}
                    style={styles.modalInput}
                  />
                </View>
              </View>

              {/* Szybki wybór piętra */}
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputHint}>Szybki wybór kondygnacji:</Text>
                <View style={[styles.optionsRow, { marginTop: 4 }]}>
                  {['Parter', 'I Piętro', 'II Piętro', 'III Piętro', 'Przyziemie'].map((fl) => (
                    <Pressable
                      key={fl}
                      onPress={() => setEditRoomFloor(fl)}
                      style={[styles.smallPill, editRoomFloor === fl && styles.smallPillActive]}
                    >
                      <Text style={[styles.smallPillText, editRoomFloor === fl && styles.smallPillTextActive]}>
                        {fl}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.switchLabel}>Dostęp bez barier architektonicznych:</Text>
                  <Text style={styles.inputHint}>Winda lub parter bez schodów</Text>
                </View>
                <Switch
                  value={editRoomAccessible}
                  onValueChange={setEditRoomAccessible}
                  trackColor={{ true: Theme.colors.green, false: '#DDD' }}
                />
              </View>

              {/* Asortyment / Wyposażenie */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Asortyment i wyposażenie sali:</Text>
                <Text style={styles.inputHint}>Kliknij, aby dodać lub odznaczyć wyposażenie sali:</Text>

                <View style={[styles.optionsRow, { marginTop: 8 }]}>
                  {['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica', 'projektor', 'mikrofony', 'rolety'].map(
                    (item) => {
                      const isChecked = editRoomEquipment.includes(item);
                      return (
                        <Pressable
                          key={item}
                          onPress={() => toggleEditEquipmentOption(item)}
                          style={[styles.optionPill, isChecked && styles.optionPillActive]}
                        >
                          <Text
                            style={[styles.optionPillText, isChecked && styles.optionPillTextActive]}
                          >
                            {isChecked ? `✓ ${item}` : item}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>

                {/* Ewentualne niestandardowe elementy wyposażenia */}
                {editRoomEquipment.filter((eq) => !['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica', 'projektor', 'mikrofony', 'rolety'].includes(eq)).length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.inputHint}>Własny asortyment:</Text>
                    <View style={[styles.optionsRow, { marginTop: 4 }]}>
                      {editRoomEquipment
                        .filter((eq) => !['ekran', 'komputery', 'drukarka 3d', 'nagłośnienie', 'tablica', 'projektor', 'mikrofony', 'rolety'].includes(eq))
                        .map((eq) => (
                          <Pressable
                            key={eq}
                            onPress={() => toggleEditEquipmentOption(eq)}
                            style={[styles.optionPill, styles.optionPillActive]}
                          >
                            <Text style={[styles.optionPillText, styles.optionPillTextActive]}>
                              ✓ {eq} ✕
                            </Text>
                          </Pressable>
                        ))}
                    </View>
                  </View>
                )}

                {/* Pole dodawania własnego wyposażenia */}
                <View style={styles.customEquipRow}>
                  <TextInput
                    placeholder="Wpisz nowe wyposażenie (np. mikroskopy, laptopy)"
                    value={editCustomEquipInput}
                    onChangeText={setEditCustomEquipInput}
                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                    placeholderTextColor={Theme.colors.muted}
                  />
                  <Pressable
                    onPress={handleAddCustomEquipToEdit}
                    style={styles.addCustomEquipBtn}
                  >
                    <Icon name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.addCustomEquipBtnText}>Dodaj</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.modalActions}>
                <SecondaryButton title="Anuluj" onPress={() => setEditingRoom(null)} />
                <PrimaryButton title="Zapisz zmiany" onPress={handleSaveRoom} />
              </View>
            </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
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
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EAF6EF',
    borderWidth: 1,
    borderColor: '#BFE4CE',
    padding: 12,
    borderRadius: Theme.radii.md,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F5132',
    flex: 1,
  },
  section: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
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
  filterPillsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.full,
    backgroundColor: '#F0F3F1',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: Theme.colors.forest,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.muted,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
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
  zoneCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  editBtnText: {
    fontSize: 13,
    color: Theme.colors.green,
    fontWeight: '600',
  },
  deleteZoneBtn: {
    padding: 4,
    borderRadius: 4,
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
    marginTop: 8,
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
  deleteRoomBtn: {
    padding: 6,
    borderRadius: 4,
  },
  roomCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    backgroundColor: '#EDF5F1',
    borderWidth: 1,
    borderColor: '#D0E6DB',
  },
  editRoomBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    backgroundColor: '#F0F2F0',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  smallPillActive: {
    backgroundColor: Theme.colors.forest,
    borderColor: Theme.colors.forest,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  smallPillTextActive: {
    color: '#FFFFFF',
  },
  customEquipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  addCustomEquipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Theme.radii.md,
  },
  addCustomEquipBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
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
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
});
