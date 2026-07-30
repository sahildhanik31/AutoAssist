// Profile screen
import { router } from 'expo-router';
import {
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState, useCallback } from 'react';
import AppBackButton from "@/components/common/AppBackButton";
import { useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { db } from '@/firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
const profileImage =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const actionIcons = {
  vehicle:
    "https://cdn-icons-png.flaticon.com/512/741/741407.png",

  membership:
    "https://cdn-icons-png.flaticon.com/512/2919/2919592.png",

  "service-history":
    "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",

  support:
    "https://cdn-icons-png.flaticon.com/512/471/471664.png",
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profileImageUrl: '',
    vehicle: '',
    registrationNumber: '',
    membershipPlan: '',
    memberSince: '',
    isMember: false,
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        setLoading(true);
        try {
          const userSnapshot = await getDoc(doc(db, 'users', uid));
          const userData = userSnapshot.exists() ? userSnapshot.data() : {};
          const vehiclesSnapshot = await getDocs(
            query(
              collection(db, 'users', uid, 'vehicles'),
              orderBy('createdAt', 'desc'),
              limit(1)
            )
          );
          const vehicleData = vehiclesSnapshot.empty
            ? {}
            : vehiclesSnapshot.docs[0].data();
          const membershipSnapshot = await getDoc(
            doc(db, 'users', uid, 'memberships', 'current')
          );
          const membershipData = membershipSnapshot.exists()
            ? membershipSnapshot.data()
            : {};
          const isMember = membershipData.status === 'active';
          setProfile({
            name: userData.name ?? auth.currentUser?.displayName ?? '',
            email: userData.email ?? auth.currentUser?.email ?? '',
            profileImageUrl: userData.profileImageUrl ?? '',
            vehicle: [vehicleData.company, vehicleData.model]
              .filter(Boolean)
              .join(' '),
            registrationNumber: vehicleData.registrationNumber ?? '',
            membershipPlan: isMember ? membershipData.planName ?? 'AutoAssist Member' : '',
            memberSince:
              isMember && membershipData.startDate?.toDate
                ? membershipData.startDate.toDate().toLocaleDateString('en-IN')
                : '',
            isMember,
          });
        } catch (err) {
          console.log(err);
          Alert.alert('Unable to Load Profile', 'Please check your connection and try again.');
        } finally {
          setLoading(false);
        }
      }
      loadProfile();
    }, [])
  );
  const actionCards = [
    { id: 'vehicle', label: 'My Garage' },
    { id: 'membership', label: 'Membership' },
    { id: 'service-history', label: 'Service History' },
    { id: 'support', label: 'Support' },
  ];

  const handleActionPress = (id: string) => {
  switch (id) {
    case "vehicle":
      router.push("/bookings/MyGarage");
      break;

    case "membership":
      router.push("/services/Membership");
      break;

    case "service-history":
      router.push("/tabs/ServiceHistory");
      break;

    case "support":
      Alert.alert(
        "AutoAssist Support",
        "For any further queries, contact autoassist@gmail.com."
      );
      break;

    default:
      break;
  }
};

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Edit Profile will be available soon.");
  };

 const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut(auth);
      router.dismissAll();
      router.replace('/auth/Login');
    } catch (err) {
      console.log(err);
      Alert.alert('Logout Failed', 'Could not log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerContainer}>
        <AppBackButton />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: profile.profileImageUrl || profileImage,
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profile.name || 'AutoAssist User'}</Text>
          <Text style={styles.profileSubtitle}>
            {profile.isMember ? profile.membershipPlan : 'Standard Account'}
          </Text>
        </View>

        {/* Personal Details Card */}
        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Personal Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{profile.email || '--'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Active Vehicle</Text>
            <Text style={styles.detailValue}>{profile.vehicle || 'No vehicle added'}</Text>
          </View>
          <View style={profile.isMember ? styles.detailRow : styles.detailRowLast}>
            <Text style={styles.detailLabel}>Registration</Text>
            <Text style={styles.detailValue}>{profile.registrationNumber || 'Not added'}</Text>
          </View>
          {profile.isMember && (
            <View style={styles.detailRowLast}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>{profile.memberSince || '--'}</Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            {actionCards.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleActionPress(action.id)}
                activeOpacity={0.8}
              >
                <Image
  source={{
    uri: actionIcons[action.id as keyof typeof actionIcons],
  }}
  style={styles.actionIcon}
/>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions Section */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleEditProfile} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, loggingOut && { opacity: 0.6 }]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#1e3a8a" />
          ) : (
            <Text style={styles.secondaryButtonText}>Logout</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#60646c',
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    marginBottom: 14,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#e2e5eb',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#60646c',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#e2e5eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#60646c',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionContainer: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e5eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1e3a8a',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '700',
  },
});