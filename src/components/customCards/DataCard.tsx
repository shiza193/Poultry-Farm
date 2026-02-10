import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
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
    index?: number,
    toggleExpand?: (index: number) => void,
  ) => React.ReactNode;
  isTitle?: boolean;
  titleColor?: string;
  showDots?: boolean;
  onDotsPress?: (row: any) => void; // ✅ added to fix TS error
}

interface DataCardProps {
  columns: TableColumn[];
  data: any[];
  itemsPerPage?: number;
  onRowPress?: (row: any) => void;
  renderRowMenu?: (row: any, closeMenu: () => void) => React.ReactNode;
  renderExpandedRow?: (row: any) => React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({
  columns,
  data,
  itemsPerPage = 10,
  onRowPress,
  renderRowMenu,
  renderExpandedRow,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [floatingMenu, setFloatingMenu] = useState<any>(null);
  const [activePage, setActivePage] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(1);
  const [containerWidth, setContainerWidth] = useState(1);

  const scrollRef = useRef<ScrollView>(null);
  const dotRefs = useRef<{ [key: number]: View | null }>({});

  const totalRecords = data.length;
  const totalPages = Math.max(Math.ceil(totalRecords / itemsPerPage), 1);
  const paginatedData = data.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const isFirstPage = activePage === 1;
  const isLastPage = activePage === totalPages;

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const containerRef = useRef<View>(null);

  const hasDots = columns.some(c => c.showDots);

  // Scrollbar thumb calculation
  const thumbWidth = Math.max(
    (containerWidth / contentWidth) * containerWidth,
    40,
  );
  const thumbTranslateX =
    (scrollX / (contentWidth - containerWidth)) * (containerWidth - thumbWidth);

  return (
    <View ref={containerRef}>
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
            {hasDots && <Text style={[styles.headerCell, { width: 50 }]} />}
            {columns.map(col => (
              <Text
                key={col.key}
                style={[styles.headerCell, { width: col.width || 120 }]}
              >
                {col.title}
              </Text>
            ))}
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
              const globalIndex = (activePage - 1) * itemsPerPage + index;
              const RowWrapper = onRowPress ? TouchableOpacity : View;

              return (
                <View key={globalIndex}>
                  <RowWrapper
                    style={styles.dataRow}
                    onPress={() => onRowPress?.(row)}
                    activeOpacity={0.7}
                  >
                    {hasDots && (
                      <View
                        style={[
                          styles.dataCell,
                          {
                            width: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        {(() => {
                          const rowKey = row.id ?? globalIndex;
                          return (
                            <TouchableOpacity
                              ref={ref => {
                                dotRefs.current[rowKey] = ref;
                              }}
                              onPress={() => {
                                const dotRef = dotRefs.current[rowKey];
                                if (!dotRef || !containerRef.current) return;

                                dotRef.measureLayout(
                                  containerRef.current!,
                                  (x, y, width, height) => {
                                    setFloatingMenu({
                                      x,
                                      y: y + height,
                                      row,
                                    });
                                  },
                                  () => {
                                    console.log('measureLayout failed');
                                  },
                                );
                              }}
                            >
                              <Image
                                source={Theme.icons.dots}
                                style={{ width: 20, height: 20 }}
                              />
                            </TouchableOpacity>
                          );
                        })()}
                      </View>
                    )}

                    {/* CELLS */}
                    {columns.map(col => {
                      const value = row[col.key];
                      return (
                        <View
                          key={col.key}
                          style={[
                            styles.dataCell,
                            {
                              width: col.width || 120,
                              flexDirection: 'row',
                              alignItems: 'center',
                            },
                          ]}
                        >
                          {col.render ? (
                            col.render(value, row, globalIndex, toggleExpand)
                          ) : col.isTitle ? (
                            <Text
                              style={[
                                styles.titleText,
                                {
                                  color:
                                    col.titleColor || styles.titleText.color,
                                },
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {value ?? '—'}
                            </Text>
                          ) : (
                            <Text
                              style={styles.cellText}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {value ?? '—'}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </RowWrapper>

                  {/* 🔽 EXPANDED ROW */}
                  {expandedIndex === globalIndex && renderExpandedRow && (
                    <View style={{ paddingVertical: 10 }}>
                      {renderExpandedRow(row)}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
      {floatingMenu && renderRowMenu && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          activeOpacity={1}
          onPress={() => setFloatingMenu(null)}
        >
          <View
            style={{
              position: 'absolute',
              top: floatingMenu.y, 
              left: floatingMenu.x,
              minWidth: 90,
              backgroundColor: Theme.colors.white,
              borderRadius: 6,
              elevation: 6,
              paddingVertical: 9,
              zIndex: 100,
            }}
          >
            {renderRowMenu(floatingMenu.row, () => setFloatingMenu(null))}
          </View>
        </TouchableOpacity>
      )}

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
