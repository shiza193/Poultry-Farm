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
  value?: string | null; // Business Unit
  status?: 'all' | 'active' | 'inactive';
  onStatusChange?: (status: 'all' | 'active' | 'inactive') => void;
  onReset?: () => void;
  onBusinessUnitChange?: (businessUnitId: string | null) => void;
}

const TopBarCard: React.FC<Props> = ({
  searchValue,
  onSearchChange,
  value: selectedBU,
  status = 'all',
  onStatusChange,
  onReset,
  onBusinessUnitChange,
}) => {
  // ===== Business Unit =====
  const [buOpen, setBUOpen] = useState(false);
  const [buValue, setBUValue] = useState<string | null>(selectedBU ?? null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [tempSearch, setTempSearch] = useState(searchValue ?? '');

  // ===== Active Filter =====
  const [activeState, setActiveState] = useState<boolean | null>(
    status === 'all' ? null : status === 'active',
  );

  // Fetch Business Units
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

  // Sync from parent
  useEffect(() => {
    setBUValue(selectedBU ?? null);
  }, [selectedBU]);

  useEffect(() => {
    setActiveState(status === 'all' ? null : status === 'active');
  }, [status]);

  const isFilterApplied =
    buValue !== null || activeState !== null || !!searchValue;

  return (
    <View style={styles.container}>
      {/* ===== TOP ROW: Search + BU + Active ===== */}
      <View style={styles.row}>
        {/* SEARCH */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search"
            placeholderTextColor={Theme.colors.grey}
            style={styles.searchInput}
            value={tempSearch}
            onChangeText={setTempSearch}
          />

          {/* Clear button */}
          {tempSearch?.length ? (
            <TouchableOpacity
              onPress={() => {
                setTempSearch('');
                onSearchChange?.('');
              }}
            >
              <Image source={Theme.icons.close1} style={styles.clearIcon} />
            </TouchableOpacity>
          ) : null}

          {/* Search icon */}
          <TouchableOpacity
            onPress={() => {
              onSearchChange?.(tempSearch); // trigger search only on icon press
            }}
          >
            <Image source={Theme.icons.search} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>

        {/* BUSINESS UNIT */}
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
            placeholder="Poultry Farm"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
          />
        </View>

        {/* ACTIVE / INACTIVE TOGGLE */}
        <TouchableOpacity
          style={styles.activeCheckboxWrapper}
          onPress={() => {
            setActiveState(prev => {
              const next = prev === null ? true : prev === true ? false : null;

              if (next === null) onStatusChange?.('all');
              else onStatusChange?.(next ? 'active' : 'inactive');

              return next;
            });
          }}
        >
          <View
            style={[
              styles.checkboxBox,
              activeState !== null && styles.checkboxActive,
            ]}
          >
            {activeState !== null && (
              <Text style={styles.checkboxTick}>{activeState ? '✓' : '✕'}</Text>
            )}
          </View>

          <Text style={styles.activeText}>
            {activeState === null ? 'All' : activeState ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== SECOND ROW: RESET BUTTON ===== */}
      {isFilterApplied && (
        <View style={styles.row2}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setBUValue(null);
              setActiveState(null);
              onReset?.();
              onStatusChange?.('all');
              onBusinessUnitChange?.(null);
              onSearchChange?.('');
            }}
          >
            <Text style={styles.resetText}>Reset</Text>
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
    gap: 10,
  },

  row2: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 15 },
  searchIcon: { width: 24, height: 24, tintColor: Theme.colors.success },
  clearIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    tintColor: Theme.colors.success,
  },

  businessDropdown: { width: 130, zIndex: 2000 },

  dropdown: {
    borderColor: Theme.colors.success,
    borderRadius: 8,
    minHeight: 42,
    backgroundColor: Theme.colors.white,
  },
  dropdownContainer: {
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.success,
  },
  dropdownText: { fontSize: 13, color: Theme.colors.success },

  activeCheckboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  resetButton: {},
  resetText: {
    color: Theme.colors.error,
    fontWeight: '600',
    fontSize: 13,
  },
});
