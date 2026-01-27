import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Theme from '../../theme/Theme';
import { getBusinessUnits } from '../../services/BusinessUnit';

interface Props {
  onAddPress?: () => void;
  value?: string | null; // Business Unit
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  status?: 'all' | 'active' | 'inactive';
  onStatusChange?: (status: 'all' | 'active' | 'inactive') => void;
  onReset?: () => void;
  onBusinessUnitChange?: (businessUnitId: string | null) => void;
}

const TopBarCard: React.FC<Props> = ({
  onAddPress,
  searchValue,
  onSearchChange,
  status = 'all',
  onStatusChange,
  onReset,
  onBusinessUnitChange,
  value: selectedBU,
}) => {
  // ===== Business Unit Dropdown =====
  const [buOpen, setBUOpen] = useState(false);
  const [buValue, setBUValue] = useState<string | null>(selectedBU ?? null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  // ===== Status Dropdown =====
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState<'active' | 'inactive' | null>(
    status === 'all' ? null : status,
  );

  const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  // Fetch Business Units
  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const units = await getBusinessUnits();
        if (units && Array.isArray(units)) {
          setItems(
            units.map(u => ({ label: u.name, value: u.businessUnitId })),
          );
        }
      } catch (error) {
        console.warn('Failed to fetch business units', error);
      }
    };
    fetchBusinessUnits();
  }, []);

  // Update BU state when parent changes
  useEffect(() => {
    setBUValue(selectedBU ?? null);
  }, [selectedBU]);

  // Update status state when parent changes
  useEffect(() => {
    setStatusValue(status === 'all' ? null : status);
  }, [status]);

  return (
    <View style={styles.container}>
      {/* ROW 1: SEARCH + ADD */}
      <View style={styles.row}>
        <View style={styles.searchBox}>
          <Image source={Theme.icons.search} style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={Theme.colors.grey}
            style={styles.searchInput}
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* ROW 2: BUSINESS UNIT + STATUS + RESET */}
      <View style={styles.row2}>
        {/* Business Unit Dropdown */}
        <View style={styles.businessDropdown}>
          <DropDownPicker
            open={buOpen}
            value={buValue}
            items={items}
            setOpen={setBUOpen}
            setValue={val => {
              const selected = val as unknown as string | null;
              setBUValue(selected);
              onBusinessUnitChange?.(selected);
            }}
            setItems={setItems}
            listMode="SCROLLVIEW"
            placeholder="Poultry Farm"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            ArrowDownIconComponent={() => (
              <Image
                source={Theme.icons.dropdown}
                style={styles.dropdownIcon}
              />
            )}
            ArrowUpIconComponent={() => (
              <Image
                source={Theme.icons.dropdown}
                style={[
                  styles.dropdownIcon,
                  { transform: [{ rotate: '180deg' }] },
                ]}
              />
            )}
          />
        </View>

        {/* Status Dropdown */}
        <View style={styles.statusDropdown}>
          <DropDownPicker
            open={statusOpen}
            value={statusValue}
            items={statusItems}
            setOpen={setStatusOpen}
            setValue={val => {
              const selected = val as unknown as 'active' | 'inactive' | null;
              setStatusValue(selected);
              if (selected === null) onStatusChange?.('all');
              else onStatusChange?.(selected);
            }}
            listMode="SCROLLVIEW"
            placeholder="Status"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            ArrowDownIconComponent={() => (
              <Image
                source={Theme.icons.dropdown}
                style={styles.dropdownIcon}
              />
            )}
            ArrowUpIconComponent={() => (
              <Image
                source={Theme.icons.dropdown}
                style={[
                  styles.dropdownIcon,
                  { transform: [{ rotate: '180deg' }] },
                ]}
              />
            )}
          />
        </View>

        {/* Reset Button */}
        {(statusValue !== null || buValue !== null) && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              onReset?.();
              setBUValue(null);
              setStatusValue(null);
            }}
          >
            <Text style={styles.resetText}>Reset Filter</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TopBarCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    height: 40,
  },
  searchIcon: {
    width: 16,
    height: 16,
    tintColor: Theme.colors.grey,
    marginRight: 6,
  },
  searchInput: { flex: 1, fontSize: 14, color: Theme.colors.textPrimary },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Theme.colors.primaryYellow,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addText: { fontSize: 14, fontWeight: '700', color: Theme.colors.white },
  businessDropdown: { width: 140, zIndex: 2000 },
  statusDropdown: { width: 120, zIndex: 1500, marginLeft: 20 },
  dropdown: {
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    minHeight: 40,
  },
  dropdownContainer: { borderColor: Theme.colors.borderLight, borderRadius: 8 },
  dropdownText: { fontSize: 13, color: Theme.colors.textSecondary },
  dropdownIcon: { width: 12, height: 12, tintColor: Theme.colors.grey },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  resetText: { fontSize: 15, fontWeight: '600', color: Theme.colors.error },
});
