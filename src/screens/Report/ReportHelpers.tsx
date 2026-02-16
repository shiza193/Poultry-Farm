// src/screens/ReportScreen/ReportHelpers.ts
import api from '../../api/Api';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import { Platform } from 'react-native';



export const getEggProductionExcel = async (fileName = 'EggProductionReport', payload: any = {}) => {
  try {
    console.log(' Sending Production Excel Request Payload:', payload); 

    const response = await api.post(
      'api/Export/egg-productions-excel',
      payload,
      { responseType: 'blob' }
    );

    const blob = response.data;
    await saveAndOpenExcel(blob, fileName);
  } catch (error) {
    console.error(' Error fetching Production Excel:', error);
  }
};


export const getEggStockExcel = async (fileName = 'EggStockReport', businessUnitId: string) => {
  try {
    console.log(' Sending Stock Excel Request for BU:', businessUnitId);

    const response = await api.get(
      `api/Export/egg-stock-excel/${businessUnitId}`,
      { responseType: 'blob' }
    );

    const blob = response.data;
    await saveAndOpenExcel(blob, fileName);
  } catch (error) {
    console.error(' Error fetching Stock Excel:', error);
  }
};




// ===== Flocks Excel =====
export const getFlocksExcel = async (
  fileName = 'FlocksReport',
  businessUnitId: string
) => {
  try {
    console.log(' Sending Flocks Excel Request for BU:', businessUnitId);

    const payload = { businessUnitId }; 

    const response = await api.post(
      'api/Export/flocks-excel',
      payload,
      { responseType: 'blob' }
    );

    const blob = response.data;
    await saveAndOpenExcel(blob, fileName);
  } catch (error) {
    console.error(' Error fetching Flocks Excel:', error);
  }
};


// Shared save + open logic
const saveAndOpenExcel = async (blob: any, fileName: string) => {
  try {
    // Blob → Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result?.toString() || '';
        const base64Data = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Save file path
    const filePath =
      Platform.OS === 'android'
        ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}.xlsx`
        : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}.xlsx`;

    await ReactNativeBlobUtil.fs.writeFile(filePath, base64, 'base64');
    console.log(' Excel saved at:', filePath);

    try {
      await FileViewer.open(filePath, { showOpenWithDialog: true });
    } catch {
      if (Platform.OS === 'android') {
        ReactNativeBlobUtil.android.actionViewIntent(
          filePath,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
      } else {
        console.log('No compatible app found to open Excel.');
      }
    }
  } catch (error) {
    console.error('❌ Error saving/opening Excel:', error);
  }
};
