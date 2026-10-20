import { Redirect } from 'expo-router'

/** Preserve existing deep links without a second product page. */
export default function SettingsRedirect() {
  return <Redirect href={{ pathname: '/', params: { panel: 'settings' } }} />
}
