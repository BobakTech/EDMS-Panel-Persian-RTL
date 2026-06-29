/**
 * ============================================================================
 * App
 * ----------------------------------------------------------------------------
 * Application entry point.
 * Renders the main EDMS screen.
 * ============================================================================
 */

import EDMSScreen from "./screens/EDMSScreen";
import { SettingsProvider } from "./settings/SettingsContext";

export default function App() {
	return (
		<SettingsProvider>
			<EDMSScreen />
		</SettingsProvider>
	);
}