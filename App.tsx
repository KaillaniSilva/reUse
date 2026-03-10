import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AboutScreen } from "./src/screens/AboutScreen";
import { Logo } from "./src/components/Logo";
import type { RootStackParamList } from "./src/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#0D5C3D",
          headerTitleStyle: { fontWeight: "600", fontSize: 18, color: "#0D5C3D" },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: () => <Logo variant="light" />,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: "Sobre o projeto",
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
