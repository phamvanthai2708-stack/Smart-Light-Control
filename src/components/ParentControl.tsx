import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions, StatusBar } from 'react-native';
import LightControl from './LightControl';

const { width } = Dimensions.get('window');

const ParentControl = () => {
  // useState to manage light status (Bật / Tắt) and brightness (0 -> 100)
  const [isOn, setIsOn] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(50); // Default to 50% when first turned on

  // Callback to toggle Bật / Tắt
  const handleToggleLight = () => {
    setIsOn(prev => !prev);
  };

  // Callback to increase brightness by 10 (maximum 100)
  // Disabled when light is off
  const handleIncreaseBrightness = () => {
    if (!isOn) return;
    setBrightness(prev => {
      const nextVal = prev + 10;
      return nextVal > 100 ? 100 : nextVal;
    });
  };

  // Callback to decrease brightness by 10 (minimum 0)
  // Disabled when light is off
  const handleDecreaseBrightness = () => {
    if (!isOn) return;
    setBrightness(prev => {
      const nextVal = prev - 10;
      return nextVal < 0 ? 0 : nextVal;
    });
  };

  const statusText = isOn ? 'Bật' : 'Tắt';
  const statusColor = isOn ? '#4ADE80' : '#F87171'; // Beautiful light green and pastel red

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Main Application Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HỆ THỐNG ĐÈN THÔNG MINH</Text>
          <Text style={styles.headerSubtitle}>Smart Home Automation</Text>
        </View>

        {/* Parent Component UI Container */}
        <View style={styles.parentCard}>
          <Text style={styles.parentHeader}>===== COMPONENT CHA =====</Text>
          
          <Text style={styles.subTitle}>Bộ Điều Khiển Trung Tâm</Text>

          <View style={styles.dashboardGrid}>
            <View style={styles.dashboardItem}>
              <Text style={styles.dashboardLabel}>TRẠNG THÁI ĐÈN</Text>
              <View style={styles.statusIndicatorWrapper}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusValueText, { color: statusColor }]}>
                  {statusText}
                </Text>
              </View>
            </View>

            <View style={styles.dashboardItem}>
              <Text style={styles.dashboardLabel}>ĐỘ SÁNG HIỆN TẠI</Text>
              <Text style={styles.brightnessValueText}>
                {isOn ? `${brightness}%` : '0%'}
              </Text>
            </View>
          </View>

          {/* Quick status bar */}
          <View style={styles.statusSummaryBar}>
            <Text style={styles.summaryText}>
              Hệ thống {isOn ? 'đang hoạt động ổn định' : 'đang ở chế độ chờ'}
            </Text>
          </View>
        </View>

        {/* Child Component UI */}
        <LightControl
          isOn={isOn}
          brightness={brightness}
          onToggle={handleToggleLight}
          onIncrease={handleIncreaseBrightness}
          onDecrease={handleDecreaseBrightness}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 SmartLight Inc. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentControl;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  scrollContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  header: {
    width: width * 0.92,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  parentCard: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 20,
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#334155', // Slate 700
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    width: width * 0.92,
  },
  parentHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FB7185', // Coral/Rose pink color to differentiate from Child
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 3,
  },
  subTitle: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  dashboardItem: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dashboardLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statusIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusValueText: {
    fontSize: 16,
    fontWeight: '900',
  },
  brightnessValueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F1F5F9',
  },
  statusSummaryBar: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    alignItems: 'center',
  },
  summaryText: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 15,
    marginBottom: 5,
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 10,
  },
});
