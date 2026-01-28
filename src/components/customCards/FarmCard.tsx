import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Theme from '../../theme/Theme';

interface FarmCardProps {
  image: any;
  title: string;
  location: string;
  users: number;
  employees: number;
  onUserCountPress?: () => void;
  onEmployeeCountPress?: () => void;
  onAddUser?: () => void;
  onAddEmployee?: () => void;

  onPressTitle?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

const FarmCard: React.FC<FarmCardProps> = ({
  image,
  title,
  location,
  users,
  employees,
  onAddUser,
  onAddEmployee,
  onUserCountPress,
  onEmployeeCountPress,
  onPressTitle,
  onEdit,
  onDelete,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <Image source={image} style={styles.image} />

      {/* DETAILS */}
      <View style={styles.details}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onPressTitle} style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </TouchableOpacity>

          {/* 3 DOT MENU */}

          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={() => setMenuVisible(prev => !prev)}
              style={styles.dotsWrapper}
            >
              <Image source={Theme.icons.dots} style={styles.dotsIcon} />
            </TouchableOpacity>

            {menuVisible && (
              <TouchableOpacity
                style={styles.menuOverlay}
                activeOpacity={1}
                onPress={() => setMenuVisible(false)}
              >
                <View style={styles.menu}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onEdit && onEdit();
                    }}
                  >
                    <Text style={styles.menuText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, styles.deleteItem]}
                    onPress={() => {
                      setMenuVisible(false);
                      onDelete();
                    }}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* LOCATION */}
        <View style={styles.locationRow}>
          <Image source={Theme.icons.location1} style={styles.locationIcon} />
          <Text style={styles.location}>{location}</Text>
        </View>

        {/* COUNTS */}
        <View style={styles.statsRow}>
          {/* USERS */}
          <View style={styles.statBox}>
            {/* LABEL — TOUCHABLE */}
            <TouchableOpacity onPress={onUserCountPress} activeOpacity={0.7}>
              <Text style={styles.statLabel}>TOTAL USERS</Text>
            </TouchableOpacity>

            {/* ICON + COUNT — TOUCHABLE */}
            <TouchableOpacity
              style={styles.statContent}
              onPress={onUserCountPress}
              activeOpacity={0.7}
            >
              <View style={styles.greenCircle}>
                <Image source={Theme.icons.user} style={styles.statIcon} />
              </View>
              <Text style={styles.statValue}>{users}</Text>
            </TouchableOpacity>

            {/* ADD BUTTON — SAME */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddUser}
              activeOpacity={0.7}
            >
              <View style={styles.addContent}>
                <Image source={Theme.icons.add} style={styles.addIcon} />
                <Text style={styles.addText}>Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* EMPLOYEES */}
          <View style={styles.statBox}>
            <TouchableOpacity
              onPress={onEmployeeCountPress}
              activeOpacity={0.7}
            >
              <Text style={styles.statLabel}>TOTAL EMPLOYEES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statContent}
              onPress={onEmployeeCountPress}
              activeOpacity={0.7}
            >
              <View style={styles.orangeCircle}>
                <Image source={Theme.icons.employee} style={styles.statIcon} />
              </View>
              <Text style={styles.statValue}>{employees}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddEmployee}
              activeOpacity={0.7}
            >
              <View style={styles.addContent}>
                <Image source={Theme.icons.add} style={styles.addIcon} />
                <Text style={styles.addText}>Add</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FarmCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 16,
    overflow: 'hidden',
    elevation: 5,
  },

  image: {
    width: 120,
    height: '100%',
  },

  details: {
    flex: 1,
    padding: 14,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },

  dotsWrapper: {
    padding: 6,
  },

  dotsIcon: {
    width: 22,
    height: 22,
    tintColor: Theme.colors.textPrimary,
  },
  menuOverlay: {
  position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },

  menu: {
    position: 'absolute',
    top: 28,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 6,
    width: 80,
    zIndex: 100,
  },

  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 9,
  },

  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },

  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  locationIcon: {
    width: 14,
    height: 14,
    tintColor: Theme.colors.primaryYellow,
    marginRight: 4,
  },

  location: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  statBox: {
    width: '48%',
    backgroundColor: '#e9e9e9',
    borderRadius: 12,
    padding: 4,
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },

  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  greenCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  orangeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statIcon: {
    width: 14,
    height: 14,
    tintColor: Theme.colors.buttonPrimary,
  },

  addButton: {
    marginTop: 7,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 2,
    backgroundColor: Theme.colors.secondaryYellow,

    borderWidth: 2,
    borderColor: Theme.colors.secondaryYellow,
  },
  addContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addIcon: {
    width: 14,
    height: 14,
    tintColor: Theme.colors.white,
    marginRight: 6,
  },

  addText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.white,
  },
});
