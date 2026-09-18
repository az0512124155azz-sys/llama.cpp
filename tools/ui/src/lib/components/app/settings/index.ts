/**
 * Full chat settings page layout with sidebar, mobile header, and content area.
 * Manages local configuration state, section navigation, and context setup.
 * Accepts an optional `initialSection` prop to set the initial active section.
 */
export { default as SettingsChat } from './SettingsChat/SettingsChat.svelte';

/**
 * Desktop sidebar navigation for chat settings.
 * Displays a list of settings sections with icons and titles.
 * Switches sections in-app via `onSectionChange`.
 */
export { default as SettingsChatDesktopSidebar } from './SettingsChatDesktopSidebar.svelte';

/**
 * Mobile header with a horizontally scrollable section picker for chat settings.
 * Shows chevron buttons for scroll navigation and highlights the active section.
 * Switches sections in-app via `onSectionChange`.
 */
export { default as SettingsChatMobileHeader } from './SettingsChatMobileHeader.svelte';

/**
 * Shows whether a parameter is controlled by the UI or by the server default.
 */
export { default as SettingsChatParameterSourceIndicator } from './SettingsChat/SettingsChatParameterSourceIndicator.svelte';

/**
 * Groups related settings under a titled section.
 */
export { default as SettingsGroup } from './SettingsGroup.svelte';

/**
 * Footer with Reset and Save actions for the settings page.
 */
export { default as SettingsFooter } from './SettingsFooter.svelte';

/**
 * Provides UI for importing and exporting chat conversations.
 */
export { default as SettingsChatImportExportTab } from './SettingsChat/SettingsChatImportExportTab.svelte';

/**
 * Section wrapper for import/export sections. Displays a title, description,
 * and optional actions.
 */
export { default as SettingsChatImportExportSection } from './SettingsChat/SettingsChatImportExportSection.svelte';

/**
 * MCP servers management UI.
 */
export { default as SettingsMcpServers } from './SettingsMcpServers.svelte';

/**
 * Renders settings fields for a section from the settings registry.
 */
export { default as SettingsChatFields } from './SettingsChat/SettingsChatFields.svelte';

/**
 * **SettingsChatToolsTab** - Tools configuration tab for chat settings
 */
export { default as SettingsChatToolsTab } from './SettingsChat/SettingsChatToolsTab.svelte';

/** Local API helper: base URL, paths, start command, QR */
export { default as SettingsChatLocalApiTab } from './SettingsChat/SettingsChatLocalApiTab.svelte';
