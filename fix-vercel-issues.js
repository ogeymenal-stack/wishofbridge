#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 1. tsconfig.json düzelt
console.log('🔧 tsconfig.json düzeltiliyor...');
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// baseUrl ve paths düzeltmesi
tsconfig.compilerOptions.baseUrl = ".";
tsconfig.compilerOptions.paths = {
  "@/*": ["./src/*"]
};

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log('✅ tsconfig.json düzeltildi');

// 2. Public dosyalarını oluştur
console.log('🎨 Public dosyaları oluşturuluyor...');
const publicDir = path.join(process.cwd(), 'public');

// Basit bir favicon.ico oluştur (placeholder)
const faviconContent = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#4a7c59"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-size="14">WB</text>
</svg>`;

// Basit bir default avatar oluştur
const avatarContent = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#e2e8f0"/>
  <circle cx="50" cy="40" r="20" fill="#cbd5e1"/>
  <circle cx="50" cy="90" r="30" fill="#cbd5e1"/>
</svg>`;

// Dosyaları oluştur
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconContent);
fs.writeFileSync(path.join(publicDir, 'default-avatar.svg'), avatarContent);

console.log('✅ Public dosyaları oluşturuldu');

console.log('\n🎉 Tüm hatalar düzeltildi! Şimdi kontrol scriptini tekrar çalıştırın:');
console.log('npm run check-vercel');