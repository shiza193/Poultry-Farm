import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import  Theme from "../../theme/Theme";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
}

const PaginationControls: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onNext,
  onPrev,
  onFirst,
  onLast,
}) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <View style={styles.container}>
      {/* ⏮ First Page */}
      <TouchableOpacity
        disabled={currentPage === 1}
        onPress={onFirst}
        style={[styles.arrowButton, currentPage === 1 && styles.disabled]}
      >
        <Text style={styles.arrowText}>⏮</Text>
      </TouchableOpacity>

      {/* ◀ Prev */}
      <TouchableOpacity
        disabled={currentPage === 1}
        onPress={onPrev}
        style={[styles.arrowButton, currentPage === 1 && styles.disabled]}
      >
        <Text style={styles.arrowText}>◀</Text>
      </TouchableOpacity>

      {/* Page Range Info */}
      <Text style={styles.pageInfo}>{`${start} – ${end} of ${totalItems}`}</Text>

      {/* ▶ Next */}
      <TouchableOpacity
        disabled={currentPage === totalPages}
        onPress={onNext}
        style={[styles.arrowButton, currentPage === totalPages && styles.disabled]}
      >
        <Text style={styles.arrowText}>▶</Text>
      </TouchableOpacity>

      {/* ⏭ Last Page */}
      <TouchableOpacity
        disabled={currentPage === totalPages}
        onPress={onLast}
        style={[styles.arrowButton, currentPage === totalPages && styles.disabled]}
      >
        <Text style={styles.arrowText}>⏭</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.paginationcolor,
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  arrowButton: {
    marginHorizontal: 6,
    paddingHorizontal: 6,
  },
  arrowText: {
    fontSize: 16,
    color: "#000",
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.3,
  },
  pageInfo: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 8,
  },
});

export default PaginationControls;