import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Theme from "../../theme/Theme";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  initialValue = "",
}) => {
  const [tempSearch, setTempSearch] = useState(initialValue);

  const handleSearch = () => {
    onSearch(tempSearch.trim());
  };

  const handleClear = () => {
    setTempSearch("");
    onSearch("");
  };

  return (
    <View style={styles.container}>
      {/* INPUT */}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.textSecondary}
        value={tempSearch}
        onChangeText={setTempSearch}
        onSubmitEditing={handleSearch} // ENTER PRESS SEARCH
        returnKeyType="search"
        style={styles.input}
      />

      {/* RIGHT ICONS */}
      <View style={styles.rightIcons}>
        {/* SEARCH ICON (always visible) */}
        <TouchableOpacity onPress={handleSearch}>
          <Image source={Theme.icons.search} style={styles.icon} />
        </TouchableOpacity>

        {/* SHOW ONLY WHEN USER TYPES */}
        {tempSearch.length > 0 && (
          <>
            {/* SEPARATOR */}
            <View style={styles.separator} />

            {/* CLEAR ICON */}
            <TouchableOpacity onPress={handleClear}>
              <Image source={Theme.icons.cross} style={styles.icon} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    height: 42,
    backgroundColor: Theme.colors.white,
    paddingLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.black,
    paddingRight: 10,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: Theme.colors.success,
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: Theme.colors.success,
    marginHorizontal: 8,
    opacity: 0.5,
  },
});
