#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Renkli konsol çıktısı
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logError(message) {
  log('❌ ' + message, 'red');
}

function logSuccess(message) {
  log('✅ ' + message, 'green');
}

function logWarning(message) {
  log('⚠️ ' + message, 'yellow');
}

function logInfo(message) {
  log('🔍 ' + message, 'blue');
}

// Hata kontrol fonksiyonları
class VercelBuildChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // 1. TypeScript kontrolü
  checkTypeScript() {
    logInfo('TypeScript kontrolü yapılıyor...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      logSuccess('TypeScript hatası bulunamadı');
    } catch (error) {
      const errorMsg = error.stdout?.toString() || error.stderr?.toString();
      this.errors.push('TYPE_SCRIPT_ERROR');
      logError('TypeScript hataları bulundu:');
      console.log(errorMsg);
    }
  }

  // 2. Next.js build kontrolü
  checkNextBuild() {
    logInfo('Next.js build kontrolü yapılıyor...');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      logSuccess('Next.js build başarılı');
    } catch (error) {
      const errorMsg = error.stdout?.toString() || error.stderr?.toString();
      this.errors.push('NEXT_BUILD_ERROR');
      logError('Next.js build hatası:');
      
      // Hataları analiz et
      this.analyzeBuildErrors(errorMsg);
    }
  }

  // 3. Environment variables kontrolü
  checkEnvironmentVariables() {
    logInfo('Environment variables kontrolü yapılıyor...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => 
      !process.env[varName] && !fs.existsSync('.env.local')
    );

    if (missingVars.length > 0) {
      this.warnings.push('MISSING_ENV_VARS');
      logWarning(`Eksik environment variables: ${missingVars.join(', ')}`);
      logWarning('Vercel dashboardda bu değişkenleri eklemeyi unutmayın!');
    } else {
      logSuccess('Environment variables kontrolü başarılı');
    }
  }

  // 4. Package.json dependencies kontrolü
  checkDependencies() {
    logInfo('Dependencies kontrolü yapılıyor...');
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Gerekli dependencies
      const requiredDeps = ['react', 'next', '@supabase/supabase-js'];
      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep]);
      
      if (missingDeps.length > 0) {
        this.errors.push('MISSING_DEPENDENCIES');
        logError(`Eksik dependencies: ${missingDeps.join(', ')}`);
      } else {
        logSuccess('Temel dependencies mevcut');
      }

      // Build script kontrolü
      if (!packageJson.scripts?.build) {
        this.errors.push('MISSING_BUILD_SCRIPT');
        logError('package.json da build scripti bulunamadı');
      }

    } catch (error) {
      this.errors.push('PACKAGE_JSON_ERROR');
      logError('package.json okunamadı');
    }
  }

  // 5. Public dosyaları kontrolü
  checkPublicFiles() {
    logInfo('Public dosyaları kontrol ediliyor...');
    
    const requiredPublicFiles = [
      'favicon.ico',
      'default-avatar.png'
    ];

    requiredPublicFiles.forEach(file => {
      if (!fs.existsSync(path.join('public', file))) {
        this.warnings.push(`MISSING_PUBLIC_FILE_${file.toUpperCase()}`);
        logWarning(`Public dosyası eksik: ${file}`);
      }
    });

    logSuccess('Public dosya kontrolü tamamlandı');
  }

  // 6. API route'ları kontrolü
  checkAPIRoutes() {
    logInfo('API route ları kontrol ediliyor...');
    
    const apiDir = path.join('src', 'app', 'api');
    if (!fs.existsSync(apiDir)) {
      logWarning('API dizini bulunamadı');
      return;
    }

    try {
      const apiFiles = this.getFilesRecursive(apiDir);
      const routeFiles = apiFiles.filter(file => 
        file.endsWith('route.ts') || file.endsWith('route.js')
      );

      routeFiles.forEach(routeFile => {
        const content = fs.readFileSync(routeFile, 'utf8');
        
        // Basit syntax kontrolü
        if (content.includes('export async function') || 
            content.includes('export function') ||
            content.includes('export const')) {
          logSuccess(`✅ API route: ${routeFile}`);
        } else {
          this.warnings.push(`INVALID_API_ROUTE_${path.basename(routeFile)}`);
          logWarning(`Potansiyel API route hatası: ${routeFile}`);
        }
      });

    } catch (error) {
      logWarning('API route kontrolü sırasında hata: ' + error.message);
    }
  }

  // 7. Build hatalarını analiz et
  analyzeBuildErrors(errorOutput) {
    const errors = errorOutput.split('\n');
    
    errors.forEach(line => {
      if (line.includes('Type error') || line.includes('TS')) {
        logError(`TypeScript Hatası: ${line}`);
      } else if (line.includes('Module not found')) {
        logError(`Eksik Modül: ${line}`);
      } else if (line.includes('SyntaxError')) {
        logError(`Syntax Hatası: ${line}`);
      } else if (line.includes('Failed to compile')) {
        // Bu satırı atla, sadece bilgi
      } else if (line.trim()) {
        logWarning(line);
      }
    });
  }

  // Yardımcı fonksiyon: Recursive dosya bulma
  getFilesRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getFilesRecursive(filePath));
      } else {
        results.push(filePath);
      }
    });
    
    return results;
  }

  // Ana kontrol fonksiyonu
  async runAllChecks() {
    log('\n🚀 VERCEL DEPLOY ÖNCESİ HATA KONTROLÜ', 'magenta');
    log('='.repeat(50), 'magenta');
    
    this.checkDependencies();
    this.checkEnvironmentVariables();
    this.checkPublicFiles();
    this.checkAPIRoutes();
    this.checkTypeScript();
    this.checkNextBuild();

    log('\n' + '='.repeat(50), 'magenta');
    this.generateReport();
  }

  // Rapor oluştur
  generateReport() {
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log('\n🎉 TEBRİKLER! Projeniz Vercel deploya hazır!', 'green');
      return;
    }

    if (this.errors.length > 0) {
      log(`\n❌ ${this.errors.length} kritik hata bulundu:`, 'red');
      this.errors.forEach(error => log(`   - ${error}`, 'red'));
      log('\n⚠️  Bu hataları düzeltmeden deploy etmeyin!', 'yellow');
    }

    if (this.warnings.length > 0) {
      log(`\n⚠️  ${this.warnings.length} uyarı bulundu:`, 'yellow');
      this.warnings.forEach(warning => log(`   - ${warning}`, 'yellow'));
      log('\n💡 Bu uyarıları kontrol etmeniz önerilir', 'cyan');
    }

    if (this.errors.length > 0) {
      log('\n🚨 KRİTİK: Hataları düzeltmek için aşağıdaki komutları çalıştırın:', 'red');
      log('   npm run type-check    # TypeScript hatalarını göster', 'cyan');
      log('   npm run build         # Build hatalarını test et', 'cyan');
      log('   npm install           # Eksik dependencies i kontrol et', 'cyan');
    }
  }
}

// Script'i çalıştır
const checker = new VercelBuildChecker();
checker.runAllChecks().catch(console.error);