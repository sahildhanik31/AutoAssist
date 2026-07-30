// NotificationScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AppBackButton from "@/components/common/AppBackButton";
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, orderBy, query, writeBatch } from 'firebase/firestore';
import { auth } from '@/firebase/firebaseConfig';
import { db } from '@/firebase/firestore';


type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
};
export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadNotifications() {
        const uid = auth.currentUser?.uid;
if (!uid) {
  setLoading(false);
  return;
}
        setLoading(true);
        try {
          const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'));
          const snap = await getDocs(q);
          setNotifications(
            snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                title: data.title ?? '',
                description: data.message ?? '',
                time: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : '',
                read: !!data.isRead,
              };
            })
          );
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      }
      loadNotifications();
    }, [])
  );

  const handleMarkAllAsRead = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        batch.update(doc(db, 'users', uid, 'notifications', n.id), { isRead: true });
      });
      await batch.commit();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      alert('All Notifications Marked As Read');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerContainer}>
         <AppBackButton />
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Mark All As Read Button */}
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={handleMarkAllAsRead}
          activeOpacity={0.8}
        >
          <Text style={styles.markReadButtonText}>Mark All As Read</Text>
        </TouchableOpacity>

        {/* Notifications List Section */}
        <View style={styles.sectionContainer}>
          {loading && (
  <Text style={styles.loadingText}>
    Loading notifications...
  </Text>
)}
          {notifications.map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              {!item.read && <View style={styles.unreadDot} />}

              <View style={styles.notificationIconPlaceholder} />

              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationDescription}>{item.description}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  headerSpacer: {
    width: 42,
  },
  markReadButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  markReadButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#60646c',
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e5eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#1e3a8a',
  },
  notificationIconPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#e7edfb',
    marginRight: 14,
  },
  notificationTextContainer: {
    flex: 1,
    paddingRight: 14,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#60646c',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9aa0a8',
    fontWeight: '600',
  },
});