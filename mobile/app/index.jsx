import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to home tabs - works for both logged in and logged out users
  return <Redirect href="/(tabs)/home" />;
}
