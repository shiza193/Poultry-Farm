import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Theme from '../../theme/Theme';

interface Labels {
  // Customer Table
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  actions?: string;

  // Employee Table
  type?: string;
  salary?: string;
  poultryFarm?: string;
  joiningDate?: string;
  endDate?: string;

  // Flock Table
  flockName?: string;
  totalPurchased?: string;
  totalMortality?: string;
  totalHospitality?: string;
  totalSale?: string;
  availableStock?: string;

  // Flock Sale Table
  date?: string;
  customerName?: string;
  flock?: string;
  price?: string;
  quantity?: string;

  // Hospitality Table
  hospDate?: string;
  hospQuantity?: string;
  hospDiagnosis?: string;
  hospMedication?: string;
  hospTreatmentDays?: string;
  hospVetName?: string;
  hospActions?: string;

  // Egg Stock
  unit?: string;
  totalProduced?: string;
  totalSold?: string;
  eggAvailableStock?: string;

  // Egg Sale
  eggSaleDate?: string;
  eggSaleCustomerName?: string;
  eggSaleGram?: string;
  eggSalePrice?: string;
  eggSaleQuantity?: string;

  // Vaccinations Table Props
  showVaccinations?: boolean;
  vaccineName?: string;
  supplierName?: string;
  vaccineDate?: string;
  vaccineQuantity?: number | string;
  vaccinePrice?: number | string;
  // Vaccination Schedule Table Props
  ref?: string;
  vaccineflockValue?: string;
  vaccinationName?: string;
  scheduledDate?: string;
  vaccinationQuantityValue?: number | string;
  done?: boolean;
}

interface Props {
  isHeader?: boolean;
  labels?: Labels;

  // Employee Table Props
  type?: string;
  salary?: number;
  poultryFarm?: string;
  joiningDate?: string;
  endDate?: string;

  // Customer Table Props
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: 'Active' | 'Inactive';

  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showStatus?: boolean;
  showActions?: boolean;

  onToggleStatus?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;

  // Flock Table Props
  showFlock?: boolean;
  flockName?: string;
  totalPurchased?: number;
  totalMortality?: number;
  totalHospitality?: number;
  totalSale?: number;
  availableStock?: number;

  // Flock Sale Table Props
  showFlockSale?: boolean;
  dateValue?: string;
  customerNameValue?: string;
  flockValue?: string;
  priceValue?: number;
  quantityValue?: number;

  // Hospitality Table Props
  showHospitality?: boolean;
  hospDateValue?: string;
  hospQuantityValue?: number;
  hospDiagnosisValue?: string;
  hospMedicationValue?: string;
  hospTreatmentDaysValue?: number;
  hospVetNameValue?: string;

  // Egg Stock Props
  showEggStock?: boolean;
  unitValue?: string;
  totalProducedValue?: number;
  totalSoldValue?: number;
  eggAvailableStockValue?: number;

  // Egg Sale Table Props
  showEggSale?: boolean;
  eggSaleDate?: string;
  eggSaleCustomerName?: string;
  eggSaleGram?: number;
  eggSalePrice?: number;
  eggSaleQuantity?: number;

  // Vaccinations Table Props
  showVaccinations?: boolean;
  vaccineName?: string;
  supplierName?: string;
  vaccineDate?: string;
  vaccineQuantity?: number | string;
  vaccinePrice?: number | string;

  // Vaccination Schedule Table Props
  showVaccinationSchedule?: boolean;
  refValue?: string;
  vaccineflockValue?: string;
  vaccinationNameValue?: string;
  scheduledDateValue?: string;
  vaccinationQuantityValue?: number | string;
  doneValue?: boolean;

  onToggleDone?: () => void;
}

