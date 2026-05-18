import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL?.trim() || "admin@trustnest.local";
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD?.trim() || "TrustNest@Admin1";

// ─── DISTRICTS (all 38, real data from Wikipedia / tn.gov.in) ────────────────
const DISTRICTS = [
  { name: "Ariyalur",        nameTamil: "அரியலூர்",           headquarters: "Ariyalur",        areaSqKm: 2027.6,  population: 754894,  lat: 11.14,  lng: 79.07,  code: "ARI" },
  { name: "Chengalpattu",    nameTamil: "செங்கல்பட்டு",       headquarters: "Chengalpattu",    areaSqKm: 2802.6,  population: 2556244, lat: 12.69,  lng: 79.97,  code: "CHG" },
  { name: "Chennai",         nameTamil: "சென்னை",             headquarters: "Chennai",         areaSqKm: 462.3,   population: 6748026, lat: 13.08,  lng: 80.27,  code: "CHN" },
  { name: "Coimbatore",      nameTamil: "கோயம்புத்தூர்",      headquarters: "Coimbatore",      areaSqKm: 4950.7,  population: 3458045, lat: 11.02,  lng: 76.97,  code: "COI" },
  { name: "Cuddalore",       nameTamil: "கடலூர்",             headquarters: "Cuddalore",       areaSqKm: 3870,    population: 2605914, lat: 11.75,  lng: 79.76,  code: "CUD" },
  { name: "Dharmapuri",      nameTamil: "தர்மபுரி",           headquarters: "Dharmapuri",      areaSqKm: 4735.7,  population: 1506843, lat: 12.12,  lng: 78.16,  code: "DHA" },
  { name: "Dindigul",        nameTamil: "திண்டுக்கல்",        headquarters: "Dindigul",        areaSqKm: 6289.1,  population: 2159775, lat: 10.36,  lng: 77.97,  code: "DIN" },
  { name: "Erode",           nameTamil: "ஈரோடு",              headquarters: "Erode",           areaSqKm: 6036,    population: 2251744, lat: 11.34,  lng: 77.72,  code: "ERO" },
  { name: "Kallakurichi",    nameTamil: "கள்ளக்குறிச்சி",     headquarters: "Kallakurichi",    areaSqKm: 3440.8,  population: 1370281, lat: 11.74,  lng: 78.96,  code: "KAL" },
  { name: "Kancheepuram",    nameTamil: "காஞ்சிபுரம்",        headquarters: "Kancheepuram",    areaSqKm: 1800.2,  population: 1166401, lat: 12.83,  lng: 79.70,  code: "KAC" },
  { name: "Kanyakumari",     nameTamil: "கன்னியாகுமரி",       headquarters: "Nagercoil",       areaSqKm: 1729.2,  population: 1870374, lat: 8.18,   lng: 77.42,  code: "KAY" },
  { name: "Karur",           nameTamil: "கரூர்",              headquarters: "Karur",           areaSqKm: 3022.3,  population: 1064493, lat: 10.96,  lng: 78.08,  code: "KAR" },
  { name: "Krishnagiri",     nameTamil: "கிருஷ்ணகிரி",        headquarters: "Krishnagiri",     areaSqKm: 5414.4,  population: 1883731, lat: 12.52,  lng: 78.21,  code: "KRI" },
  { name: "Madurai",         nameTamil: "மதுரை",              headquarters: "Madurai",         areaSqKm: 3846.4,  population: 3038252, lat: 9.93,   lng: 78.12,  code: "MAD" },
  { name: "Mayiladuthurai",  nameTamil: "மயிலாடுதுறை",        headquarters: "Mayiladuthurai",  areaSqKm: 1237.1,  population: 918356,  lat: 11.10,  lng: 79.65,  code: "MAY" },
  { name: "Nagapattinam",    nameTamil: "நாகப்பட்டினம்",      headquarters: "Nagapattinam",    areaSqKm: 1459,    population: 697069,  lat: 10.76,  lng: 79.84,  code: "NAG" },
  { name: "Namakkal",        nameTamil: "நாமக்கல்",           headquarters: "Namakkal",        areaSqKm: 3573.4,  population: 1726601, lat: 11.22,  lng: 78.17,  code: "NAM" },
  { name: "Nilgiris",        nameTamil: "நீலகிரி",            headquarters: "Ooty",            areaSqKm: 2452.5,  population: 735394,  lat: 11.41,  lng: 76.70,  code: "NIL" },
  { name: "Perambalur",      nameTamil: "பெரம்பலூர்",         headquarters: "Perambalur",      areaSqKm: 1836.6,  population: 565223,  lat: 11.23,  lng: 78.88,  code: "PER" },
  { name: "Pudukkottai",     nameTamil: "புதுக்கோட்டை",       headquarters: "Pudukkottai",     areaSqKm: 4847.8,  population: 1618345, lat: 10.38,  lng: 78.82,  code: "PUD" },
  { name: "Ramanathapuram",  nameTamil: "ராமநாதபுரம்",        headquarters: "Ramanathapuram",  areaSqKm: 4243.1,  population: 1353445, lat: 9.37,   lng: 78.83,  code: "RAM" },
  { name: "Ranipet",         nameTamil: "ராணிப்பேட்டை",       headquarters: "Ranipet",         areaSqKm: 2234.3,  population: 1210277, lat: 12.93,  lng: 79.33,  code: "RAN" },
  { name: "Salem",           nameTamil: "சேலம்",              headquarters: "Salem",           areaSqKm: 5245,    population: 3482056, lat: 11.65,  lng: 78.16,  code: "SAL" },
  { name: "Sivaganga",       nameTamil: "சிவகங்கை",           headquarters: "Sivaganga",       areaSqKm: 4086,    population: 1339101, lat: 9.85,   lng: 78.48,  code: "SIV" },
  { name: "Tenkasi",         nameTamil: "தென்காசி",           headquarters: "Tenkasi",         areaSqKm: 2916.1,  population: 1407627, lat: 8.96,   lng: 77.32,  code: "TEN" },
  { name: "Thanjavur",       nameTamil: "தஞ்சாவூர்",          headquarters: "Thanjavur",       areaSqKm: 3396.6,  population: 2405890, lat: 10.79,  lng: 79.14,  code: "THA" },
  { name: "Theni",           nameTamil: "தேனி",               headquarters: "Theni",           areaSqKm: 3066,    population: 1245899, lat: 10.01,  lng: 77.47,  code: "THE" },
  { name: "Thoothukudi",     nameTamil: "தூத்துக்குடி",       headquarters: "Thoothukudi",     areaSqKm: 4621,    population: 1750176, lat: 8.79,   lng: 78.14,  code: "THO" },
  { name: "Tiruchirappalli", nameTamil: "திருச்சிராப்பள்ளி",   headquarters: "Tiruchirappalli", areaSqKm: 4407,    population: 2722290, lat: 10.81,  lng: 78.69,  code: "TIC" },
  { name: "Tirunelveli",     nameTamil: "திருநெல்வேலி",        headquarters: "Tirunelveli",     areaSqKm: 3842.4,  population: 1665253, lat: 8.73,   lng: 77.70,  code: "TIN" },
  { name: "Tirupathur",      nameTamil: "திருப்பத்தூர்",       headquarters: "Tirupathur",      areaSqKm: 1792.9,  population: 1111812, lat: 12.49,  lng: 78.57,  code: "TIA" },
  { name: "Tiruppur",        nameTamil: "திருப்பூர்",          headquarters: "Tiruppur",        areaSqKm: 5186.3,  population: 2479052, lat: 11.11,  lng: 77.34,  code: "TIP" },
  { name: "Tiruvallur",      nameTamil: "திருவள்ளூர்",         headquarters: "Tiruvallur",      areaSqKm: 3444.2,  population: 3728104, lat: 13.14,  lng: 79.91,  code: "TAL" },
  { name: "Tiruvannamalai",  nameTamil: "திருவண்ணாமலை",        headquarters: "Tiruvannamalai",  areaSqKm: 6191,    population: 2464875, lat: 12.23,  lng: 79.07,  code: "TAN" },
  { name: "Vellore",         nameTamil: "வேலூர்",             headquarters: "Vellore",         areaSqKm: 3862,    population: 1914135, lat: 12.92,  lng: 79.13,  code: "VEL" },
  { name: "Viluppuram",      nameTamil: "விழுப்புரம்",         headquarters: "Viluppuram",      areaSqKm: 7194,    population: 2166478, lat: 11.94,  lng: 79.49,  code: "VIL" },
  { name: "Virudhunagar",    nameTamil: "விருதுநகர்",          headquarters: "Virudhunagar",    areaSqKm: 4283,    population: 1942288, lat: 9.58,   lng: 77.95,  code: "VIR" },
  { name: "Tiruvarur",       nameTamil: "திருவாரூர்",          headquarters: "Tiruvarur",       areaSqKm: 2173,    population: 1264277, lat: 10.77,  lng: 79.63,  code: "TVR" },
];

