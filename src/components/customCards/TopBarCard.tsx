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
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  value?: string | null;
  status?: 'active' | 'inactive' | null;
  onStatusChange?: (status: 'active' | 'inactive' | null) => void;
  onReset?: () => void;
  onBusinessUnitChange?: (businessUnitId: string | null) => void;
  hideBUDropdown?: boolean;
}

const TopBarCard: React.FC<Props> = ({
  searchValue,
  onSearchChange,
  value: selectedBU,
  status = null,
  onStatusChange,
  onReset,
  onBusinessUnitChange,
  hideBUDropdown = false,
}) => {
  /* ================= Business Unit ================= */
  const [buOpen, setBUOpen] = useState(false);
  const [buValue, setBUValue] = useState<string | null>(selectedBU ?? null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [tempSearch, setTempSearch] = useState(searchValue ?? '');

  /* ================= Status Logic =================
     null      → sirf "Active" text (not selected)
     'active'  → Active selected
     'inactive'→ Inactive selected
  */
  const [statusState, setStatusState] = useState<'active' | 'inactive' | null>(
    status,
  );

  /* ================= Fetch BUs ================= */
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
    setBUValue(selectedBU ?? null);
  }, [selectedBU]);

  const isFilterApplied =
    (buValue !== null && !hideBUDropdown) ||
    statusState !== null;

  /* ================= Status Toggle ================= */
  const handleStatusPress = () => {
    setStatusState(prev => {
      let next: 'active' | 'inactive';

      if (prev === null) next = 'active';
      else if (prev === 'active') next = 'inactive';
      else next = 'active';

      onStatusChange?.(next);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {/* ===== TOP ROW ===== */}
      <View style={styles.row}>
        {/* SEARCH (LONGER) */}
        <View
          style={[
            styles.searchBox,
            hideBUDropdown && { flex: 1 }, // dynamically override flex if dropdown hidden
          ]}
        >
          <TextInput
            placeholder="Search"
            placeholderTextColor={Theme.colors.grey}
            style={styles.searchInput}
            value={tempSearch}
            onChangeText={setTempSearch}
          />

          {tempSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setTempSearch('');
                onSearchChange?.('');
              }}
            >
              <Image source={Theme.icons.close1} style={styles.clearIcon} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => onSearchChange?.(tempSearch)}>
            <Image source={Theme.icons.search} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>

        {/* BUSINESS UNIT (SMALLER) */}
        {/* BUSINESS UNIT (SMALLER) */}
        {!hideBUDropdown && (
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
              placeholder="Poultry"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
            />
          </View>
        )}

        {/* STATUS */}
        <TouchableOpacity
          style={styles.statusWrapper}
          onPress={handleStatusPress}
        >
          <View
            style={[styles.checkboxBox, statusState && styles.checkboxActive]}
          >
            {statusState && (
              <Text style={styles.checkboxTick}>
                {statusState === 'active' ? '✓' : '✕'}
              </Text>
            )}
          </View>

          <Text style={styles.activeText}>{statusState ?? 'Active'}</Text>
        </TouchableOpacity>
      </View>

      {/* ===== RESET ===== */}
      {isFilterApplied && (
        <View style={styles.row2}>
          <TouchableOpacity
            onPress={() => {

              setBUValue(hideBUDropdown ? buValue : null);
              setStatusState(null);
              onReset?.();

              if (!hideBUDropdown) onBusinessUnitChange?.(null);
              onStatusChange?.(null);
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
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  row2: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  /* SEARCH */
  searchBox: {
    flex: 2, // increased from 1.4 → makes search bar wider
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 15 },
  searchIcon: { width: 22, height: 22, tintColor: Theme.colors.success },
  clearIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: Theme.colors.success,
  },

  /* DROPDOWN */
  businessDropdown: { width: 90, zIndex: 2000 }, // decreased from 110 → smaller dropdown
  dropdown: {
    borderColor: Theme.colors.success,
    borderRadius: 8,
    minHeight: 42,
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: Theme.colors.success,
  },
  dropdownText: { fontSize: 12 },

  /* STATUS */
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  checkboxActive: {
    backgroundColor: Theme.colors.success,
  },
  checkboxTick: {
    color: Theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeText: {
    fontSize: 13,
    color: Theme.colors.textPrimary,
  },

  /* RESET */
  resetText: {
    color: Theme.colors.error,
    fontWeight: '600',
    fontSize: 13,
  },
});
