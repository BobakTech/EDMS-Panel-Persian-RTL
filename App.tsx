/**
 * ============================================================================
 * App
 * ----------------------------------------------------------------------------
 * Application entry point.
 * Renders the main EDMS screen.
 * ============================================================================
 */

import AppLayout from "./components/layout/AppLayout";
import { SettingsProvider } from "./settings/SettingsContext";

export default function App() {
	return (
		<SettingsProvider>
			<AppLayout />
		</SettingsProvider>
	);
}