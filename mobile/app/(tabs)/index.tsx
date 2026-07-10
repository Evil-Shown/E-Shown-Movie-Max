import { Redirect } from "expo-router";

/** Default tab route — forwards to the Home screen. */
export default function TabIndex() {
  return <Redirect href="/home" />;
}
