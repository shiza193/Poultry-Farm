// FlockStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlockMainScreen from '../navigation/FlockMainTab';
import FlocksMortalityScreen from '../screens/flocks/FlocksMortalityScreen';
import HospitalityScreen from '../screens/flocks/HospitalityScreen';

const Stack = createNativeStackNavigator();

const FlockStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FlockMainScreen" component={FlockMainScreen} />
    <Stack.Screen name="FlocksMortalityScreen" component={FlocksMortalityScreen} />
        <Stack.Screen name="HospitalityScreen" component={HospitalityScreen} />

  </Stack.Navigator>
);

export default FlockStack;