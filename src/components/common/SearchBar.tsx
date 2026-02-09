import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
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

  return (
    <View style={styles.container}>
      
      {/* LEFT SEARCH ICON */}
      <TouchableOpacity onPress={() => onSearch(tempSearch)}>
        <Image source={Theme.icons.search} style={styles.icon} />
      </TouchableOpacity>

      {/* INPUT */}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.textSecondary}
        value={tempSearch}
        onChangeText={setTempSearch}
        style={styles.input}
      />

      {/* RIGHT CLEAR ICON */}
      {tempSearch.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setTempSearch("");
            onSearch("");
          }}
        >
          <Image source={Theme.icons.cross} style={styles.crossicon} />
        </TouchableOpacity>
      )}
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
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: Theme.colors.white,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.black,
    paddingHorizontal: 8, // space between text & icons
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: Theme.colors.success,
  },
    crossicon: {
    width: 18,
    height: 15,
    tintColor: Theme.colors.success,
  },
});
