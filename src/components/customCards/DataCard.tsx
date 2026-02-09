import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import React, { useRef, useState } from 'react';
import Theme from '../../theme/Theme';

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  render?: (
    value: any,
    row: any,
    index: number,
    toggleExpand: (index: number) => void,
  ) => React.ReactNode;
  isTitle?: boolean;
  titleColor?: string;

  showDots?: boolean;
  onDotsPress?: (row: any) => void;
}

interface DataCardProps {
  columns: TableColumn[];
  data: any[];
  renderExpandedRow?: (row: any) => React.ReactNode;
  itemsPerPage?: number;
  onRowPress?: (row: any) => void;
  showActions?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  renderRowMenu?: (row: any, closeMenu: () => void) => React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({
  columns,
  data,
  onRowPress,
  itemsPerPage = 10,
  showActions = false,
  onEdit,
  onDelete,
  renderExpandedRow,
  renderRowMenu,
}) => {
  const [activePage, setActivePage] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  const [contentWidth, setContentWidth] = useState(1);
  const [containerWidth, setContainerWidth] = useState(1);
  const scrollRef = useRef<ScrollView>(null);

  // dots menu state
  const [activeRowMenu, setActiveRowMenu] = useState<number | null>(null);

  const totalRecords = data.length;
  const totalPages = Math.max(Math.ceil(totalRecords / itemsPerPage), 1);
  const paginatedData = data.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );
  const isFirstPage = activePage === 1;
  const isLastPage = activePage === totalPages;

  const thumbWidth = Math.max(
    (containerWidth / contentWidth) * containerWidth,
    40,
  );
  const thumbTranslateX =
    (scrollX / (contentWidth - containerWidth)) * (containerWidth - thumbWidth);

  const handleActionPress = (index: number) => {
    setExpandedRowIndex(prev => (prev === index ? null : index));
  };

  return (
    <View>
      {/* ===== TABLE SCROLL ===== */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={e => setScrollX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        onContentSizeChange={w => setContentWidth(w)}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View>
          {/* ===== HEADER ===== */}
          <View style={styles.headerRow}>
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
              <Text style={[styles.headerCell, { width: 100 }]}>Actions</Text>
            )}
          </View>

          {/* ===== ROWS ===== */}
          {paginatedData.length === 0 ? (
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                paddingVertical: 20,
                paddingLeft: 100,
                width: columns.reduce((sum, c) => sum + (c.width || 120), 0),
              }}
            >
              <Image
                source={Theme.icons.nodata}
                style={{ width: 150, height: 150, resizeMode: 'contain' }}
              />
            </View>
          ) : (
            paginatedData.map((row, index) => {
              const RowWrapper = onRowPress ? TouchableOpacity : View;

              return (
                <View key={index}>
                  <RowWrapper
                    style={styles.dataRow}
                    onPress={() => onRowPress?.(row)}
                    activeOpacity={0.7}
                  >
                    {columns.map(col => {
                      const value = row[col.key];
                      return (
                        <View
                          key={col.key}
                          style={[styles.dataCell, { width: col.width || 120 }]}
                        >
                          {col.render ? (
                            col.render(value, row, index, () =>
                              setExpandedRowIndex(prev =>
                                prev === index ? null : index,
                              ),
                            )
                          ) : col.isTitle ? (
                            <Text style={styles.titleText}>{value ?? '—'}</Text>
                          ) : (
                            <Text style={styles.cellText}>{value ?? '—'}</Text>
                          )}
                        </View>
                      );
                    })}
                  </RowWrapper>

                  {/* Expanded row showing all actions */}
                  {expandedRowIndex === index && renderExpandedRow && (
                    <View style={styles.expandedRow}>
                      {renderExpandedRow(row)}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* CUSTOM SCROLLBAR */}
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

      {/* PAGINATION */}
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

        <Text style={styles.pageInfo}>{`${
          (activePage - 1) * itemsPerPage + 1
        } – ${Math.min(
          activePage * itemsPerPage,
          totalRecords,
        )} of ${totalRecords}`}</Text>

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
    flexDirection: 'row',
    backgroundColor: Theme.colors.haedercolor,
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: {
    color: Theme.colors.success,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'left',
    paddingHorizontal: 6,
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderColor,
    paddingVertical: 10,
  },
  expandedRow: {
    backgroundColor: Theme.colors.lightGrey,
    paddingVertical: 5,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderColor,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 19, // <-- space between each child
  },

  dataCell: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
  },
  cellText: {
    fontSize: 13,
    color: Theme.colors.black,
    textAlign: 'left',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.black,
    textAlign: 'center',
  },
  scrollBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scrollBarThumb: {
    height: '100%',
    backgroundColor: Theme.colors.buttonPrimary,
    borderRadius: 4,
  },
  rowDotsMenu: {
    position: 'absolute',
    backgroundColor: Theme.colors.white,
    borderRadius: 6,
    elevation: 5,
    padding: 8,
    zIndex: 999,
    minWidth: 80,
    top: 20,
    left: 18,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Theme.colors.success,
  },
  disabled: {
    opacity: 0.3,
  },
  pageInfo: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.black,
  },
});
