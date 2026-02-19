// src/screens/ReportScreen/ReportHelpers.ts
import api from '../../api/Api';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import { Platform } from 'react-native';

// export const getEggProductionExcel = async (fileName = 'EggProductionReport', payload: any = {}) => {
//   try {
//     console.log(' Sending Production Excel Request Payload:', payload);

//     const response = await api.post(
//       'api/Export/egg-productions-excel',
//       payload,
//       { responseType: 'blob' }
//     );

//     const blob = response.data;
//     await saveAndOpenExcel(blob, fileName);
//   } catch (error) {
//     console.error(' Error fetching Production Excel:', error);
//   }
// };

// export const getEggStockExcel = async (fileName = 'EggStockReport', businessUnitId: string) => {
//   try {
//     console.log(' Sending Stock Excel Request for BU:', businessUnitId);

//     const response = await api.get(
//       `api/Export/egg-stock-excel/${businessUnitId}`,
//       { responseType: 'blob' }
//     );

//     const blob = response.data;
//     await saveAndOpenExcel(blob, fileName);
//   } catch (error) {
//     console.error(' Error fetching Stock Excel:', error);
//   }
// };

// ===== Flocks Excel =====
// ===== Flocks Excel =====
interface FlocksExcelFilters {
  businessUnitId: string;
  searchKey?: string | null;
  flockId?: string | null;
  supplierId?: string | null;
  isEnded?: boolean | null;
}

export const getFlocksExcel = async (
  fileName = 'FlocksReport',
  filters: FlocksExcelFilters & { pageNumber?: number; pageSize?: number },
) => {
  try {
    const payload = {
      businessUnitId: filters.businessUnitId,
      searchKey: filters.searchKey || null,
      flockId: filters.flockId || null,
      supplierId: filters.supplierId || null,
      isEnded: filters.isEnded ?? null,
      pageNumber: filters.pageNumber ?? 1, // default fallback
      pageSize: filters.pageSize ?? 10000, // default fallback
    };

    console.log('Sending Flocks Excel Request with payload:', payload);

    const response = await api.post('api/Export/flocks-excel', payload, {
      responseType: 'arraybuffer',
    });

    await saveAndOpenExcelFromArrayBuffer(response.data, fileName);

    console.log(
      ` Excel saved at: /storage/emulated/0/Android/data/com.poultryfarm/files/Download/${fileName}.xlsx`,
    );
  } catch (error) {
    console.error('Error fetching Flocks Excel:', error);
  }
};



// ===== Save + Open =====
const saveAndOpenExcelFromArrayBuffer = async (
  arrayBuffer: ArrayBuffer,
  fileName: string,
) => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert Uint8Array → base64
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    const base64Data = ReactNativeBlobUtil.base64.encode(binary);

    const filePath =
      Platform.OS === 'android'
        ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}.xlsx`
        : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}.xlsx`;

    await ReactNativeBlobUtil.fs.writeFile(filePath, base64Data, 'base64');
    console.log('✅ Excel saved at:', filePath);

    try {
      await FileViewer.open(filePath, { showOpenWithDialog: true });
    } catch {
      if (Platform.OS === 'android') {
        ReactNativeBlobUtil.android.actionViewIntent(
          filePath,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
      } else {
        console.log('No compatible app found to open Excel.');
      }
    }
  } catch (error) {
    console.error('❌ Error saving/opening Excel:', error);
  }
};
