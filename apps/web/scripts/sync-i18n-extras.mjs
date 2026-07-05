import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const sectionsPath = new URL("../lib/i18n/messages/sections-en.ts", import.meta.url);
const sectionsModule = await import(sectionsPath.href);
const sections = sectionsModule.sections;

function getNested(obj, path) {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) return acc[part];
    return undefined;
  }, obj);
}

function walk(dir, files = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules" && !p.includes(".next"))
      walk(p, files);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
  return files;
}

const keys = new Set();
const patterns = [
  /t\(['"]([^'"]+)['"]/g,
  /labelKey:\s*['"]([^'"]+)['"]/g,
  /titleKey:\s*['"]([^'"]+)['"]/g,
  /descKey:\s*['"]([^'"]+)['"]/g,
  /phaseKey:\s*['"]([^'"]+)['"]/g,
  /valueKey:\s*['"]([^'"]+)['"]/g,
  /subKey:\s*['"]([^'"]+)['"]/g,
  /tierKey:\s*['"]([^'"]+)['"]/g,
  /ctaKey:\s*['"]([^'"]+)['"]/g,
  /qKey:\s*['"]([^'"]+)['"]/g,
  /aKey:\s*['"]([^'"]+)['"]/g,
  /lKey:\s*['"]([^'"]+)['"]/g,
];

for (const f of walk(".")) {
  if (
    f.includes("lib/i18n/messages/") ||
    f.includes("lib/repositories/") ||
    f.includes("app/api/") ||
    f.includes("scripts/")
  )
    continue;
  const s = readFileSync(f, "utf8");
  for (const re of patterns) {
    for (const m of s.matchAll(re)) {
      const k = m[1];
      if (/^[a-z]+\.[a-zA-Z]/.test(k)) keys.add(k);
    }
  }
}

const ALIASES = {
  "homeSections.featureRoutingTitle": "homeSections.featureMultiModel",
  "homeSections.featureRoutingDesc": "homeSections.featureMultiModelDesc",
  "homeSections.featureKeyTitle": "homeSections.featureApiKey",
  "homeSections.featureKeyDesc": "homeSections.featureApiKeyDesc",
  "homeSections.featureBizTitle": "homeSections.featureBusinessOs",
  "homeSections.featureBizDesc": "homeSections.featureBusinessOsDesc",
  "homeSections.computePooledTitle": "homeSections.computePooled",
  "homeSections.computeRoutingTitle": "homeSections.computeRouting",
  "homeSections.computeGercepTitle": "homeSections.computeGercep",
  "homeSections.computeControlTitle": "homeSections.computePrivate",
  "homeSections.computeControlDesc": "homeSections.computePrivateDesc",
  "homeSections.tagGpuPools": "homeSections.computePooledTag1",
  "homeSections.tagNodeLanes": "homeSections.computePooledTag2",
  "homeSections.tagBurstCapacity": "homeSections.computePooledTag3",
  "homeSections.tagDeepSeek": "homeSections.computeRoutingTag1",
  "homeSections.tagGpt": "homeSections.computeRoutingTag2",
  "homeSections.tagClaude": "homeSections.computeRoutingTag3",
  "homeSections.tagQwen": "homeSections.computeRoutingTag3",
  "homeSections.tagWalletSoon": "homeSections.computeGercepTag1",
  "homeSections.tagDailyQuota": "homeSections.computeGercepTag2",
  "homeSections.tagApiKeysLive": "homeSections.computeGercepTag3",
  "homeSections.tagSimpleApi": "homeSections.computePrivateTag1",
  "homeSections.tagProprietaryFabric": "homeSections.computePrivateTag2",
  "homeSections.tierPlayground": "homeSections.lanePlayground",
  "homeSections.tierBuilder": "homeSections.laneBuilder",
  "homeSections.tierNetwork": "homeSections.laneNetwork",
  "homeSections.comingSoon": "homeSections.laneComingSoon",
  "homeSections.endpointChatLabel": "homeSections.endpointChat",
  "homeSections.endpointModelsLabel": "homeSections.endpointModels",
  "homeSections.endpointUsageLabel": "homeSections.endpointUsage",
  "homeSections.faq1Q": "homeSections.faq1q",
  "homeSections.faq1A": "homeSections.faq1a",
  "homeSections.faq2Q": "homeSections.faq2q",
  "homeSections.faq2A": "homeSections.faq2a",
  "homeSections.faq3Q": "homeSections.faq3q",
  "homeSections.faq3A": "homeSections.faq3a",
  "homeSections.faq4Q": "homeSections.faq4q",
  "homeSections.faq4A": "homeSections.faq4a",
  "homeSections.faq5Q": "homeSections.faq5q",
  "homeSections.faq5A": "homeSections.faq5a",
  "homeSections.modelAccessHeadline": "homeSections.modelAccessTitle2",
  "homeSections.computeHeadline": "homeSections.computeTitle",
  "homeSections.pricingHeadline": "homeSections.pricingTitle",
  "homeSections.gatewaySurfaceHeadline": "homeSections.gatewaySurfaceTitle",
  "heroPlayground.apiKeyRequired": "heroPlayground.apiKeyError",
  "heroPlayground.emptyDraft": "heroPlayground.draftPlaceholder",
  "docs.subtitle": "docs.pageSubtitle",
  "docs.quickstartTitle": "docs.quickStart",
  "docs.quickstartStep1": "docs.step1",
  "docs.quickstartStep2": "docs.step2",
  "docs.quickstartStep3": "docs.step3",
  "docs.authTitle": "docs.authentication",
  "docs.authDesc": "docs.authDesc",
  "docs.chatEndpointDesc": "docs.chatCompletionsDesc",
  "docs.nodeSdkDesc": "docs.nodeInstall",
  "docs.pythonSdkDesc": "docs.pythonInstall",
  "docs.modelsEndpointDesc": "docs.modelsDesc",
  "docs.availableModelsTitle": "docs.availableModels",
  "docs.tableModelId": "docs.modelId",
  "docs.tableProvider": "docs.provider",
  "docs.tableStatus": "docs.status",
  "docs.usageTitle": "docs.usageBilling",
  "docs.usageDesc": "docs.usageBillingDesc",
  "docs.errorsTitle": "docs.errors",
  "legal.privacyDataTitle": "legal.privacyCollectTitle",
  "legal.privacyData1": "legal.privacyCollect1",
  "legal.privacyData2": "legal.privacyCollect2",
  "legal.privacyData3": "legal.privacyCollect3",
  "legal.privacyData4": "legal.privacyCollect4",
  "legal.privacyData5": "legal.privacyCollect5",
  "legal.privacyThirdDesc": "legal.privacyThirdBody",
  "legal.privacyRetentionDesc": "legal.privacyRetentionBody",
  "legal.privacyContactDesc": "legal.privacyContactBody",
  "legal.termsServiceDesc": "legal.termsServiceBody",
  "legal.termsResponsibilitiesTitle": "legal.termsAccountTitle",
  "legal.termsKeysTitle": "legal.termsApiTitle",
  "legal.termsKeysDesc": "legal.termsApiBody",
  "legal.termsTokenDesc": "legal.termsTokenBody",
  "legal.termsDisclaimerTitle": "legal.termsLimitTitle",
  "legal.termsDisclaimerDesc": "legal.termsLimitBody",
  "legal.termsChangesTitle": "legal.termsContactTitle",
  "legal.termsChangesDesc": "legal.termsContactBody",
  "business.nameLabel": "business.businessName",
  "business.namePlaceholder": "business.businessNamePlaceholder",
  "business.descriptionLabel": "business.description",
  "business.optional": "common.optional",
  "business.cancel": "common.cancel",
  "business.amount": "business.transactionAmount",
  "business.serialLabel": "business.serialImei",
  "business.unitBuyPrice": "business.buyPriceOptional",
  "business.income": "business.incomeLabel",
  "business.expense": "business.expenseLabel",
  "business.recordTransactionDesc": "business.recordDesc",
  "business.transactionDescPlaceholder": "business.reasonPlaceholder",
  "business.productDescPlaceholder": "business.productDescriptionPlaceholder",
  "business.trackingBulk": "business.bulkStock",
  "business.trackingBulkHint": "business.bulkHint",
  "business.trackingSerial": "business.serialNumber",
  "business.trackingSerialHint": "business.serialHint",
  "business.stockReasonPlaceholder": "business.reasonPlaceholder",
  "dashboard.noBusiness": "dashboard.noBusinessTitle",
  "dashboard.modulesTitle": "dashboard.modulesPlaceholderTitle",
  "dashboard.modulesDesc": "dashboard.modulesPlaceholderDesc",
  "dashboard.awaitingProcess": "dashboard.waitingProcess",
  "sidebar.gateway": "sidebar.gatewayLink",
  "settings.businessTitle": "settings.businessSettings",
  "produksi.moduleTitle": "produksi.title",
  "produksi.moduleDesc": "produksi.subtitle",
  "produksi.comingSoon": "settings.comingSoon",
  "produksi.gatewayLink": "produksi.openDevelopers",
};

const EXTRAS_EN = {
  "homeSections.browseModels": "Browse models",
  "homeSections.createKey": "Create key",
  "homeSections.openPlaygroundCta": "Open playground",
  "homeSections.readQuickstart": "Read quickstart",
  "homeSections.footerVersion": "local preview · v0.1",
  "heroPlayground.apiView": "API view →",
  "heroPlayground.apiKeyPlaceholder": "sk-gercep-...",
  "docs.quickstartStep2Suffix": " or hit the API directly",
  "docs.chatEndpointTitle": "POST /api/v1/chat/completions",
  "docs.nodeSdkTitle": "OpenAI SDK — Node.js",
  "docs.pythonSdkTitle": "OpenAI SDK — Python",
  "docs.modelsEndpointTitle": "GET /api/v1/models",
  "docs.usageSuffix": "Billing credits & $GERCEP — coming soon.",
  "legal.termsResponsibility1":
    "Keep your account credentials and API keys secure.",
  "legal.termsResponsibility2":
    "Do not share plain API keys publicly or commit them to git.",
  "legal.termsResponsibility3":
    "Comply with applicable laws and provider acceptable-use policies.",
  "legal.termsResponsibility4":
    "Do not abuse the gateway (spam, illegal content, credential stuffing).",
  "business.amountPlaceholder": "e.g. 500000",
  "business.noCategory": "No category",
  "business.newCategory": "New category",
  "inventory.loadingBusiness": "Loading business data...",
  "inventory.noBusiness": "No business yet",
  "inventory.noBusinessDesc": "Create a business on the Dashboard first.",
  "inventory.goToDashboard": "Go to Dashboard",
  "inventory.loadingProducts": "Loading products...",
  "inventory.productCount": "{count} products",
  "inventory.noProductsDesc": "Add your first product to start tracking inventory.",
  "inventory.addFirstProduct": "+ Add first product",
  "inventory.table.product": "Product",
  "inventory.table.category": "Category",
  "inventory.table.type": "Type",
  "inventory.table.stock": "Stock",
  "inventory.table.sellPrice": "Sell price",
  "inventory.table.actions": "Actions",
  "inventory.type.serial": "Serial",
  "inventory.type.stock": "Stock",
  "inventory.editAria": "Edit {name}",
  "inventory.deleteAria": "Delete {name}",
  "transactions.loadingBusiness": "Loading business data...",
  "transactions.noBusiness": "No business yet",
  "transactions.noBusinessDesc": "Create a business on the Dashboard first.",
  "transactions.goToDashboard": "Go to Dashboard",
  "transactions.loadingTransactions": "Loading transactions...",
  "transactions.transactionCount": "{count} transactions",
  "transactions.totalIncome": "Total income",
  "transactions.totalExpense": "Total expense",
  "transactions.noTransactionsDesc":
    "Record your first transaction to track cash flow.",
  "transactions.addFirstTransaction": "+ Record first transaction",
  "transactions.table.date": "Date",
  "transactions.table.type": "Type",
  "transactions.table.category": "Category",
  "transactions.table.description": "Description",
  "transactions.table.amount": "Amount",
  "transactions.type.income": "Income",
  "transactions.type.expense": "Expense",
  "settings.businessDesc":
    "Business profile, team members, and integrations — coming soon. Gateway settings live at",
};

const EXTRAS_ID = {
  "homeSections.browseModels": "Jelajahi model",
  "homeSections.createKey": "Buat key",
  "homeSections.openPlaygroundCta": "Buka playground",
  "homeSections.readQuickstart": "Baca quickstart",
  "homeSections.footerVersion": "local preview · v0.1",
  "heroPlayground.apiView": "API view →",
  "heroPlayground.apiKeyPlaceholder": "sk-gercep-...",
  "docs.quickstartStep2Suffix": " atau langsung hit API",
  "docs.chatEndpointTitle": "POST /api/v1/chat/completions",
  "docs.nodeSdkTitle": "OpenAI SDK — Node.js",
  "docs.pythonSdkTitle": "OpenAI SDK — Python",
  "docs.modelsEndpointTitle": "GET /api/v1/models",
  "docs.usageSuffix": "Billing credits & $GERCEP — coming soon.",
  "legal.termsResponsibility1": "Jaga kredensial akun dan API key kamu.",
  "legal.termsResponsibility2":
    "Jangan share plain API key di publik atau commit ke git.",
  "legal.termsResponsibility3":
    "Patuhi hukum yang berlaku dan kebijakan acceptable use provider.",
  "legal.termsResponsibility4":
    "Jangan abuse gateway (spam, konten ilegal, credential stuffing).",
  "business.amountPlaceholder": "cth. 500000",
  "business.noCategory": "Tanpa kategori",
  "business.newCategory": "Kategori baru",
  "inventory.loadingBusiness": "Memuat data bisnis...",
  "inventory.noBusiness": "Belum ada bisnis",
  "inventory.noBusinessDesc": "Buat bisnis di Dashboard dulu.",
  "inventory.goToDashboard": "Ke Dashboard",
  "inventory.loadingProducts": "Memuat produk...",
  "inventory.productCount": "{count} produk",
  "inventory.noProductsDesc": "Tambah produk pertama untuk mulai track inventory.",
  "inventory.addFirstProduct": "+ Tambah produk pertama",
  "inventory.table.product": "Produk",
  "inventory.table.category": "Kategori",
  "inventory.table.type": "Tipe",
  "inventory.table.stock": "Stok",
  "inventory.table.sellPrice": "Harga jual",
  "inventory.table.actions": "Aksi",
  "inventory.type.serial": "Serial",
  "inventory.type.stock": "Stok",
  "inventory.editAria": "Edit {name}",
  "inventory.deleteAria": "Hapus {name}",
  "transactions.loadingBusiness": "Memuat data bisnis...",
  "transactions.noBusiness": "Belum ada bisnis",
  "transactions.noBusinessDesc": "Buat bisnis di Dashboard dulu.",
  "transactions.goToDashboard": "Ke Dashboard",
  "transactions.loadingTransactions": "Memuat transaksi...",
  "transactions.transactionCount": "{count} transaksi",
  "transactions.totalIncome": "Total pemasukan",
  "transactions.totalExpense": "Total pengeluaran",
  "transactions.noTransactionsDesc":
    "Catat transaksi pertama untuk track arus kas.",
  "transactions.addFirstTransaction": "+ Catat transaksi pertama",
  "transactions.table.date": "Tanggal",
  "transactions.table.type": "Tipe",
  "transactions.table.category": "Kategori",
  "transactions.table.description": "Keterangan",
  "transactions.table.amount": "Jumlah",
  "transactions.type.income": "Pemasukan",
  "transactions.type.expense": "Pengeluaran",
  "settings.businessDesc":
    "Profil bisnis, anggota tim, dan integrasi — coming soon. Pengaturan gateway ada di",
};

const missing = [];
for (const key of [...keys].sort()) {
  const resolved = ALIASES[key] ?? key;
  const fromExtra = EXTRAS_EN[key] ?? EXTRAS_EN[resolved];
  if (fromExtra) continue;
  const v = getNested(sections, resolved);
  if (typeof v === "string" && v !== "") continue;
  missing.push(key);
}

console.log("Still missing:", missing.length);
if (missing.length) console.log(missing.join("\n"));

writeFileSync(
  new URL("../lib/i18n/key-aliases.ts", import.meta.url),
  `export const KEY_ALIASES: Record<string, string> = ${JSON.stringify(ALIASES, null, 2)};\n`
);
writeFileSync(
  new URL("../lib/i18n/messages/extras-en.ts", import.meta.url),
  `export const EXTRAS_EN: Record<string, string> = ${JSON.stringify(EXTRAS_EN, null, 2)};\n`
);
writeFileSync(
  new URL("../lib/i18n/messages/extras-id.ts", import.meta.url),
  `export const EXTRAS_ID: Record<string, string> = ${JSON.stringify(EXTRAS_ID, null, 2)};\n`
);
