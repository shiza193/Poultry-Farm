import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Theme from '../../theme/Theme';

interface FarmCardProps {
  image: any;
  title: string;
  location: string;
  users: number;
  employees: number;
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
  onPressTitle,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      {/* ===== LEFT IMAGE (FULL HEIGHT) ===== */}
      <Image source={image} style={styles.image} />

      {/* ===== RIGHT DETAILS ===== */}
      <View style={styles.details}>
        {/* HEADER: TITLE + ACTION ICONS */}
        <View style={styles.headerRow}>
          {/* ===== TITLE ===== */}
          <TouchableOpacity onPress={onPressTitle} style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </TouchableOpacity>

          {/* ===== ACTION ICONS ===== */}
          <View style={styles.actionIcons}>
            {/* ===== EDIT ICON ===== */}
            <TouchableOpacity
              style={[styles.iconWrapper, { backgroundColor: '#E5F8FF' }]}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Image
                source={Theme.icons.edit}
                style={[
                  styles.actionImage,
                  { tintColor: Theme.colors.textPrimary },
                ]}
              />
            </TouchableOpacity>

            {/* ===== DELETE ICON ===== */}
            <TouchableOpacity
              style={[styles.iconWrapper, { backgroundColor: '#FDE2E2' }]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Image
                source={Theme.icons.bin}
                style={[styles.actionImage, { tintColor: '#DC2626' }]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOCATION */}
        <View style={styles.locationRow}>
          <Image source={Theme.icons.location1} style={styles.locationIcon} />
          <Text style={styles.location}>{location}</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={onAddUser}
            activeOpacity={0.7}
          >
            <Text style={styles.statLabel}>TOTAL USERS</Text>
            <View style={styles.statRow}>
              <View style={styles.iconCircleGreen}>
                <Image source={Theme.icons.user} style={styles.statIcon} />
              </View>
              <Text style={styles.statValue}>{users}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={onAddEmployee}
            activeOpacity={0.7}
          >
            <Text style={styles.statLabel}>EMPLOYEES</Text>
            <View style={styles.statRow}>
              <View style={styles.iconCircleOrange}>
                <Image source={Theme.icons.employee} style={styles.statIcon} />
              </View>
              <Text style={styles.statValue}>{employees}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={onAddUser}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.buttonText}>Add User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={onAddEmployee}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.buttonText}>Add Employee</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FarmCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: 18,
    marginVertical: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  image: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },

  details: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },

  actionIcons: {
    flexDirection: 'row',
  },

  iconWrapper: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 6,
  },

  actionImage: {
    width: 22,
    height: 22,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  locationIcon: {
    width: 16,
    height: 16,
    tintColor: Theme.colors.primaryYellow,
    marginRight: 6,
  },

  location: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  statItem: {
    width: '48%',
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#F9F9F9',
  },

  statLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Theme.colors.black,
    marginBottom: 4,
  },

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginLeft: 8,
  },

  iconCircleGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E7F8EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  iconCircleOrange: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  statIcon: {
    width: 14,
    height: 14,
    tintColor: Theme.colors.textSecondary,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.secondaryYellow,
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '48%',
    justifyContent: 'center',
  },

  plus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.secondaryYellow,
    marginRight: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
});
