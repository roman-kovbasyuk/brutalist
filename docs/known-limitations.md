# Known limitations

These are current behavior boundaries, not promises of future implementation:

- `CommandMenu` provides modal search, optional global shortcut handling, grouped results, and keyboard selection. The application owns command availability, execution, and ordinary navigation alternatives.
- `DigitInput` is a fixed-length numeric string field with paste filtering and native autofill support; submission, expiry, resend, and server validation remain application responsibilities.
- `Avatar` falls back to initials when its source is missing or fails; the application owns image URLs and identity data.
- `TabMenuVertical` is a navigation pattern and does not claim the complete WAI-ARIA tabs interaction model.
- `ProgressRing` is a progressbar-style indicator, not a capacity meter with domain-specific semantics.
- `Toast` and `Notification` render messages; queueing, persistence, and delivery policy belong to the application.
- `Table` renders the supplied rows and columns; sorting, pagination, and data fetching belong to the application.

- Charts (`LineChart`, `BarChart`) plot values from zero; negative values are drawn as zero. Categories must be unique. `DonutChart` segments respond to the pointer only; its legend and table view carry every value for keyboard and screen-reader users.
- `BarList` names its first column “Name”.
- `Dialog` and `Drawer` always render their own trigger button; they cannot be opened from an existing button elsewhere on the page.
- `Menu` cannot mark an item as selected; show the current choice in the trigger label.
- `Table` headers are text only (no select-all checkbox in the header), and there is no stacked phone layout; switch to a card list in the application.
- There is no checkbox-group, timeline, button-only file picker or link-styled button component.
- The dark theme (`AtomsRoot theme="dark"`) is a preview: light is the reviewed theme.

Examples and usage guidance describe only behavior the current public API supports. Accessibility and product requirements still need validation in the consuming application.