const DEPARTMENTS = [
  { name: "School Education",                              nameTamil: "பள்ளி கல்வி",                    code: "SCHOOL_EDU" },
  { name: "Higher Education",                             nameTamil: "உயர் கல்வி",                     code: "HIGHER_EDU" },
  { name: "Health and Family Welfare",                    nameTamil: "சுகாதாரம் மற்றும் குடும்ப நலம்",  code: "HEALTH" },
  { name: "Rural Development and Panchayat Raj",          nameTamil: "ஊரக வளர்ச்சி மற்றும் பஞ்சாயத்து", code: "RURAL_DEV" },
  { name: "Social Welfare and Women Empowerment",         nameTamil: "சமூக நலன் மற்றும் பெண்கள் மேம்பாடு", code: "SOCIAL_WELFARE" },
  { name: "Agriculture",                                  nameTamil: "வேளாண்மை",                       code: "AGRICULTURE" },
  { name: "Energy",                                       nameTamil: "ஆற்றல்",                          code: "ENERGY" },
  { name: "Highways and Minor Ports",                     nameTamil: "நெடுஞ்சாலை மற்றும் சிறிய துறைமுகம்", code: "HIGHWAYS" },
  { name: "Public Works",                                 nameTamil: "பொதுப்பணி",                      code: "PWD" },
  { name: "Housing and Urban Development",                nameTamil: "வீட்டுவசதி மற்றும் நகர வளர்ச்சி", code: "HOUSING" },
  { name: "Finance",                                      nameTamil: "நிதி",                            code: "FINANCE" },
  { name: "Revenue and Disaster Management",              nameTamil: "வருவாய் மற்றும் பேரிடர் மேலாண்மை", code: "REVENUE" },
  { name: "Industries",                                   nameTamil: "தொழில்துறை",                     code: "INDUSTRIES" },
  { name: "Transport",                                    nameTamil: "போக்குவரத்து",                    code: "TRANSPORT" },
  { name: "Municipal Administration and Water Supply",    nameTamil: "நகராட்சி நிர்வாகம் மற்றும் நீர் வழங்கல்", code: "MAWS" },
  { name: "Adi Dravidar and Tribal Welfare",              nameTamil: "ஆதி திராவிட மற்றும் பழங்குடி நலன்", code: "ADI_DRAVIDAR" },
  { name: "Backward Classes, Most Backward Classes and Minorities Welfare", nameTamil: "பிற்படுத்தப்பட்டோர் நலன்", code: "BC_MBC" },
  { name: "Animal Husbandry, Dairying and Fisheries",    nameTamil: "கால்நடை வளர்ப்பு மற்றும் மீன்வளம்", code: "ANIMAL_FISHERIES" },
  { name: "Co-operation, Food and Consumer Protection",  nameTamil: "கூட்டுறவு, உணவு மற்றும் நுகர்வோர் பாதுகாப்பு", code: "FOOD_COOP" },
  { name: "Water Resources",                             nameTamil: "நீர்வளம்",                        code: "WATER_RES" },
  { name: "Labour and Employment",                       nameTamil: "தொழிலாளர் மற்றும் வேலைவாய்ப்பு",  code: "LABOUR" },
  { name: "Information Technology and Digital Services", nameTamil: "தகவல் தொழில்நுட்பம்",             code: "IT" },
  { name: "Tourism, Culture and Religious Endowments",   nameTamil: "சுற்றுலா, கலாச்சாரம் மற்றும் அறநிலையம்", code: "TOURISM" },
  { name: "Youth Welfare and Sports Development",        nameTamil: "இளைஞர் நலன் மற்றும் விளையாட்டு",  code: "YOUTH_SPORTS" },
  { name: "Home, Prohibition and Excise",                nameTamil: "உள்துறை மற்றும் மதுவிலக்கு",      code: "HOME" },
  { name: "Law",                                         nameTamil: "சட்டம்",                          code: "LAW" },
  { name: "Planning, Development and Special Initiatives", nameTamil: "திட்டமிடல் மற்றும் வளர்ச்சி",  code: "PLANNING" },
  { name: "Environment and Forests",                     nameTamil: "சுற்றுச்சூழல் மற்றும் காடுகள்",  code: "ENVIRONMENT" },
  { name: "Handlooms, Handicrafts, Textiles and Khadi",  nameTamil: "கைத்தறி, கைவினை மற்றும் ஜவுளி",  code: "HANDLOOMS" },
  { name: "Micro, Small and Medium Enterprises",         nameTamil: "சிறு மற்றும் நடுத்தர நிறுவனங்கள்", code: "MSME" },
  { name: "Commercial Taxes and Registration",           nameTamil: "வணிக வரிகள் மற்றும் பதிவு",       code: "COMMERCIAL_TAX" },
  { name: "Human Resources Management",                  nameTamil: "மனிதவள மேலாண்மை",               code: "HRM" },
  { name: "Social Reforms",                              nameTamil: "சமூக சீர்திருத்தம்",              code: "SOCIAL_REFORMS" },
  { name: "Natural Resources",                           nameTamil: "இயற்கை வளங்கள்",                 code: "NATURAL_RES" },
  { name: "Special Programme Implementation",            nameTamil: "சிறப்பு திட்டம் செயல்படுத்தல்",  code: "SPECIAL_PROG" },
  { name: "Tamil Development and Information",           nameTamil: "தமிழ் வளர்ச்சி மற்றும் தகவல்",   code: "TAMIL_DEV" },
  { name: "Welfare of Differently Abled Persons",        nameTamil: "மாற்றுத்திறனாளிகள் நலன்",         code: "DIFFERENTLY_ABLED" },
  { name: "Public",                                      nameTamil: "பொது",                            code: "PUBLIC" },
  { name: "Public (Elections)",                          nameTamil: "பொது (தேர்தல்)",                  code: "ELECTIONS" },
  { name: "Mudalvarin Mugavari",                         nameTamil: "முதலமைச்சர் அலுவலகம்",            code: "CMO" },
  { name: "Legislative Assembly",                        nameTamil: "சட்டமன்றம்",                     code: "LEGISLATURE" },
  { name: "Miscellaneous Officers, Secretariat",         nameTamil: "பிற அலுவலர்கள், செயலகம்",        code: "MISC" },
  { name: "Other States Government",                     nameTamil: "மற்ற மாநில அரசு",                 code: "OTHER_STATE" },
];

