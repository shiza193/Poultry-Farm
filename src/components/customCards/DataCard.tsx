import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useRef, useState } from "react";
import Theme from "../../theme/Theme";

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  render?: (value: any, row: any) => React.ReactNode;
  isTitle?: boolean;
  titleColor?: string;

  showDots?: boolean;
  onDotsPress?: (row: any) => void;
}

interface DataCardProps {
  columns: TableColumn[];
  data: any[];
  itemsPerPage?: number;
  onRowPress?: (row: any) => void;
  showActions?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

const DataCard: React.FC<DataCardProps> = ({
  columns,
  data,
  onRowPress,
  itemsPerPage = 10,
  showActions = false,
  onEdit,
  onDelete
}) => {
  const [activePage, setActivePage] = useState(1);

  const totalRecords = data.length;
  const totalPages = Math.max(Math.ceil(totalRecords / itemsPerPage), 1);

  const paginatedData = data.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const isFirstPage = activePage === 1;
  const isLastPage = activePage === totalPages;

  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(1);
  const [containerWidth, setContainerWidth] = useState(1);

  const thumbWidth = Math.max(
    (containerWidth / contentWidth) * containerWidth,
    40
  );
  const thumbTranslateX =
    (scrollX / (contentWidth - containerWidth)) *
    (containerWidth - thumbWidth);

  return (
    <View>
      {/* ===== TABLE SCROLL ===== */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        onContentSizeChange={(w) => setContentWidth(w)}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View>
          {/* ===== HEADER ===== */}
          <View style={styles.headerRow}>
            {/* DOTS HEADER (EMPTY) */}
            {columns.some(c => c.showDots) && (
              <Text style={[styles.headerCell, { width: 50 }]} />
            )}

            {columns.map(col => (
              <Text
                key={col.key}
                style={[styles.headerCell, { width: col.width || 120 }]}
              >
                {col.title}
              </Text>
            ))}

            {showActions && (
              <Text style={[styles.headerCell, { width: 100 }]}>
                Actions
              </Text>
            )}
          </View>
          {/* ===== ROWS ===== */}
          {paginatedData.length === 0 ? (
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingVertical: 50,
                paddingLeft: 100,
                width: columns.reduce(
                  (sum, c) => sum + (c.width || 120),
                  0
                ),
              }}
            >
              <Image
                source={Theme.icons.nodata}
                style={{ width: 150, height: 150, resizeMode: "contain" }}
              />
            </View>
          ) : (
            paginatedData.map((row, index) => {
              const RowWrapper = onRowPress ? TouchableOpacity : View;

              return (
                <RowWrapper
                  key={index}
                  style={styles.dataRow}
                  onPress={() => onRowPress?.(row)}
                  activeOpacity={0.7}
                >
                  {/* ===== DOTS COLUMN (SAB SE PEHLE) ===== */}
                  {columns.some(c => c.showDots) && (
                    <View
                      style={[
                        styles.dataCell,
                        {
                          width: 50,
                          alignItems: "center",
                          justifyContent: "center",
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          columns.find(c => c.showDots)?.onDotsPress?.(row)
                        }
                        activeOpacity={0.6}
                      >
                        <Image
                          source={Theme.icons.dots}
                          style={{ width: 20, height: 20, }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* ===== NORMAL COLUMNS ===== */}
                  {columns.map(col => {
                    const value = row[col.key];

                    return (
                      <View
                        key={col.key}
                        style={[
                          styles.dataCell,
                          {
                            width: col.width || 120,
                            flexDirection: "row",
                            alignItems: "center",
                          },
                        ]}
                      >
                        {col.render ? (
                          col.render(value, row)
                        ) : col.isTitle ? (
                          <Text
                            style={[
                              styles.titleText,
                              {
                                color: col.titleColor || styles.titleText.color,
                              },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {value ?? "—"}
                          </Text>
                        ) : (
                          <Text
                            style={styles.cellText}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {value ?? "—"}
                          </Text>
                        )}
                      </View>
                    );
                  })}

                  {/* ===== ACTIONS (AGAR HAIN) ===== */}
                  {showActions && (
                    <View
                      style={[
                        styles.dataCell,
                        {
                          width: 100,
                          flexDirection: "row",
                          justifyContent: "space-around",
                        },
                      ]}
                    >
                      {onEdit && (
                        <TouchableOpacity onPress={() => onEdit(row)}>
                          <Image
                            source={Theme.icons.edit}
                            style={{ width: 18, height: 18 }}
                          />
                        </TouchableOpacity>
                      )}

                      {onDelete && (
                        <TouchableOpacity onPress={() => onDelete(row)}>
                          <Image
                            source={Theme.icons.delete}
                            style={{ width: 18, height: 18 }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </RowWrapper>

              );
            })
          )}
        </View>
      </ScrollView>

      {/* ===== CUSTOM SCROLL BAR ===== */}
      <View style={styles.scrollBarTrack}>
        <View
          style={[
            styles.scrollBarThumb,
            {
              width: thumbWidth,
              transform: [
                { translateX: isNaN(thumbTranslateX) ? 0 : thumbTranslateX },
              ],
            },
          ]}
        />
      </View>

      {/* ===== PAGINATION ===== */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          disabled={isFirstPage}
          onPress={() => setActivePage(1)}
          style={[styles.pageButton, isFirstPage && styles.disabled]}
        >
          <Text style={styles.pageText}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isFirstPage}
          onPress={() => setActivePage(activePage - 1)}
          style={[styles.pageButton, isFirstPage && styles.disabled]}
        >
          <Text style={styles.pageText}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          {`${(activePage - 1) * itemsPerPage + 1} – ${Math.min(
            activePage * itemsPerPage,
            totalRecords
          )} of ${totalRecords}`}
        </Text>

        <TouchableOpacity
          disabled={isLastPage}
          onPress={() => setActivePage(activePage + 1)}
          style={[styles.pageButton, isLastPage && styles.disabled]}
        >
          <Text style={styles.pageText}>▶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isLastPage}
          onPress={() => setActivePage(totalPages)}
          style={[styles.pageButton, isLastPage && styles.disabled]}
        >
          <Text style={styles.pageText}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DataCard;


const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    backgroundColor: Theme.colors.buttonPrimary,
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: {
    color: Theme.colors.black,
    fontWeight: "700",
    fontSize: 13,
    textAlign: "left",
    paddingHorizontal: 6,
  },
  dataRow: {
    flexDirection: "row",
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderColor,
    paddingVertical: 10,
  },
  dataCell: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 6,
  },
  cellText: {
    fontSize: 13,
    color: Theme.colors.black,
    textAlign: "left",

  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: Theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.colors.black,
    textAlign: "center",
  },
  lastHeader: {
    flexDirection: "row",
    backgroundColor: Theme.colors.lightGrey,
    paddingVertical: 13,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  scrollBarTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  scrollBarThumb: {
    height: "100%",
    backgroundColor: Theme.colors.buttonPrimary,
    borderRadius: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: Theme.colors.paginationcolor,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderColor,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  pageButton: {
    marginHorizontal: 6,
    paddingHorizontal: 8,
  },
  pageText: {
    fontSize: 16,
    color: Theme.colors.black,
  },
  disabled: {
    opacity: 0.3,
  },
  pageInfo: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.black,
  },

});