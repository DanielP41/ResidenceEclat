/**
 * Script para generar iconos PWA
 *
 * Uso:
 *   1. npm install sharp --save-dev
 *   2. node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Si sharp está disponible, usarlo. Si no, dar instrucciones.
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log('⚠️  Sharp no está instalado.');
    console.log('');
    console.log('Para generar los iconos automáticamente:');
    console.log('  npm install sharp --save-dev');
    console.log('  node scripts/generate-icons.js');
    console.log('');
    console.log('O genera los iconos manualmente:');
    console.log('  1. Abre public/icons/icon.svg en un editor de imágenes');
    console.log('  2. Exporta en los siguientes tamaños:');
    console.log('     - icon-72x72.png');
    console.log('     - icon-96x96.png');
    console.log('     - icon-128x128.png');
    console.log('     - icon-144x144.png');
    console.log('     - icon-152x152.png');
    console.log('     - icon-192x192.png');
    console.log('     - icon-384x384.png');
    console.log('     - icon-512x512.png');
    console.log('');
    console.log('O usa una herramienta online como:');
    console.log('  https://realfavicongenerator.net/');
    process.exit(0);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
    console.log('🎨 Generando iconos PWA...');

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
        await sharp(inputSvg)
            .resize(size, size)
            .png()
            .toFile(outputPath);
        console.log(`  ✅ icon-${size}x${size}.png`);
    }

    console.log('');
    console.log('✨ Iconos generados exitosamente!');
}

generateIcons().catch(console.error);
