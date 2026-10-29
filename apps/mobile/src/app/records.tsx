import { Redirect } from 'expo-router'

/** Preserve existing deep links without a second product page. */
export default function RecordsRedirect() {
  return <Redirect href={{ pathname: '/', params: { panel: 'records' } }} />
}
