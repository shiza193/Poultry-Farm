// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Pressable,
//   Image,
// } from 'react-native';
// import Theme from '../../theme/Theme';

// export interface FlockRow {
//   flockId: string;
//   ref: string;
//   breed: string;
//   arrivalDate: string;
//   supplier: string;
//   quantity: number;
//   remainingQuantity: number;
//   saleQuantity: number;
//   expireQuantity: number;
//   hospitalizedQuantity: number;
//   isEnded: boolean;
// }

// const COL_FLOCK = 170;
// const COL_SUPPLIER = 140;
// const COL_DATE = 110;
// const COL_NUM = 80;
// const COL_ACTIONS = 234;

// const CountBadge = ({
//   value,
//   bgColor,
//   textColor = Theme.colors.textPrimary,
// }: {
//   value: number;
//   bgColor: string;
//   textColor?: string;
// }) => (
//   <View style={[styles.countBadge, { backgroundColor: bgColor }]}>
//     <Text style={[styles.countText, { color: textColor }]}>{value}</Text>
//   </View>
// );

// const ActionBtn = ({
//   icon,
//   onPress,
//   bgColor,
// }: {
//   icon: any;
//   onPress?: () => void;
//   bgColor: string;
// }) => (
//   <Pressable
//     style={[styles.actionBtn, { backgroundColor: bgColor }]}
//     onPress={onPress}
//   >
//     <Image source={icon} style={styles.actionIcon} resizeMode="contain" />
//   </Pressable>
// );

// interface Props {
//   flocks: FlockRow[];
//   onFeed?: (f: FlockRow) => void;
//   onHospital?: (f: FlockRow) => void;
//   onComplete?: (f: FlockRow) => void;
//   onDelete?: (f: FlockRow) => void;
//   onFCR?: (f: FlockRow) => void;
//   onMortality?: (f: FlockRow) => void;
//   onFlockPress?: (f: FlockRow) => void;
// }

// const FlockTableComponent: React.FC<Props> = ({
//   flocks,
//   onFeed,
//   onHospital,
//   onComplete,
//   onDelete,
//   onFCR,
//   onMortality,
//   onFlockPress,
// }) => {
//   return (
//     <View style={{ flex: 1, paddingHorizontal: 12 }}>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View style={styles.container}>
//           {/* Header */}
//           <View style={styles.headerRow}>
//             <Text style={[styles.headerCell, { width: COL_FLOCK }]}>Flock</Text>
//             <Text style={[styles.headerCell, { width: COL_SUPPLIER }]}>
//               Supplier
//             </Text>
//             <Text style={[styles.headerCell, { width: COL_DATE }]}>Date</Text>
//             <Text style={[styles.headerCell, { width: COL_NUM }]}>Total</Text>
//             <Text style={[styles.headerCell, { width: COL_NUM }]}>Current</Text>
//             <Text style={[styles.headerCell, { width: COL_NUM }]}>Sold</Text>
//             <Text style={[styles.headerCell, { width: COL_NUM }]}>Expired</Text>
//             <Text style={[styles.headerCell, { width: COL_NUM }]}>Hospital</Text>
//             <Text style={[styles.headerCell, { width: COL_ACTIONS }]}>
//               Actions
//             </Text>
//           </View>

//           {/* Rows */}
//           {flocks.map(item => (
//             <View key={item.flockId} style={styles.dataRow}>
//               <Pressable
//                 onPress={() => onFlockPress?.(item)}
//                 style={({ pressed }) => [
//                   styles.flockPressable,
//                   { width: COL_FLOCK, opacity: pressed ? 0.5 : 1 },
//                 ]}
//               >
//                 <View style={styles.flockRowInner}>
//                   <Text style={styles.flockLinkText}>
//                     {`${item.ref} (${item.breed})`}
//                   </Text>
//                 </View>
//               </Pressable>

//               <Text style={[styles.cellText, { width: COL_SUPPLIER }]}>
//                 {item.supplier}
//               </Text>

//               <Text style={[styles.cellText, { width: COL_DATE }]}>
//                 {new Date(item.arrivalDate).toLocaleDateString()}
//               </Text>

//               <View style={[styles.cell, { width: COL_NUM }]}>
//                 <CountBadge
//                   value={item.quantity}
//                   bgColor={Theme.colors.borderYellow}
//                 />
//               </View>

