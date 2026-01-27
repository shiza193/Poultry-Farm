import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBusinessUnits } from "../services/BusinessUnit"; 

type BusinessUnitContextType = {
  businessUnitId: string;
  setBusinessUnitId: (id: string) => void;
};

const BusinessUnitContext = createContext<BusinessUnitContextType | undefined>(undefined);

export const BusinessUnitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [businessUnitId, setBusinessUnitId] = useState<string>("");

  useEffect(() => {
    const loadBusinessUnit = async () => {
      try {
        // 1️⃣ Check AsyncStorage first
        const savedId = await AsyncStorage.getItem("businessUnitId");
        if (savedId) {
          setBusinessUnitId(savedId);
          return;
        }

        // 2️⃣ Fetch all business units for the user
        const businessUnits = await getBusinessUnits();
        if (businessUnits.length > 0) {
          const defaultBU = businessUnits[0]; // pick first or default BU
          setBusinessUnitId(defaultBU.businessUnitId);

          // Save for next launch
          await AsyncStorage.setItem("businessUnitId", defaultBU.businessUnitId);
        }
      } catch (error) {
        console.warn("Failed to load business unit ID", error);
      }
    };

    loadBusinessUnit();
  }, []);

  return (
    <BusinessUnitContext.Provider value={{ businessUnitId, setBusinessUnitId }}>
      {children}
    </BusinessUnitContext.Provider>
  );
};

export const useBusinessUnit = () => {
  const context = useContext(BusinessUnitContext);
  if (!context) {
    throw new Error("useBusinessUnit must be used within BusinessUnitProvider");
  }
  return context;
};