const BUDGET_2024_25 = [
  { deptCode: "SCHOOL_EDU",     total: 54327, released: 49200, spent: 45800, capital: 14795, revenue: 39532 },
  { deptCode: "SOCIAL_WELFARE", total: 34548, released: 32100, spent: 30200, capital: 2000,  revenue: 32548 },
  { deptCode: "AGRICULTURE",    total: 24232, released: 21800, spent: 19400, capital: 3200,  revenue: 21032 },
  { deptCode: "HIGHWAYS",       total: 23828, released: 19400, spent: 17200, capital: 17889, revenue: 5939  },
  { deptCode: "ENERGY",         total: 21606, released: 21200, spent: 21000, capital: 4200,  revenue: 17406 },
  { deptCode: "HEALTH",         total: 19730, released: 17800, spent: 16200, capital: 3500,  revenue: 16230 },
  { deptCode: "RURAL_DEV",      total: 12043, released: 10800, spent: 9600,  capital: 2400,  revenue: 9643  },
  { deptCode: "HIGHER_EDU",     total: 8494,  released: 7800,  spent: 7200,  capital: 1200,  revenue: 7294  },
  { deptCode: "MAWS",           total: 7200,  released: 6400,  spent: 5800,  capital: 3200,  revenue: 4000  },
  { deptCode: "HOUSING",        total: 5800,  released: 4200,  spent: 3500,  capital: 4200,  revenue: 1600  },
];

