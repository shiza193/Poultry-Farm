import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBusinessUnits } from '../services/BusinessUnit';

type BusinessUnitContextType = {
  businessUnitId: string;
  setBusinessUnitId: (id: string) => void;
  farmName: string;
  setFarmName: (name: string) => void;
  farmLocation: string;
  setFarmLocation: (location: string) => void;
};

const BusinessUnitContext = createContext<BusinessUnitContextType | undefined>(
  undefined,
);

export const BusinessUnitProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [businessUnitId, setBusinessUnitId] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
   const [farmLocation, setFarmLocation] = useState<string>('');

useEffect(() => {
  const loadBusinessUnit = async () => {
    try {
      const savedId = await AsyncStorage.getItem('businessUnitId');
      const savedLocation = await AsyncStorage.getItem('farmLocation'); 
      if (savedId) {
        setBusinessUnitId(savedId);
        if (savedLocation) setFarmLocation(savedLocation);
        return;
      }

      const businessUnits = await getBusinessUnits();
      if (businessUnits.length > 0) {
        const defaultBU = businessUnits[0];
        setBusinessUnitId(defaultBU.businessUnitId);
        setFarmLocation(defaultBU.location || '');

        await AsyncStorage.setItem(
          'businessUnitId',
          defaultBU.businessUnitId,
        );
        await AsyncStorage.setItem(
          'farmLocation',
          defaultBU.location || '',
        );
      }
    } catch (error) {
      console.warn('Failed to load business unit ID', error);
    }
  };

  loadBusinessUnit();
}, []);


// useEffect(() => {
//   const loadBusinessUnit = async () => {
//     try {
//       const savedId = await AsyncStorage.getItem('businessUnitId');
//       const savedLocation = await AsyncStorage.getItem('farmLocation');

//       // Always fetch fresh list from backend
//       const businessUnits = await getBusinessUnits();

//       if (!businessUnits || businessUnits.length === 0) {
//         console.warn("No business units found");
//         return;
//       }

//       // Check if savedId still exists in backend list
//       const validSavedBU = businessUnits.find(
//         (bu:any) => bu.businessUnitId === savedId
//       );

//       if (validSavedBU) {
//         setBusinessUnitId(validSavedBU.businessUnitId);
//         setFarmLocation(validSavedBU.location || '');

//         await AsyncStorage.setItem(
//           'businessUnitId',
//           validSavedBU.businessUnitId
//         );
//         await AsyncStorage.setItem(
//           'farmLocation',
//           validSavedBU.location || ''
//         );

//       } else {
//         // Saved ID invalid → use first valid BU
//         const defaultBU = businessUnits[0];

//         setBusinessUnitId(defaultBU.businessUnitId);
//         setFarmLocation(defaultBU.location || '');

//         await AsyncStorage.setItem(
//           'businessUnitId',
//           defaultBU.businessUnitId
//         );
//         await AsyncStorage.setItem(
//           'farmLocation',
//           defaultBU.location || ''
//         );
//       }

//     } catch (error) {
//       console.warn('Failed to load business unit ID', error);
//     }
//   };

//   loadBusinessUnit();
// }, []);

  return (
    <BusinessUnitContext.Provider
     value={{
        businessUnitId,
        farmName,
        farmLocation,          
        setBusinessUnitId,
        setFarmName,
        setFarmLocation,     
      }}
    >
      {children}
    </BusinessUnitContext.Provider>
  );
};

export const useBusinessUnit = () => {
  const context = useContext(BusinessUnitContext);
  if (!context) {
    throw new Error('useBusinessUnit must be used within BusinessUnitProvider');
  }
  return context;
};
