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
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  status?: 'all' | 'active' | 'inactive';
  onStatusChange?: (status: 'all' | 'active' | 'inactive') => void;
  onReset?: () => void;
}

const TopBarCard: React.FC<Props> = ({
  onAddPress,
  searchValue,
  onSearchChange,
  status = 'all',
  onStatusChange,
  onReset,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [statusOpen, setStatusOpen] = useState(false);

  const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      const units = await getBusinessUnits();
      if (units && Array.isArray(units)) {
        setItems(
          units.map((u: any) => ({ label: u.name, value: u.businessUnitId })),
        );
      }
    };
    fetchBusinessUnits();
  }, []);

  return (
    <View style={styles.container}>
      {/* ===== ROW 1: SEARCH + BUSINESS DROPDOWN ===== */}
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

 {/* ===== ROW 2: ADD + STATUS DROPDOWN + RESET ===== */}
<View style={styles.row2}>
  {/* Add New Button - always first */}
  <View style={styles.businessDropdown}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            listMode="SCROLLVIEW"
            dropDownDirection="BOTTOM"
            placeholder="Poultry Farm"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            ArrowDownIconComponent={() => (
              <Image source={Theme.icons.dropdown} style={styles.dropdownIcon} />
            )}
            ArrowUpIconComponent={() => (
              <Image
                source={Theme.icons.dropdown}
                style={[styles.dropdownIcon, { transform: [{ rotate: '180deg' }] }]}
              />
            )}
          />
        </View>

  {/* Status Dropdown */}
  <View style={styles.statusDropdown}>
    <DropDownPicker
      open={statusOpen}
      value={status === 'all' ? null : status}
      items={statusItems}
      setOpen={setStatusOpen}
      setValue={(val) => {
        if (val === null) {
          onStatusChange?.('all');
          setValue(null);
        } else {
          onStatusChange?.(val as unknown as 'active' | 'inactive');
          setValue(val);
        }
      }}
      placeholder="Status"
      listMode="SCROLLVIEW"
      style={styles.dropdown}
      dropDownContainerStyle={styles.dropdownContainer}
      textStyle={styles.dropdownText}
      ArrowDownIconComponent={() => (
        <Image source={Theme.icons.dropdown} style={styles.dropdownIcon} />
      )}
      ArrowUpIconComponent={() => (
        <Image
          source={Theme.icons.dropdown}
          style={[styles.dropdownIcon, { transform: [{ rotate: '180deg' }] }]}
        />
      )}
    />
  </View>

  {/* Reset Button */}
  {status !== 'all' && (
    <TouchableOpacity style={styles.resetButton} onPress={onReset}>
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

  row2: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

addButton: {
  paddingHorizontal: 14,
  paddingVertical: 10,
  backgroundColor: Theme.colors.primaryYellow,
  borderRadius: 8,
  justifyContent: 'center',
},

statusDropdown: {
  width: 120,
  zIndex: 1500,
  marginLeft: 20, 
},

resetButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  justifyContent: 'center',
  marginLeft: 'auto', 
},

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },

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

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.textPrimary,
  },

  businessDropdown: {
    width: 140,
    zIndex: 2000,
  },

 

  dropdown: {
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    minHeight: 40,
  },

  dropdownContainer: {
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
  },

  dropdownText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },

  dropdownIcon: {
    width: 12,
    height: 12,
    tintColor: Theme.colors.grey,
  },

 

  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color:Theme.colors.error,
  },


  addText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.white,
  },
});