const SCHEMES = [
  {
    name: "Kalaignar Magalir Urimai Thogai",
    nameTamil: "கலைஞர் மகளிர் உரிமைத் தொகை",
    deptCode: "SOCIAL_WELFARE",
    description: "Monthly cash transfer of ₹1,000 to eligible women above 21 years from families with annual income below ₹2.5 lakh. Launched 15 Sep 2023. 1.31 crore beneficiaries.",
    launchDate: new Date("2023-09-15"),
    beneficiaryCount: 13069831,
    targetCount: 15000000,
    budgetCrore: 13720,
    benefitAmount: 1000,
    benefitFrequency: "monthly",
    eligibility: "Women above 21 years; family income < ₹2.5 lakh/year",
  },
  {
    name: "CM Breakfast Scheme",
    nameTamil: "முதலமைச்சர் காலை உணவு திட்டம்",
    deptCode: "SCHOOL_EDU",
    description: "Free breakfast for government primary school students (Classes 1-5). 20.73 lakh beneficiaries. 30% attendance increase recorded.",
    launchDate: new Date("2022-09-01"),
    beneficiaryCount: 2073000,
    targetCount: 2500000,
    budgetCrore: 600,
    benefitAmount: 0,
    benefitFrequency: "daily",
    eligibility: "Students in government and aided primary schools (Classes 1-5)",
  },
  {
    name: "Makkalai Thedi Maruthuvam",
    nameTamil: "மக்களை தேடி மருத்துவம்",
    deptCode: "HEALTH",
    description: "Doorstep healthcare for hypertension/diabetes patients aged 45+. 1.86 crore beneficiaries. UN Inter-Agency Task Force Award 2024.",
    launchDate: new Date("2021-08-05"),
    beneficiaryCount: 18600000,
    targetCount: 20000000,
    budgetCrore: 1200,
    benefitAmount: 0,
    benefitFrequency: "monthly",
    eligibility: "Residents aged 45+ with hypertension or diabetes",
  },
  {
    name: "Naan Mudhalvan",
    nameTamil: "நான் முதல்வன்",
    deptCode: "HIGHER_EDU",
    description: "Skill development for 10 lakh students/year across 38+ sectors via 350+ centres. UPSC scholarship ₹7,500/month for 1,000 students.",
    launchDate: new Date("2022-03-01"),
    beneficiaryCount: 250000,
    targetCount: 1000000,
    budgetCrore: 360,
    benefitAmount: 7500,
    benefitFrequency: "monthly",
    eligibility: "Students and youth; UPSC track for selected 1,000",
  },
  {
    name: "Illam Thedi Kalvi",
    nameTamil: "இல்லம் தேடி கல்வி",
    deptCode: "SCHOOL_EDU",
    description: "Home-based education for Classes 1-8 to bridge COVID-19 learning gap. 86,550 volunteers (67,961 women) with ₹25,000/month stipend.",
    launchDate: new Date("2021-10-01"),
    beneficiaryCount: 100000,
    targetCount: 150000,
    budgetCrore: 450,
    benefitAmount: 0,
    benefitFrequency: "ongoing",
    eligibility: "Students in Classes 1-8 in government schools",
  },
  {
    name: "Thayumanuvar Scheme",
    nameTamil: "தாயுமானவர் திட்டம்",
    deptCode: "RURAL_DEV",
    description: "Poverty eradication for 5 lakh extremely poor families. Integrates all government assistance.",
    launchDate: new Date("2022-01-01"),
    beneficiaryCount: 320000,
    targetCount: 500000,
    budgetCrore: 27922,
    benefitAmount: 0,
    benefitFrequency: "one-time",
    eligibility: "Extremely poor families identified through social audit",
  },
];

