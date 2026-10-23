import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { Icon } from '../components/Icons';

// Ekrany panelu webowego (Administrator)
import { AdminOverview } from '../views/AdminOverview';
import { AdminSchedule } from '../views/AdminSchedule';
import { AdminRooms } from '../views/AdminRooms';
import { AdminVariants } from '../views/AdminVariants';
import { AdminRequests } from '../views/AdminRequests';
import { AdminReport } from '../views/AdminReport';

// Ekrany aplikacji mobilnej (Nauczyciel)
import { TeacherToday } from '../views/TeacherToday';
import { TeacherNewRequest } from '../views/TeacherNewRequest';
import { TeacherRequests } from '../views/TeacherRequests';
import { TeacherChanges } from '../views/TeacherChanges';
import { TeacherProfile } from '../views/TeacherProfile';

export default function MainScreen() {
  const { width } = useWindowDimensions();
  const {
    role,
    setRole,
    adminTab,
    setAdminTab,
    teacherTab,
    setTeacherTab,
    school,
    changeNotices,
    requests,
    resetToDemoData,
  } = useApp();

  const isDesktop = width >= 900;
  // Tryb podglądu na desktopie: domyślnie panel administratora lub aplikacja mobilna
  const [devicePreview, setDevicePreview] = useState<'responsive' | 'mobile_frame'>('responsive');

  // Licznik nieprzeczytanych zmian dla nauczyciela
  const unreadChangesCount = changeNotices.filter(
    (n) => n.teacherId === 'teacher-1' && !n.acknowledgedAt
  ).length;

  // Licznik oczekujących wniosków dla administratora
  const pendingRequestsCount = requests.filter((r) => r.status === 'oczekujący').length;

  // Renderowanie aktywnego widoku administratora
  const renderAdminView = () => {
    switch (adminTab) {
      case 'overview':
        return <AdminOverview />;
      case 'schedule':
        return <AdminSchedule />;
      case 'rooms':
        return <AdminRooms />;
      case 'variants':
        return <AdminVariants />;
      case 'requests':
        return <AdminRequests />;
      case 'report':
        return <AdminReport />;
      default:
        return <AdminOverview />;
    }
  };

  // Renderowanie aktywnego widoku nauczyciela
  const renderTeacherView = () => {
    switch (teacherTab) {
      case 'today':
        return <TeacherToday />;
      case 'new_request':
        return <TeacherNewRequest />;
      case 'requests':
        return <TeacherRequests />;
      case 'changes':
        return <TeacherChanges />;
      case 'profile':
        return <TeacherProfile />;
      default:
        return <TeacherToday />;
    }
  };

  // Pasek dolnej nawigacji dla aplikacji mobilnej
  const renderMobileBottomNav = () => (
    <View style={styles.mobileBottomNav}>
      <Pressable
        onPress={() => setTeacherTab('today')}
        style={[styles.bottomNavItem, teacherTab === 'today' && styles.bottomNavItemActive]}
      >
        <Icon
          name={teacherTab === 'today' ? 'calendar' : 'calendar-outline'}
          size={22}
          color={teacherTab === 'today' ? Theme.colors.forest : Theme.colors.muted}
        />
        <Text
          style={[styles.bottomNavText, teacherTab === 'today' && styles.bottomNavTextActive]}
        >
          Dziś
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setTeacherTab('requests')}
        style={[styles.bottomNavItem, teacherTab === 'requests' && styles.bottomNavItemActive]}
      >
        <Icon
          name={teacherTab === 'requests' ? 'document-text' : 'document-text-outline'}
          size={22}
          color={teacherTab === 'requests' ? Theme.colors.forest : Theme.colors.muted}
        />
        <Text
          style={[styles.bottomNavText, teacherTab === 'requests' && styles.bottomNavTextActive]}
        >
          Wnioski
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setTeacherTab('changes')}
        style={[styles.bottomNavItem, teacherTab === 'changes' && styles.bottomNavItemActive]}
      >
        <View>
          <Icon
            name={teacherTab === 'changes' ? 'swap-horizontal' : 'swap-horizontal-outline'}
            size={22}
            color={teacherTab === 'changes' ? Theme.colors.forest : Theme.colors.muted}
          />
          {unreadChangesCount > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{unreadChangesCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.bottomNavText, teacherTab === 'changes' && styles.bottomNavTextActive]}
        >
          Zmiany
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setTeacherTab('profile')}
        style={[styles.bottomNavItem, teacherTab === 'profile' && styles.bottomNavItemActive]}
      >
        <Icon
          name={teacherTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={teacherTab === 'profile' ? Theme.colors.forest : Theme.colors.muted}
        />
        <Text
          style={[styles.bottomNavText, teacherTab === 'profile' && styles.bottomNavTextActive]}
        >
          Profil
        </Text>
      </Pressable>
    </View>
  );

  // Desktopowy Topbar narzędziowy: przełącznik ról i podglądu urządzenia
  const renderDesktopControlBar = () => (
    <View style={styles.desktopControlBar}>
      <View style={styles.controlBarLeft}>
        <Text style={styles.controlBarLabel}>Widok prezentacyjny:</Text>
        <View style={styles.pillGroup}>
          <Pressable
            onPress={() => {
              setRole('admin');
              setDevicePreview('responsive');
            }}
            style={[styles.controlPill, role === 'admin' && styles.controlPillActive]}
          >
            <Icon
              name="laptop-outline"
              size={15}
              color={role === 'admin' ? '#FFFFFF' : Theme.colors.forest}
            />
            <Text
              style={[styles.controlPillText, role === 'admin' && styles.controlPillTextActive]}
            >
              Panel Webowy (Admin)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setRole('teacher');
            }}
            style={[styles.controlPill, role === 'teacher' && styles.controlPillActive]}
          >
            <Icon
              name="phone-portrait-outline"
              size={15}
              color={role === 'teacher' ? '#FFFFFF' : Theme.colors.forest}
            />
            <Text
              style={[styles.controlPillText, role === 'teacher' && styles.controlPillTextActive]}
            >
              Aplikacja Mobilna (Nauczyciel)
            </Text>
          </Pressable>
        </View>

        {role === 'teacher' && (
          <View style={[styles.pillGroup, { marginLeft: 16 }]}>
            <Pressable
              onPress={() => setDevicePreview('responsive')}
              style={[styles.controlPillSmall, devicePreview === 'responsive' && styles.controlPillSmallActive]}
            >
              <Text style={[styles.controlPillSmallText, devicePreview === 'responsive' && styles.controlPillSmallTextActive]}>
                Pełna szerokość
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDevicePreview('mobile_frame')}
              style={[styles.controlPillSmall, devicePreview === 'mobile_frame' && styles.controlPillSmallActive]}
            >
              <Text style={[styles.controlPillSmallText, devicePreview === 'mobile_frame' && styles.controlPillSmallTextActive]}>
                Ramka smartfona (PNG)
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.controlBarRight}>
        <Pressable onPress={resetToDemoData} style={styles.resetBtn}>
          <Icon name="refresh-outline" size={14} color={Theme.colors.muted} />
          <Text style={styles.resetBtnText}>Reset danych DEMO</Text>
        </Pressable>
        <View style={styles.badgeSchool}>
          <Text style={styles.badgeSchoolText}>Future Smart City 2026</Text>
        </View>
      </View>
    </View>
  );

  // Desktopowy panel boczny nawigacji (Sidebar)
  const renderDesktopSidebar = () => (
    <View style={styles.sidebar}>
      {/* Nagłówek Sidebara */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Icon name="flash" size={20} color={Theme.colors.lime} />
          </View>
          <Text style={styles.logoTitle}>EnergoPlan</Text>
        </View>
        <Text style={styles.sidebarSub}>{school.name}</Text>
      </View>

      {/* Lista zakładek panelu administratora */}
      <ScrollView style={styles.sidebarNav}>
        <Pressable
          onPress={() => setAdminTab('overview')}
          style={[styles.navItem, adminTab === 'overview' && styles.navItemActive]}
        >
          <Icon
            name="grid-outline"
            size={18}
            color={adminTab === 'overview' ? '#FFFFFF' : '#A3C1B7'}
          />
          <Text style={[styles.navItemText, adminTab === 'overview' && styles.navItemTextActive]}>
            Przegląd
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setAdminTab('schedule')}
          style={[styles.navItem, adminTab === 'schedule' && styles.navItemActive]}
        >
          <Icon
            name="calendar-outline"
            size={18}
            color={adminTab === 'schedule' ? '#FFFFFF' : '#A3C1B7'}
          />
          <Text style={[styles.navItemText, adminTab === 'schedule' && styles.navItemTextActive]}>
            Plan dnia
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setAdminTab('rooms')}
          style={[styles.navItem, adminTab === 'rooms' && styles.navItemActive]}
        >
          <Icon
            name="business-outline"
            size={18}
            color={adminTab === 'rooms' ? '#FFFFFF' : '#A3C1B7'}
          />
          <Text style={[styles.navItemText, adminTab === 'rooms' && styles.navItemTextActive]}>
            Sale i strefy
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setAdminTab('variants')}
          style={[styles.navItem, adminTab === 'variants' && styles.navItemActive]}
        >
          <Icon
            name="git-compare-outline"
            size={18}
            color={adminTab === 'variants' ? '#FFFFFF' : '#A3C1B7'}
          />
          <Text style={[styles.navItemText, adminTab === 'variants' && styles.navItemTextActive]}>
            Warianty planu
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setAdminTab('requests')}
          style={[styles.navItem, adminTab === 'requests' && styles.navItemActive]}
        >
          <Icon
            name="mail-outline"
            size={18}
            color={adminTab === 'requests' ? '#FFFFFF' : '#A3C1B7'}
          />
          <Text style={[styles.navItemText, adminTab === 'requests' && styles.navItemTextActive]}>
            Wnioski
          </Text>
          {pendingRequestsCount > 0 && (
            <View style={styles.badgeCounter}>
              <Text style={styles.badgeCounterText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => setAdminTab('report')}
          style={[styles.navItem, adminTab === 'report' && styles.navItemActive]}
        >
          <Icon
            name="bar-chart-outline"
            size={18}
            color={adminTab === 'report' ? '#FFFFFF' : '#A3C1B7'}
          />
          <Text style={[styles.navItemText, adminTab === 'report' && styles.navItemTextActive]}>
            Raport
          </Text>
        </Pressable>
      </ScrollView>

      {/* Stopka Sidebara */}
      <View style={styles.sidebarFooter}>
        <View style={styles.userCardMini}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>AD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userNameMini}>Administrator</Text>
            <Text style={styles.userRoleMini}>Zarządzanie szkołą</Text>
          </View>
        </View>

        <Pressable
          onPress={() => setRole('teacher')}
          style={styles.switchRoleSidebarBtn}
        >
          <Icon name="phone-portrait-outline" size={15} color={Theme.colors.lime} />
          <Text style={styles.switchRoleSidebarText}>Przełącz na aplikację</Text>
        </Pressable>
      </View>
    </View>
  );

  // Wariant A: Ekran Desktopowy dla Administratora
  if (isDesktop && role === 'admin') {
    return (
      <SafeAreaView style={styles.desktopRoot} edges={['top', 'bottom']}>
        {renderDesktopControlBar()}
        <View style={styles.desktopMainContainer}>
          {renderDesktopSidebar()}
          <View style={styles.desktopContentArea}>{renderAdminView()}</View>
        </View>
      </SafeAreaView>
    );
  }

  // Wariant B: Ekran Desktopowy z podglądem Aplikacji Mobilnej (w ramce smartfona jak na PNG)
  if (isDesktop && role === 'teacher' && devicePreview === 'mobile_frame') {
    return (
      <SafeAreaView style={styles.desktopRoot} edges={['top', 'bottom']}>
        {renderDesktopControlBar()}
        <ScrollView
          style={{ flex: 1, backgroundColor: '#E5E8E2' }}
          contentContainerStyle={styles.mobileFrameContainer}
        >
          <View style={styles.phoneMockup}>
            {/* Głośnik i notch smartfona */}
            <View style={styles.phoneSpeaker} />
            <View style={styles.phoneScreen}>
              <View style={{ flex: 1 }}>{renderTeacherView()}</View>
              {renderMobileBottomNav()}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Wariant C: Ekran Mobilny (lub Desktop responsywny z centralnym kontenerem)
  return (
    <SafeAreaView style={styles.mobileRoot} edges={['top', 'bottom']}>
      {isDesktop && renderDesktopControlBar()}

      {/* Mobilny Header z nazwą szkoły i rolą */}
      <View style={styles.mobileTopBar}>
        <View style={styles.mobileBrand}>
          <Icon name="flash" size={18} color={Theme.colors.green} />
          <Text style={styles.mobileBrandTitle}>EnergoPlan</Text>
        </View>

        <View style={styles.mobileTopRight}>
          <Pressable
            onPress={() => setRole(role === 'teacher' ? 'admin' : 'teacher')}
            style={styles.roleTagBtn}
          >
            <Text style={styles.roleTagBtnText}>
              {role === 'teacher' ? 'Rola: Nauczyciel ▾' : 'Rola: Admin ▾'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Główna treść mobilna */}
      <View style={styles.mobileContentWrapper}>
        <View style={styles.mobileMaxContainer}>
          {role === 'teacher' ? renderTeacherView() : renderAdminView()}
        </View>
      </View>

      {/* Dolny pasek nawigacji */}
      {role === 'teacher' ? (
        renderMobileBottomNav()
      ) : (
        <View style={styles.mobileBottomNav}>
          <Pressable
            onPress={() => setAdminTab('overview')}
            style={[styles.bottomNavItem, adminTab === 'overview' && styles.bottomNavItemActive]}
          >
            <Icon
              name="grid-outline"
              size={20}
              color={adminTab === 'overview' ? Theme.colors.forest : Theme.colors.muted}
            />
            <Text
              style={[styles.bottomNavText, adminTab === 'overview' && styles.bottomNavTextActive]}
            >
              Przegląd
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setAdminTab('schedule')}
            style={[styles.bottomNavItem, adminTab === 'schedule' && styles.bottomNavItemActive]}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color={adminTab === 'schedule' ? Theme.colors.forest : Theme.colors.muted}
            />
            <Text
              style={[styles.bottomNavText, adminTab === 'schedule' && styles.bottomNavTextActive]}
            >
              Plan
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setAdminTab('variants')}
            style={[styles.bottomNavItem, adminTab === 'variants' && styles.bottomNavItemActive]}
          >
            <Icon
              name="git-compare-outline"
              size={20}
              color={adminTab === 'variants' ? Theme.colors.forest : Theme.colors.muted}
            />
            <Text
              style={[styles.bottomNavText, adminTab === 'variants' && styles.bottomNavTextActive]}
            >
              Warianty
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setAdminTab('requests')}
            style={[styles.bottomNavItem, adminTab === 'requests' && styles.bottomNavItemActive]}
          >
            <View>
              <Icon
                name="mail-outline"
                size={20}
                color={adminTab === 'requests' ? Theme.colors.forest : Theme.colors.muted}
              />
              {pendingRequestsCount > 0 && (
                <View style={styles.navBadge}>
                  <Text style={styles.navBadgeText}>{pendingRequestsCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.bottomNavText, adminTab === 'requests' && styles.bottomNavTextActive]}
            >
              Wnioski
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setAdminTab('report')}
            style={[styles.bottomNavItem, adminTab === 'report' && styles.bottomNavItemActive]}
          >
            <Icon
              name="bar-chart-outline"
              size={20}
              color={adminTab === 'report' ? Theme.colors.forest : Theme.colors.muted}
            />
            <Text
              style={[styles.bottomNavText, adminTab === 'report' && styles.bottomNavTextActive]}
            >
              Raport
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Desktop
  desktopRoot: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  desktopControlBar: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 10,
  },
  controlBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  controlBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.muted,
  },
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: '#EDF2EE',
    borderRadius: Theme.radii.full,
    padding: 3,
    gap: 4,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.radii.full,
  },
  controlPillActive: {
    backgroundColor: Theme.colors.forest,
  },
  controlPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  controlPillTextActive: {
    color: '#FFFFFF',
  },
  controlPillSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
  },
  controlPillSmallActive: {
    backgroundColor: Theme.colors.green,
  },
  controlPillSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.muted,
  },
  controlPillSmallTextActive: {
    color: '#FFFFFF',
  },
  controlBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  resetBtnText: {
    fontSize: 12,
    color: Theme.colors.muted,
    fontWeight: '500',
  },
  badgeSchool: {
    backgroundColor: '#EAF3EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
  },
  badgeSchoolText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  desktopMainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: Theme.colors.forest,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E4E42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sidebarSub: {
    fontSize: 12,
    color: '#A3C1B7',
    fontWeight: '500',
  },
  sidebarNav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: Theme.radii.md,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#276C50',
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4E2DC',
    flex: 1,
  },
  navItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeCounter: {
    backgroundColor: Theme.colors.warningText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1E4E42',
    paddingTop: 16,
    gap: 12,
  },
  userCardMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#276C50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  userNameMini: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  userRoleMini: {
    color: '#A3C1B7',
    fontSize: 11,
  },
  switchRoleSidebarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E4E42',
    paddingVertical: 8,
    borderRadius: Theme.radii.sm,
  },
  switchRoleSidebarText: {
    color: Theme.colors.lime,
    fontSize: 12,
    fontWeight: '700',
  },
  desktopContentArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  // Ramka smartfona na desktopie
  mobileFrameContainer: {
    minHeight: '100%',
    backgroundColor: '#E5E8E2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  phoneMockup: {
    width: 390,
    height: 800,
    backgroundColor: '#000000',
    borderRadius: 48,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  phoneSpeaker: {
    width: 100,
    height: 5,
    backgroundColor: '#333333',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: 38,
    overflow: 'hidden',
  },

  // Mobilne
  mobileRoot: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  mobileTopBar: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileBrandTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  mobileTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTagBtn: {
    backgroundColor: '#EDF2EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radii.full,
  },
  roleTagBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  mobileContentWrapper: {
    flex: 1,
  },
  mobileMaxContainer: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  mobileBottomNav: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  bottomNavItemActive: {},
  bottomNavText: {
    fontSize: 11,
    fontWeight: '500',
    color: Theme.colors.muted,
    marginTop: 3,
  },
  bottomNavTextActive: {
    color: Theme.colors.forest,
    fontWeight: '700',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Theme.colors.warningText,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
