const fs = require('fs');
let code = fs.readFileSync('framer_globe.js', 'utf8');

// Replace react/jsx-runtime imports with standard react imports, since this is bundled
code = code.replace(/import \{ jsx as _jsx, jsxs as _jsxs \} from "react\/jsx-runtime";/, 'import { createElement as _jsx, createElement as _jsxs } from "react";');
// Wait, `jsx` is not exactly `createElement`. Let's just import from "react/jsx-runtime" but wait, Vite CAN resolve "react/jsx-runtime" if it's a local file!
// Let's just leave the "react/jsx-runtime" import because Vite knows it!
// We just need to remove "framer" import and "addPropertyControls".

code = code.replace(/import \{.*?\} from "framer";/g, '');

const index = code.indexOf('addPropertyControls(OrbitDotGlobe,');
if (index !== -1) {
    code = code.substring(0, index);
}

// Add export default OrbitDotGlobe;
code += '\nexport default OrbitDotGlobe;\n';

fs.writeFileSync('src/components/FramerGlobe.jsx', code);
