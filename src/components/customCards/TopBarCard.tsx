import React, { useEffect, useState } from 'react';
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
import { Dropdown } from 'react-native-element-dropdown';

interface Props {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  value?: string | null; // selected BU from parent
  status?: 'active' | 'inactive' | null; // status from parent
  onStatusChange?: (status: 'active' | 'inactive' | null) => void;
  onReset?: () => void;
  onBusinessUnitChange?: (businessUnitId: string | null) => void;
  hideBUDropdown?: boolean;
}

const TopBarCard: React.FC<Props> = ({
  searchValue,
  onSearchChange,
  value: selectedBU,
  status,
  onStatusChange,
  onReset,
  onBusinessUnitChange,
  hideBUDropdown = false,
}) => {
  const [buOpen, setBUOpen] = useState(false);
  const [buValue, setBUValue] = useState<string | null>(selectedBU ?? null);

  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [tempSearch, setTempSearch] = useState(searchValue ?? '');

  useEffect(() => {
    (async () => {
      const units = await getBusinessUnits();
      setItems(
        units.map((u: any) => ({
          label: u.name,
          value: u.businessUnitId,
        })),
      );
    })();
  }, []);

  useEffect(() => {
    setTempSearch(searchValue ?? '');
  }, [searchValue]);

  useEffect(() => {
    setBUValue(selectedBU ?? null);
  }, [selectedBU]);

  const isFilterApplied =
    (selectedBU !== null && !hideBUDropdown) || status !== null;

  const handleStatusPress = () => {
    let next: 'active' | 'inactive' | null;
    if (status === null) next = 'active';
    else if (status === 'active') next = 'inactive';
    else next = 'active';
    onStatusChange?.(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* SEARCH */}
        {/* SEARCH */}
        <View style={[styles.searchBox, hideBUDropdown && { flex: 1 }]}>
          {/* INPUT */}
          <TextInput
            placeholder="Search"
            placeholderTextColor={Theme.colors.grey}
            style={styles.searchInput}
            value={tempSearch}
            onChangeText={setTempSearch}
            onSubmitEditing={() => onSearchChange?.(tempSearch.trim())} // ENTER key triggers search
            returnKeyType="search"
          />

          {/* RIGHT ICONS */}
          <View style={styles.rightIcons}>
            {/* SEARCH ICON */}
            <TouchableOpacity
              onPress={() => onSearchChange?.(tempSearch.trim())}
            >
              <Image source={Theme.icons.search} style={styles.searchIcon} />
            </TouchableOpacity>

            {/* SHOW CLEAR ICON AND SEPARATOR ONLY WHEN TYPING */}
            {tempSearch.length > 0 && (
              <>
                {/* SEPARATOR */}
                <View style={styles.separator} />

                {/* CLEAR ICON */}
                <TouchableOpacity
                  onPress={() => {
                    setTempSearch(''); // clear local input
                    onSearchChange?.(''); // clear parent search
                  }}
                >
                  <Image source={Theme.icons.cross} style={styles.clearIcon} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* BUSINESS UNIT */}
        {!hideBUDropdown && (
          <View style={styles.businessDropdown}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.dropdownText}
              data={items}
              labelField="label"
              valueField="value"
              value={buValue}
              onFocus={() => setBUOpen(true)}
              onBlur={() => setBUOpen(false)}
              onChange={item => {
                setBUValue(item.value);
                onBusinessUnitChange?.(item.value);
              }}
              placeholder="Poultry"
            />
          </View>
        )}
        {/* STATUS */}
        <TouchableOpacity
          style={styles.statusWrapper}
          onPress={handleStatusPress}
        >
          <View
            style={[styles.checkboxBox, status ? styles.checkboxActive : {}]}
          >
            {status && (
              <Text style={styles.checkboxTick}>
                {status === 'active' ? '✓' : '✕'}
              </Text>
            )}
          </View>
          <Text style={styles.activeText}>{status ?? 'Active'}</Text>
        </TouchableOpacity>
      </View>
      {/* RESET */}
      {isFilterApplied && (
        <View style={styles.row2}>
          <TouchableOpacity
            onPress={() => {
              onBusinessUnitChange?.(null);
              onStatusChange?.(null);
              onReset?.();
            }}
          >
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
export default TopBarCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.white,
    padding: 12,
    zIndex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  placeholderStyle: {
    fontSize: 12,
    color: Theme.colors.textPrimary,
  },
  dropdownText: {
    fontSize: 10,
    color: Theme.colors.textPrimary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row2: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' },
  searchBox: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 15, paddingHorizontal: 8 },
  searchIcon: { width: 20, height: 20, tintColor: Theme.colors.success },
  clearIcon: { width: 20, height: 20, tintColor: Theme.colors.success },
  businessDropdown: { width: 90, zIndex: 2000 },

  dropdownContainer: { borderRadius: 8, borderColor: Theme.colors.success },
  statusWrapper: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: Theme.colors.success,
    marginHorizontal: 6,
    opacity: 0.5,
  },

  checkboxActive: { backgroundColor: Theme.colors.success },
  checkboxTick: { color: Theme.colors.white, fontSize: 12, fontWeight: 'bold' },
  activeText: { fontSize: 13, color: Theme.colors.textPrimary },
  resetText: { color: Theme.colors.error, fontWeight: '600', fontSize: 13 },
});
