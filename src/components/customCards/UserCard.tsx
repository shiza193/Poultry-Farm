import React from 'react';
import { Dimensions } from 'react-native';

import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';

type User = {
  id: string;
  image: string;
  name: string;
  email: string;
  isActive: boolean;
};

type Action = {
  image: string;
  onPress: () => void;
  backgroundColor: string;
};

interface UserRowProps {
  user: User;
  onPressName?: () => void;
  onToggleStatus?: () => void;
  actions?: Action[];
  onPressDelete?: () => void; 

  onResetPassword?: () => void; 
}

const { width } = Dimensions.get('window');
const UserCard = ({
  user,
  onPressName,
  onToggleStatus,
  actions,
  onResetPassword,
  onPressDelete, 
}: UserRowProps) => {
  const defaultActions: Action[] = [
    
    {
      image: 'https://cdn-icons-png.flaticon.com/512/992/992651.png',
      onPress: () => console.log('Add'),
      backgroundColor:Theme.colors.secondaryYellow,
    },
   
  ];

  return (
    <View style={styles.card}>
      <View style={styles.topRightToggle}>
        <TouchableOpacity
          style={[
            styles.toggleBtnSmall,
            user.isActive
              ? { backgroundColor:Theme.colors.secondaryYellow }
              : { backgroundColor: '#fff' },
            { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
          ]}
          onPress={onToggleStatus}
        >
          <Text
            style={[
              styles.toggleTextSmall,
              { color: user.isActive ? '#fff' : '#333' },
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtnSmall,
            !user.isActive
              ? { backgroundColor: '#9e9e9e' }
              : { backgroundColor: '#fff' },
            { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
          ]}
          onPress={onToggleStatus}
        >
          <Text
            style={[
              styles.toggleTextSmall,
              { color: !user.isActive ? '#fff' : '#333' },
            ]}
          >
            Inactive
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <TouchableOpacity onPress={onPressName} style={styles.userInfoRow}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri:
                user.image ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.avatar}
          />
          <View style={styles.iconOverlay}>
            <Image
              source={{
                uri: 'https://i.pinimg.com/1200x/08/a7/4d/08a74dfad26fee01049ad9b621962542.jpg',
              }}
              style={styles.overlayIcon}
            />
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {user.name}
          </Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {user.email}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        {/* Icons with label on top */}
        <View style={{ alignItems: 'flex-start' }}>
          {/* Single label above icons */}
          <Text style={styles.singleActionLabel}>Assign PoultryFarm</Text>

          {/* Icons row */}
          <View style={{ flexDirection: 'row', marginTop: 4, marginLeft: -6 }}>
            {(actions || defaultActions).map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: action.backgroundColor,
                    marginHorizontal: 3,
                  },
                ]}
                onPress={action.onPress}
              >
                <Image
                  source={{ uri: action.image }}
                  style={[styles.actionImg, { tintColor: '#fff' }]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Right side buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.resetBtn, styles.deleteBtn]}
            onPress={onPressDelete} 
          >
            <Text style={[styles.resetText, { color: 'red' }]}>Delete 🗑️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetBtn, styles.resetBtnPrimary]}
            onPress={onResetPassword}
          >
            <Text style={styles.resetText}>Reset 🔑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UserCard;

const styles = StyleSheet.create({
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: 90, 
  },

  avatar: {
    width: 67,
    height: 67,
    borderRadius: 35,
  },

  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 25,
    height: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayIcon: {
    width: 28, // icon bhi bada
    height: 28,
    resizeMode: 'contain',
  },

  userInfo: {
    marginLeft: 12,
    flex: 1,
    overflow: 'hidden',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },

  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },

  email: {
    fontSize: 14,
    color: '#007BFF',
    flexShrink: 1,
  },

  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },

  deleteBtn: {
    backgroundColor: '#fde2e2',
  },

  resetBtnPrimary: {
    backgroundColor: '#ffe0e0',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  singleActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },

  // Top-right toggle
  topRightToggle: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
    right: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
    zIndex: 10,
  },
  actionLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },

  toggleBtnSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextSmall: { fontWeight: '600', fontSize: 11 },

  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  actionImg: { width: 20, height: 20, resizeMode: 'contain' },
  resetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
  },
  resetText: { color: 'red', fontSize: 13, fontWeight: '600' },
});