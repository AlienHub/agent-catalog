import catalog = require('@alienhub/agent-catalog');
import icons = require('@alienhub/agent-catalog/icons');
import reactIcons = require('@alienhub/agent-catalog/react');
const app: catalog.CatalogApp | undefined = catalog.getApp('chatgpt');
const icon: icons.AppIconAsset | undefined = icons.getAppIcon('chatgpt');
void [app,icon,reactIcons.AppIcon];
