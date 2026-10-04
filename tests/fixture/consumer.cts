import catalog = require('@alienhub/agent-atlas');
import icons = require('@alienhub/agent-atlas/icons');
import reactIcons = require('@alienhub/agent-atlas/react');
const app: catalog.CatalogApp | undefined = catalog.getApp('chatgpt');
const icon: icons.AppIconAsset | undefined = icons.getAppIcon('chatgpt');
void [app,icon,reactIcons.AppIcon];