const DataCard: React.FC<Props> = ({
  isHeader = false,
  labels = {},

  // Employee Table
  type,
  salary,
  poultryFarm,
  joiningDate,
  endDate,

  // Customer Table
  name,
  phone,
  email,
  address,
  status,
  showPhone = true,
  showEmail = true,
  showAddress = true,
  showStatus = true,
  showActions = true,
  onToggleStatus,
  onEdit,
  onDelete,

  // Flock Table
  showFlock = false,
  flockName,
  totalPurchased,
  totalMortality,
  totalHospitality,
  totalSale,
  availableStock,

  // Flock Sale Table
  showFlockSale = false,
  dateValue,
  customerNameValue,
  flockValue,
  priceValue,
  quantityValue,

  // Hospitality Table
  showHospitality = false,
  hospDateValue,
  hospQuantityValue,
  hospDiagnosisValue,
  hospMedicationValue,
  hospTreatmentDaysValue,
  hospVetNameValue,

  // Egg Stock
  showEggStock = false,
  unitValue,
  totalProducedValue,
  totalSoldValue,
  eggAvailableStockValue,

  // Egg Sale
  showEggSale = false,
  eggSaleDate,
  eggSaleCustomerName,
  eggSaleGram,
  eggSalePrice,
  eggSaleQuantity,

  // Vaccinations Table Props
  showVaccinations = false,
  vaccineName,
  supplierName,
  vaccineDate,
  vaccineQuantity,
  vaccinePrice,
  // Vaccination Schedule
  showVaccinationSchedule = false,
  refValue,
  vaccineflockValue,
  vaccinationNameValue,
  scheduledDateValue,
  vaccinationQuantityValue,
  doneValue,
  onToggleDone,
}) => {
  const isActive = status === 'Active';

  // Default labels
  const {
    name: nameLabel = 'Name',
    type: typeLabel = 'Type',
    salary: salaryLabel = 'Salary',
    poultryFarm: poultryFarmLabel = 'Poultry Farm',
    joiningDate: joiningDateLabel = 'Joining Date',
    endDate: endDateLabel = 'End Date',
    status: statusLabel = 'Status',
    actions: actionsLabel = 'Action',

    // Customer Table
    phone: phoneLabel = 'Phone',
    email: emailLabel = 'Email',
    address: addressLabel = 'Address',

    // Flock Table
    flockName: flockNameLabel = 'Flock Name',
    totalPurchased: totalPurchasedLabel = 'Purchased',
    totalMortality: totalMortalityLabel = 'Mortality',
    totalHospitality: totalHospitalityLabel = 'Hospitality',
    totalSale: totalSaleLabel = 'Sale',
    availableStock: availableStockLabel = 'Available',

    // Flock Sale Table
    date: dateLabel = 'DATE',
    customerName: customerNameLabel = 'Customer Name',
    flock: flockLabel = 'Flock',
    price: priceLabel = 'Price',
    quantity: quantityLabel = 'Quantity',

    // Hospitality Table
    hospDate: hospDateLabel = 'Date',
    hospQuantity: hospQuantityLabel = 'Quantity',
    hospDiagnosis: hospDiagnosisLabel = 'Diagnosis',
    hospMedication: hospMedicationLabel = 'Medication',
    hospTreatmentDays: hospTreatmentDaysLabel = 'Treatment Days',
    hospVetName: hospVetNameLabel = 'Vet Name',
    hospActions: hospActionsLabel = 'Actions',

    // Egg Stock
    unit: unitLabel = 'Unit',
    totalProduced: totalProducedLabel = 'Total Produced',
    totalSold: totalSoldLabel = 'Total Sold',
    eggAvailableStock: eggAvailableStockLabel = 'Available Stock',

    // Egg Sale
    eggSaleDate: eggSaleDateLabel = 'Date',
    eggSaleCustomerName: eggSaleCustomerNameLabel = 'Customer Name',
    eggSaleGram: eggSaleGramLabel = 'Gram',
    eggSalePrice: eggSalePriceLabel = 'Price',
    eggSaleQuantity: eggSaleQuantityLabel = 'Quantity',
  } = labels;

  // ------------------------ EMPLOYEE TABLE ------------------------
  if (labels?.type || labels?.salary || labels?.poultryFarm) {
    if (isHeader) {
      return (
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.name || 'Name'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.type || 'Type'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.salary || 'Salary'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.poultryFarm || 'Poultry Farm'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.joiningDate || 'Joining Date'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.endDate || 'End Date'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.status || 'Status'}
          </Text>
          <Text style={[styles.cell, styles.headerText]}>
            {labels?.actions || 'Actions'}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.row}>
          <Text style={styles.cell}>{name || '-'}</Text>
          <Text style={styles.cell}>{type || '-'}</Text>
          <Text style={styles.cell}>{salary || '-'}</Text>
          <Text style={styles.cell}>{poultryFarm || '-'}</Text>
          <Text style={styles.cell}>{joiningDate || '-'}</Text>
          <Text style={styles.cell}>{endDate || '-'}</Text>

          {/* Use cellStatus for toggle */}
          <View style={styles.cellStatus}>
            <View style={styles.toggleWrap}>
              <TouchableOpacity
                onPress={onToggleStatus}
                style={[
                  styles.toggleBtn,
                  status === 'Active' && {
                    backgroundColor: Theme.colors.secondaryYellow,
                  },
                  styles.leftRadius,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: status === 'Active' ? '#fff' : '#333' },
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onToggleStatus}
                style={[
                  styles.toggleBtn,
                  status === 'Inactive' && {
                    backgroundColor: Theme.colors.grey,
                  },
                  styles.rightRadius,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: status === 'Inactive' ? '#fff' : '#333' },
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Use cellActions for actions */}
          <View style={styles.cellActions}>
            <TouchableOpacity onPress={onEdit}>
              <Image source={Theme.icons.edit} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Image source={Theme.icons.bin} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  // ------------------------
  // HOSPITALITY TABLE
  if (showHospitality) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>{isHeader ? 'FLOCK' : flockValue}</Text>
        {/* FLOCK column */}
        <Text style={styles.cell}>
          {isHeader ? hospDateLabel : hospDateValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? hospQuantityLabel : hospQuantityValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? hospDiagnosisLabel : hospDiagnosisValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? hospMedicationLabel : hospMedicationValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? hospTreatmentDaysLabel : hospTreatmentDaysValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? hospVetNameLabel : hospVetNameValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? (
            hospActionsLabel
          ) : (
            <View style={styles.cellActions}>
              <TouchableOpacity onPress={onEdit}>
                <Image source={Theme.icons.edit} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete}>
                <Image source={Theme.icons.bin} style={styles.icon} />
              </TouchableOpacity>
            </View>
          )}
        </Text>
      </View>
    );
  }

  /* ================= EGG SALE TABLE ================= */
  if (showEggSale) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>
          {isHeader ? eggSaleDateLabel : eggSaleDate}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? eggSaleCustomerNameLabel : eggSaleCustomerName}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? eggSaleGramLabel : eggSaleGram}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? eggSalePriceLabel : eggSalePrice}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? eggSaleQuantityLabel : eggSaleQuantity}
        </Text>
      </View>
    );
  }

  /* ================= EGG STOCK TABLE ================= */
  if (showEggStock) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>{isHeader ? unitLabel : unitValue}</Text>
        <Text style={styles.cell}>
          {isHeader ? totalProducedLabel : totalProducedValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? totalSoldLabel : totalSoldValue}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? eggAvailableStockLabel : eggAvailableStockValue}
        </Text>
      </View>
    );
  }
  // ------------------------ (rest of code remains same for Flock, FlockSale, Customer)
  if (showFlockSale) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>{isHeader ? dateLabel : dateValue}</Text>
        <Text style={styles.cell}>
          {isHeader ? customerNameLabel : customerNameValue}
        </Text>
        <Text style={styles.cell}>{isHeader ? flockLabel : flockValue}</Text>
        <Text style={styles.cell}>{isHeader ? priceLabel : priceValue}</Text>
        <Text style={styles.cell}>
          {isHeader ? quantityLabel : quantityValue}
        </Text>
      </View>
    );
  }

  if (showFlock) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>{isHeader ? flockNameLabel : flockName}</Text>
        <Text style={styles.cell}>
          {isHeader ? totalPurchasedLabel : totalPurchased}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? totalMortalityLabel : totalMortality}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? totalHospitalityLabel : totalHospitality}
        </Text>
        <Text style={styles.cell}>{isHeader ? totalSaleLabel : totalSale}</Text>
        <Text style={styles.cell}>
          {isHeader ? availableStockLabel : availableStock}
        </Text>
        <Text style={styles.cell}>{isHeader ? statusLabel : status}</Text>
      </View>
    );
  }


  /* ================= VACCINATIONS TABLE ================= */
  if (showVaccinations) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>
          {isHeader ? labels?.vaccineName || 'VACCINE NAME' : vaccineName}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? labels?.supplierName || 'Supplier' : supplierName}
          {/* <-- FIXED */}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? labels?.vaccineDate || 'Date' : vaccineDate}
          {/* <-- FIXED */}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? labels?.vaccineQuantity || 'Quantity' : vaccineQuantity}
          {/* <-- FIXED */}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? labels?.vaccinePrice || 'Price' : vaccinePrice}
          {/* <-- FIXED */}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? 'Actions' : (
            <View style={styles.cellActions}>
              <TouchableOpacity onPress={onEdit}>
                <Image source={Theme.icons.edit} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete}>
                <Image source={Theme.icons.bin} style={styles.icon} />
              </TouchableOpacity>
            </View>
          )}
        </Text>
      </View>
    );
  }
  /* ================= VACCINATION SCHEDULE TABLE ================= */
  if (showVaccinationSchedule) {
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
        <Text style={styles.cell}>{isHeader ? 'REF' : refValue || '-'}</Text>
        <Text style={styles.cell}>{isHeader ? 'FLOCK' : vaccineflockValue || '-'}</Text>
        <Text style={styles.cell}>{isHeader ? 'Vaccination Name' : vaccinationNameValue || '-'}</Text>
        <Text style={styles.cell}>{isHeader ? 'Scheduled Date' : scheduledDateValue || '-'}</Text>
        <Text style={styles.cell}>{isHeader ? 'Quantity' : vaccinationQuantityValue ?? '-'}</Text>
        <Text style={styles.cell}>
          {isHeader ? 'Done' : (
            <TouchableOpacity onPress={onToggleDone}>
              <Text style={{ fontSize: 16 }}>{doneValue ? '✔️' : '❌'}</Text>
            </TouchableOpacity>
          )}
        </Text>
        <Text style={styles.cell}>
          {isHeader ? 'Actions' : (
            <View style={styles.cellActions}>
              <TouchableOpacity onPress={onEdit}>
                <Image source={Theme.icons.edit} style={styles.icon} />
              </TouchableOpacity>
            </View>
          )}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.row, isHeader && styles.headerRow]}>
      <Text style={[styles.cellName, isHeader && styles.headerText]}>
        {isHeader ? nameLabel : name}
      </Text>

      {showPhone && (
        <Text style={[styles.cellPhone, isHeader && styles.headerText]}>
          {isHeader ? phoneLabel : phone}
        </Text>
      )}
      {showEmail && (
        <Text style={[styles.cellEmail, isHeader && styles.headerText]}>
          {isHeader ? emailLabel : email}
        </Text>
      )}
      {showAddress && (
        <Text style={[styles.cellAddress, isHeader && styles.headerText]}>
          {isHeader ? addressLabel : address}
        </Text>
      )}

      {showStatus && (
        <View style={styles.cellStatus}>
          {isHeader ? (
            <Text style={styles.headerText}>{statusLabel}</Text>
          ) : (
            <View style={styles.toggleWrap}>
              <TouchableOpacity
                onPress={onToggleStatus}
                style={[
                  styles.toggleBtn,
                  isActive && { backgroundColor: Theme.colors.secondaryYellow },
                  styles.leftRadius,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isActive ? '#fff' : '#333' },
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onToggleStatus}
                style={[
                  styles.toggleBtn,
                  !isActive && { backgroundColor: Theme.colors.grey },
                  styles.rightRadius,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: !isActive ? '#fff' : '#333' },
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {showActions &&
        (!isHeader ? (
          <View style={styles.cellActions}>
            <TouchableOpacity onPress={onEdit}>
              <View style={styles.editIconWrapper}>
              <Image source={Theme.icons.edit} style={styles.icon} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
<View style={styles.delIconWrapper}>
  <Image
    source={Theme.icons.delete}
    style={styles.delicon}
    resizeMode="contain"
  />
</View>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.headerText, styles.actionsHeader]}>
            {actionsLabel}
          </Text>
        ))}
    </View>
  );
};

export default DataCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  headerRow: {
    backgroundColor: Theme.colors.borderYellow,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 6,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 13,
    color: Theme.colors.black,
  },

  // Customer Table Cells
  cellName: { width: 160, paddingHorizontal: 8 },
  cellPhone: { width: 140, paddingHorizontal: 8 },
  cellEmail: { width: 180, paddingHorizontal: 8 },
  cellAddress: { width: 160, paddingHorizontal: 8 },
  cellStatus: { width: 150, alignItems: 'center' },
  cellActions: { width: 80, flexDirection: 'row', justifyContent: 'center' },
  actionsHeader: { width: 80, textAlign: 'center' },
  column: {
    width: 140, // adjust per column
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cellLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  cellValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  toggleWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  toggleBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  toggleText: { fontSize: 11, fontWeight: '600' },
  leftRadius: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  rightRadius: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },

  icon: {
    width: 18,
    height: 18,
    marginHorizontal: 6,
    tintColor: Theme.colors.black,
  },
 delIconWrapper: {
  width: 32,
  height: 32,
  backgroundColor: '#FFEAEA', // light red bg (change as needed)
  borderRadius: 8,            // rounded corners
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 6,
},

delicon: {
  width: 18,
  height: 18,
},
editIconWrapper: {
  width: 32,
  height: 32,
  backgroundColor: '#e1fbfd', 
  borderRadius: 8,           
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 6,
},

  // Flock & Flock Sale Table Cell
  cell: { width: 140, textAlign: 'center', fontSize: 12, fontWeight: '600' },
});
