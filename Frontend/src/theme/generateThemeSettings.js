import fs from 'fs';
import customSettings from './customSettings.js';

const generateScssVariables = (obj, prefix = '') => {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return generateScssVariables(value, `${prefix}-${key}`);
      }
      return `$${prefix}-${key}: ${value};`;
    })
    .join('\n');
};

const scssContent = generateScssVariables(customSettings);

fs.writeFileSync('src/theme/themeColors.scss', scssContent);