async function main() {
  console.log("🌱 Seeding TN Transparency Platform database...\n");

  console.log("📍 Seeding 38 districts...");
  for (const d of DISTRICTS) {
    await prisma.district.upsert({
      where: { code: d.code },
      update: { name: d.name, nameTamil: d.nameTamil, headquarters: d.headquarters, areaSqKm: d.areaSqKm, population: d.population, latitude: d.lat, longitude: d.lng },
      create: { name: d.name, nameTamil: d.nameTamil, headquarters: d.headquarters, areaSqKm: d.areaSqKm, population: d.population, latitude: d.lat, longitude: d.lng, code: d.code },
    });
  }
  console.log(`   ✅ ${DISTRICTS.length} districts seeded`);

  console.log("🏛️  Seeding 43 departments...");
  for (const dep of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: dep.code },
      update: { name: dep.name, nameTamil: dep.nameTamil },
      create: { name: dep.name, nameTamil: dep.nameTamil, code: dep.code },
    });
  }
  console.log(`   ✅ ${DEPARTMENTS.length} departments seeded`);

  console.log("💰 Seeding budget allocations 2024-25...");
  for (const b of BUDGET_2024_25) {
    const dept = await prisma.department.findUnique({ where: { code: b.deptCode } });
    if (!dept) continue;
    await prisma.budgetAllocation.upsert({
      where: { financialYear_departmentId: { financialYear: "2024-25", departmentId: dept.id } },
      update: { totalAllocation: b.total, released: b.released, spent: b.spent, capitalOutlay: b.capital, revenueExpense: b.revenue },
      create: { financialYear: "2024-25", departmentId: dept.id, totalAllocation: b.total, released: b.released, spent: b.spent, capitalOutlay: b.capital, revenueExpense: b.revenue, source: "tnbudget.tn.gov.in" },
    });
  }
  console.log(`   ✅ ${BUDGET_2024_25.length} department budgets seeded`);

  console.log("📋 Seeding government schemes...");
  for (const s of SCHEMES) {
    const dept = await prisma.department.findUnique({ where: { code: s.deptCode } });
    if (!dept) continue;
    const existing = await prisma.scheme.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.scheme.create({
        data: {
          name: s.name, nameTamil: s.nameTamil, departmentId: dept.id,
          description: s.description, launchDate: s.launchDate,
          beneficiaryCount: s.beneficiaryCount, targetCount: s.targetCount,
          budgetCrore: s.budgetCrore, benefitAmount: s.benefitAmount,
          benefitFrequency: s.benefitFrequency, eligibility: s.eligibility,
          status: "ACTIVE",
        },
      });
    }
  }
  console.log(`   ✅ ${SCHEMES.length} schemes seeded`);

  console.log("🏆 Seeding district scores...");
  const scoreData = [
    { name: "Chennai",         overall: 82, fin: 85, svc: 80, cit: 79, inf: 88, gov: 78, rank: 3 },
    { name: "Coimbatore",      overall: 79, fin: 82, svc: 77, cit: 76, inf: 83, gov: 77, rank: 7 },
    { name: "Madurai",         overall: 74, fin: 76, svc: 73, cit: 72, inf: 78, gov: 71, rank: 12 },
    { name: "Tiruchirappalli", overall: 71, fin: 73, svc: 70, cit: 69, inf: 74, gov: 69, rank: 15 },
    { name: "Salem",           overall: 69, fin: 70, svc: 68, cit: 67, inf: 72, gov: 68, rank: 18 },
  ];
  for (const sc of scoreData) {
    const district = await prisma.district.findFirst({ where: { name: sc.name } });
    if (!district) continue;
    const exists = await prisma.localityScore.findFirst({ where: { districtId: district.id, period: "2024-Q4" } });
    if (!exists) {
      await prisma.localityScore.create({
        data: {
          districtId: district.id, period: "2024-Q4",
          overallScore: sc.overall, financialEfficiency: sc.fin,
          serviceDelivery: sc.svc, citizenImpact: sc.cit,
          infraQuality: sc.inf, govIntegrity: sc.gov,
          districtRank: sc.rank, stateRank: sc.rank,
        },
      });
    }
  }
  console.log(`   ✅ ${scoreData.length} district scores seeded`);

  console.log("⏱️  Seeding SLA records...");
  const slaData = [
    { deptCode: "HEALTH",        kpi: "Grievance Resolution Rate",      kpiTa: "புகார் தீர்வு விகிதம்",     target: 95,  actual: 91,  unit: "%",   status: "VULNERABLE" as const },
    { deptCode: "MAWS",          kpi: "Water Complaints Closed",        kpiTa: "நீர் புகார் தீர்வு",         target: 90,  actual: 88,  unit: "%",   status: "VULNERABLE" as const },
    { deptCode: "HIGHWAYS",      kpi: "Road Projects On Schedule",      kpiTa: "சாலை திட்டம் சரியான நேரம்",  target: 80,  actual: 62,  unit: "%",   status: "JEOPARDY" as const },
    { deptCode: "SCHOOL_EDU",    kpi: "CM Breakfast Scheme Coverage",   kpiTa: "காலை உணவு திட்ட வரம்பு",    target: 100, actual: 100, unit: "%",   status: "ON_TARGET" as const },
    { deptCode: "SOCIAL_WELFARE",kpi: "Magalir Urimai Disbursement",   kpiTa: "மகளிர் உரிமை வழங்கல்",       target: 98,  actual: 99,  unit: "%",   status: "ON_TARGET" as const },
  ];
  for (const sla of slaData) {
    const dept = await prisma.department.findUnique({ where: { code: sla.deptCode } });
    if (!dept) continue;
    const exists = await prisma.sLARecord.findFirst({ where: { departmentId: dept.id, kpiName: sla.kpi, period: "2024-Q4" } });
    if (!exists) {
      await prisma.sLARecord.create({
        data: {
          departmentId: dept.id, kpiName: sla.kpi, kpiNameTamil: sla.kpiTa,
          target: sla.target, actual: sla.actual, unit: sla.unit,
          period: "2024-Q4", status: sla.status,
        },
      });
    }
  }
  console.log(`   ✅ ${slaData.length} SLA records seeded`);

  console.log("👤 Seeding admin user (email/password login)...");
  const adminHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      password: adminHash,
      name: "Platform Admin",
      emailVerified: new Date(),
      isVerified: true,
    },
    create: {
      email: SEED_ADMIN_EMAIL,
      name: "Platform Admin",
      password: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
      isVerified: true,
    },
  });
  console.log(`   ✅ Admin user: ${SEED_ADMIN_EMAIL}`);
  console.log("      Sign in at /login with email + password (not Google).");
  console.log("      Override via SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env");

  console.log("\n✅ Database seeded successfully!");
  console.log("   38 districts · 43 departments · 10 budgets · 6 schemes · 5 scores · 5 SLA records · 1 admin");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
