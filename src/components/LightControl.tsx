import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';

interface LightControlProps {
  isOn: boolean;
  brightness: number;
  onToggle: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

const { width } = Dimensions.get('window');

const LightControl = ({
  isOn,
  brightness,
  onToggle,
  onIncrease,
  onDecrease,
}: LightControlProps) => {
  const statusText = isOn ? 'Bật' : 'Tắt';
  const statusColor = isOn ? '#4ADE80' : '#F87171'; // Beautiful bright Green and Red

  // Permanent, reliable image links for light bulb illustration
  const bulbOnUri = 'https://img.icons8.com/color/180/light-bulb.png';
  const bulbOffUri = 'https://img.icons8.com/ios-filled/180/7F8C8D/light-bulb.png';

  return (
    <View style={styles.childCard}>
      <Text style={styles.childHeader}>===== COMPONENT CON =====</Text>

      {/* Decorative Title */}
      <Text style={styles.subTitle}>Bộ Điều Khiển Đầu Cuối</Text>

      {/* Illustrative light bulb image with dynamic glowing backplate */}
      <View style={styles.bulbWrapper}>
        <View style={styles.bulbContainer}>
          {isOn && (
            <View
              style={[
                styles.bulbGlow,
                {
                  opacity: (brightness / 100) * 0.85,
                  transform: [{ scale: 0.8 + (brightness / 100) * 0.4 }],
                },
              ]}
            />
          )}
          <Text style={[styles.bulbEmoji, !isOn && styles.bulbEmojiOff]}>
            💡
          </Text>
        </View>
        {isOn ? (
          <View style={styles.brightnessTag}>
            <Text style={styles.brightnessTagText}>{brightness}%</Text>
          </View>
        ) : (
          <View style={[styles.brightnessTag, styles.tagOff]}>
            <Text style={styles.brightnessTagText}>OFF</Text>
          </View>
        )}
      </View>

      {/* Visual Brightness Progress Bar */}
      {isOn && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Cường độ sáng</Text>
            <Text style={styles.progressText}>{brightness}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${brightness}%` }]} />
          </View>
        </View>
      )}

      {/* State & Prop Values from Parent */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái nhận được:</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Độ sáng nhận được:</Text>
          <Text style={styles.brightnessValue}>
            {isOn ? `${brightness}%` : '0% (Đèn đang tắt)'}
          </Text>
        </View>
      </View>

      {/* Callbacks Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isOn ? styles.buttonOff : styles.buttonOn,
          ]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isOn ? '🔴 TẮT ĐÈN' : '🟢 BẬT ĐÈN'}
          </Text>
        </TouchableOpacity>

        <View style={styles.brightnessRow}>
          <TouchableOpacity
            style={[
              styles.brightnessButton,
              styles.btnDecrease,
              (!isOn || brightness <= 0) && styles.disabledButton,
            ]}
            onPress={onDecrease}
            disabled={!isOn || brightness <= 0}
            activeOpacity={0.7}
          >
            <Text style={styles.brightnessButtonText}>➖ Giảm độ sáng (-10)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.brightnessButton,
              styles.btnIncrease,
              (!isOn || brightness >= 100) && styles.disabledButton,
            ]}
            onPress={onIncrease}
            disabled={!isOn || brightness >= 100}
            activeOpacity={0.7}
          >
            <Text style={styles.brightnessButtonText}>➕ Tăng độ sáng (+10)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LightControl;

const styles = StyleSheet.create({
  childCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#475569',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    width: width * 0.92,
    alignSelf: 'center',
  },
  childHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38BDF8',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bulbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    position: 'relative',
  },
  bulbContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bulbGlow: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
  },
  bulbEmoji: {
    fontSize: 55,
    zIndex: 2,
    textAlign: 'center',
  },
  bulbEmojiOff: {
    opacity: 0.25,
  },
  brightnessTag: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tagOff: {
    backgroundColor: '#64748B',
  },
  brightnessTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressSection: {
    width: '100%',
    marginVertical: 6,
    paddingHorizontal: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  infoSection: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  brightnessValue: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: 'bold',
  },
  buttonGroup: {
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonOn: {
    backgroundColor: '#10B981',
  },
  buttonOff: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  brightnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  brightnessButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnDecrease: {
    backgroundColor: '#475569',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  btnIncrease: {
    backgroundColor: '#F59E0B',
  },
  brightnessButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    opacity: 0.35,
  },
});