//               <View style={[styles.cell, { width: COL_NUM }]}>
//                 <CountBadge
//                   value={item.remainingQuantity}
//                   bgColor={Theme.colors.feedcolor}
//                 />
//               </View>

//               <View style={[styles.cell, { width: COL_NUM }]}>
//                 <CountBadge
//                   value={item.saleQuantity}
//                   bgColor={Theme.colors.sold}
//                 />
//               </View>

//               <View style={[styles.cell, { width: COL_NUM }]}>
//                 <CountBadge
//                   value={item.expireQuantity}
//                   bgColor={Theme.colors.motalitycolor}
//                 />
//               </View>

//               <View style={[styles.cell, { width: COL_NUM }]}>
//                 <CountBadge
//                   value={item.hospitalizedQuantity}
//                   bgColor={Theme.colors.warning}
//                 />
//               </View>

//               {/* Actions */}
//               <View
//                 style={[
//                   styles.cell,
//                   {
//                     width: COL_ACTIONS,
//                     flexDirection: 'row',
//                     justifyContent: 'flex-start',
//                     paddingRight: 12,
//                   },
//                 ]}
//               >
//                 {/* Feed */}
//                 {!item.isEnded && (
//                   <View style={styles.actionWrap}>
//                     <ActionBtn
//                       icon={Theme.icons.plus}
//                       bgColor={Theme.colors.lightGrey}
//                       onPress={() => onFeed?.(item)}
//                     />
//                   </View>
//                 )}

//                 {/* FCR */}
//                 {!item.isEnded && item.remainingQuantity > 0 && (
//                   <View style={styles.actionWrap}>
//                     <ActionBtn
//                       icon={Theme.icons.plus}
//                       bgColor={Theme.colors.lightGrey}
//                       onPress={() => onFCR?.(item)}
//                     />
//                   </View>
//                 )}

//                 {/* Mortality */}
//                 {!item.isEnded && item.remainingQuantity > 0 && (
//                   <View style={styles.actionWrap}>
//                     <ActionBtn
//                       icon={Theme.icons.plus}
//                       bgColor={Theme.colors.lightGrey}
//                       onPress={() => onMortality?.(item)}
//                     />
//                   </View>
//                 )}

//                 {/* Hospital */}
//                 {!item.isEnded && item.remainingQuantity > 0 && (
//                   <View style={styles.actionWrap}>
//                     <ActionBtn
//                       icon={Theme.icons.plus}
//                       bgColor={Theme.colors.lightGrey}
//                       onPress={() => onHospital?.(item)}
//                     />
//                   </View>
//                 )}

//                 {/* Complete */}
//                 {!item.isEnded && (
//                   <View style={styles.actionWrap}>
//                     <ActionBtn
//                       icon={Theme.icons.tick}
//                       bgColor={Theme.colors.lightGrey}
//                       onPress={() => onComplete?.(item)}
//                     />
//                   </View>
//                 )}

//                 {/* Delete */}
//                 <View style={styles.actionWrap}>
//                   <ActionBtn
//                     icon={Theme.icons.bin}
//                     bgColor={'#f88d96'}
//                     onPress={() => onDelete?.(item)}
//                   />
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default FlockTableComponent;

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     paddingRight: 34,
//   },
//   flockPressable: {
//     justifyContent: 'center',
//     paddingLeft: 6,
//   },
//   flockRowInner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingRight: 6,
//   },
//   flockLinkText: {
//     fontSize: 13,
//     color: Theme.colors.primaryYellow,
//     fontWeight: 'bold',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     backgroundColor: Theme.colors.borderYellow,
//     borderRadius: 8,
//     paddingVertical: 8,
//     marginBottom: 6,
//   },
//   headerCell: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: Theme.colors.black,
//     textAlign: 'left',
//     paddingLeft: 9,
//   },
//   dataRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: Theme.colors.borderLight,
//   },
//   cell: {
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     paddingLeft: 6,
//   },
//   cellText: {
//     fontSize: 12,
//     color: Theme.colors.black,
//     textAlign: 'left',
//     paddingLeft: 6,
//   },
//   countBadge: {
//     minWidth: 26,
//     paddingHorizontal: 6,
//     paddingVertical: 3,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: Theme.colors.borderLight,
//     alignItems: 'center',
//   },
//   countText: {
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   actionBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 6,
//   },
//   actionIcon: {
//     width: 14,
//     height: 14,
//   },
//   actionWrap: {
//     marginRight: 6,
//   },
// });
