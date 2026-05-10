/**
 * Tamil Nadu Area Hierarchy — maintainable local data file
 * Structure: District → Block (Panchayat Union / Zone) → Locality (Village Panchayat / Town / Ward)
 *
 * To add more localities: follow the pattern below and add entries under the relevant block.
 * Type codes: VP = Village Panchayat, TP = Town Panchayat, M = Municipality, Corp = Corporation, W = Ward
 */

export type LocalityType = "VP" | "TP" | "M" | "Corp" | "W";

export interface Locality {
  id: string;
  name: string;
  nameTa: string;
  type: LocalityType;
}

export interface Block {
  id: string;
  name: string;
  nameTa: string;
  localities: Locality[];
}

export interface District {
  id: string;
  name: string;
  nameTa: string;
  blocks: Block[];
}

const vp  = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "VP" });
const tp  = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "TP" });
const m   = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "M"  });
const w   = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "W"  });

export const TN_DISTRICTS: District[] = [

  /* ─────────────────────────── 01. ARIYALUR ─────────────────────────── */
  {
    id: "ariyalur", name: "Ariyalur", nameTa: "அரியலூர்",
    blocks: [
      { id: "ariyalur-ariyalur", name: "Ariyalur", nameTa: "அரியலூர்", localities: [
        m ("ari-ariyalur-m",   "Ariyalur Town",   "அரியலூர் நகரம்"),
        vp("ari-vengalam",     "Vengalam",         "வேங்கலம்"),
        vp("ari-jayamkondam",  "Jayamkondam",      "ஜெயங்கொண்டம்"),
        vp("ari-sendurai",     "Sendurai",         "செந்துறை"),
        vp("ari-kiliyur",      "Kiliyur",          "கிளியூர்"),
        vp("ari-veppur",       "Veppur",           "வேப்பூர்"),
      ]},
      { id: "ariyalur-udayarpalayam", name: "Udayarpalayam", nameTa: "உடையார்பாளையம்", localities: [
        tp("ari-udayar",       "Udayarpalayam",    "உடையார்பாளையம்"),
        vp("ari-thirumanur",   "Thirumanur",       "திருமணூர்"),
        vp("ari-andimadam",    "Andimadam",        "ஆண்டிமடம்"),
        vp("ari-vilangudi",    "Vilangudi",        "விலங்குடி"),
        vp("ari-thandalam",    "Thandalam",        "தண்டலம்"),
      ]},
      { id: "ariyalur-perambalur", name: "T. Palur", nameTa: "தி. பாலூர்", localities: [
        vp("ari-palur",        "T. Palur",         "தி. பாலூர்"),
        vp("ari-nochili",      "Nochili",          "நொச்சிலி"),
        vp("ari-killukkottai", "Killukkottai",     "கிள்ளுக்கோட்டை"),
      ]},
    ],
  },

  /* ────────────────────────── 02. CHENGALPATTU ──────────────────────── */
  {
    id: "chengalpattu", name: "Chengalpattu", nameTa: "செங்கல்பட்டு",
    blocks: [
      { id: "chgl-chengalpattu", name: "Chengalpattu", nameTa: "செங்கல்பட்டு", localities: [
        m ("chgl-cgpt-m",       "Chengalpattu Municipality", "செங்கல்பட்டு நகராட்சி"),
        vp("chgl-madurantakam",  "Madurantakam",   "மதுராந்தகம்"),
        vp("chgl-lathur",        "Lathur",          "லத்தூர்"),
        vp("chgl-kadapakkam",    "Kadapakkam",      "கடப்பாக்கம்"),
      ]},
      { id: "chgl-tambaram", name: "Tambaram", nameTa: "தாம்பரம்", localities: [
        m ("chgl-tambaram-m",    "Tambaram Municipality",  "தாம்பரம் நகராட்சி"),
        tp("chgl-pallavaram",    "Pallavaram",     "பல்லாவரம்"),
        tp("chgl-chrompet",      "Chromepet",      "குரோம்பேட்டை"),
        vp("chgl-mudichur",      "Mudichur",        "முடிச்சூர்"),
        vp("chgl-perungalathur", "Perungalathur",   "பெருங்களத்தூர்"),
      ]},
      { id: "chgl-kancheepuram-bl", name: "Kancheepuram Block", nameTa: "காஞ்சிபுரம் வட்டம்", localities: [
        m ("chgl-kanchi-m",      "Kancheepuram Municipality", "காஞ்சிபுரம் நகராட்சி"),
        vp("chgl-sriperumbudur", "Sriperumbudur",  "ஸ்ரீபெரும்புதூர்"),
        vp("chgl-walajabad",     "Walajabad",      "வாலாஜாபாத்"),
        vp("chgl-uthiramerur",   "Uthiramerur",    "உத்திரமேரூர்"),
      ]},
      { id: "chgl-mahabs", name: "Mahabalipuram", nameTa: "மாமல்லபுரம்", localities: [
        tp("chgl-mahabalipuram", "Mahabalipuram",  "மாமல்லபுரம்"),
        vp("chgl-thirukazhukundram", "Thirukazhukundram", "திருக்களுகுண்றம்"),
        vp("chgl-kovalam",       "Kovalam",         "கோவளம்"),
        vp("chgl-panaiyur",      "Panaiyur",        "பனையூர்"),
      ]},
    ],
  },

  /* ───────────────────────────── 03. CHENNAI ────────────────────────── */
  {
    id: "chennai", name: "Chennai", nameTa: "சென்னை",
    blocks: [
      { id: "chn-zone1", name: "Zone 1 – Thiruvottiyur", nameTa: "மண்டலம் 1 – திருவொற்றியூர்", localities: [
        w("chn-thiruvottiyur",   "Thiruvottiyur",      "திருவொற்றியூர்"),
        w("chn-kaladipet",       "Kaladipet",           "கலாடிப்பேட்டை"),
        w("chn-red-hills",       "Red Hills",           "சிவப்பு மலை"),
        w("chn-madhavaram",      "Madhavaram",          "மாதவரம்"),
      ]},
      { id: "chn-zone2", name: "Zone 2 – Manali", nameTa: "மண்டலம் 2 – மணலி", localities: [
        w("chn-manali",          "Manali",              "மணலி"),
        w("chn-korrukupet",      "Korukkupet",          "கொருக்குப்பேட்டை"),
        w("chn-tiruvallur-rd",   "Tiruvallur Road",     "திருவள்ளூர் சாலை"),
      ]},
      { id: "chn-zone3", name: "Zone 3 – Ambattur", nameTa: "மண்டலம் 3 – அம்பத்தூர்", localities: [
        w("chn-ambattur",        "Ambattur",            "அம்பத்தூர்"),
        w("chn-avadi",           "Avadi",               "ஆவடி"),
        w("chn-pattabiram",      "Pattabiram",          "பட்டாபிராம்"),
        w("chn-thiruverkadu",    "Thiruverkadu",        "திருவேற்காடு"),
      ]},
      { id: "chn-zone4", name: "Zone 4 – Anna Nagar", nameTa: "மண்டலம் 4 – அண்ணா நகர்", localities: [
        w("chn-anna-nagar",      "Anna Nagar",          "அண்ணா நகர்"),
        w("chn-mogappair",       "Mogappair",           "மோகப்பேர்"),
        w("chn-kolathur",        "Kolathur",            "கொலத்தூர்"),
        w("chn-villivakkam",     "Villivakkam",         "விலிவாக்கம்"),
      ]},
      { id: "chn-zone5", name: "Zone 5 – Teynampet", nameTa: "மண்டலம் 5 – தேனாம்பேட்டை", localities: [
        w("chn-teynampet",       "Teynampet",           "தேனாம்பேட்டை"),
        w("chn-tnagar",          "T. Nagar",            "டி. நகர்"),
        w("chn-kodambakkam",     "Kodambakkam",         "கோடம்பாக்கம்"),
        w("chn-vadapalani",      "Vadapalani",          "வடபழனி"),
        w("chn-ashok-nagar",     "Ashok Nagar",         "அசோக் நகர்"),
      ]},
      { id: "chn-zone6", name: "Zone 6 – Adyar", nameTa: "மண்டலம் 6 – அடையாறு", localities: [
        w("chn-adyar",           "Adyar",               "அடையாறு"),
        w("chn-velachery",       "Velachery",           "வேளச்சேரி"),
        w("chn-guindy",          "Guindy",              "கிண்டி"),
        w("chn-perungudi",       "Perungudi",           "பெருங்குடி"),
        w("chn-pallikaranai",    "Pallikaranai",        "பள்ளிக்கரணை"),
      ]},
      { id: "chn-zone7", name: "Zone 7 – Sholinganallur", nameTa: "மண்டலம் 7 – சோளிங்கநல்லூர்", localities: [
        w("chn-sholinganallur",  "Sholinganallur",      "சோளிங்கநல்லூர்"),
        w("chn-perumbakkam",     "Perumbakkam",         "பெரும்பாக்கம்"),
        w("chn-medavakkam",      "Medavakkam",          "மேடவாக்கம்"),
        w("chn-karapakkam",      "Karapakkam",          "காரப்பாக்கம்"),
        w("chn-kottivakkam",     "Kottivakkam",         "கோட்டிவாக்கம்"),
      ]},
    ],
  },

  /* ──────────────────────────── 04. COIMBATORE ──────────────────────── */
  {
    id: "coimbatore", name: "Coimbatore", nameTa: "கோயம்புத்தூர்",
    blocks: [
      { id: "cbe-north", name: "Coimbatore North", nameTa: "கோயம்புத்தூர் வடக்கு", localities: [
        w("cbe-ganapathy",       "Ganapathy",       "கணபதி"),
        w("cbe-saravanampatti",  "Saravanampatti",  "சரவணம்பட்டி"),
        w("cbe-singanallur",     "Singanallur",     "சிங்காநல்லூர்"),
        w("cbe-peelamedu",       "Peelamedu",       "பீலமேடு"),
        vp("cbe-kalapatti",      "Kalapatti",       "கலப்பட்டி"),
      ]},
      { id: "cbe-south", name: "Coimbatore South", nameTa: "கோயம்புத்தூர் தெற்கு", localities: [
        w("cbe-rspuram",         "R.S. Puram",      "ஆர்.எஸ். புரம்"),
        w("cbe-gandhipuram",     "Gandhipuram",     "காந்திபுரம்"),
        w("cbe-race-course",     "Race Course",     "ரேஸ் கோர்ஸ்"),
        vp("cbe-thudiyalur",     "Thudiyalur",      "துடியலூர்"),
        vp("cbe-podanur",        "Podanur",         "போடநூர்"),
      ]},
      { id: "cbe-pollachi", name: "Pollachi", nameTa: "பொள்ளாச்சி", localities: [
        m ("cbe-pollachi-m",     "Pollachi",        "பொள்ளாச்சி"),
        vp("cbe-anamalai",       "Anamalai",        "அணைமலை"),
        vp("cbe-udumalaipettai", "Udumalaipettai",  "உடுமலைப்பேட்டை"),
        vp("cbe-valparai",       "Valparai",        "வால்பாறை"),
        vp("cbe-kinathukadavu",  "Kinathukadavu",   "கினத்துக்கடவு"),
      ]},
      { id: "cbe-sulur", name: "Sulur", nameTa: "சூலூர்", localities: [
        tp("cbe-sulur-tp",       "Sulur",           "சூலூர்"),
        vp("cbe-irugur",         "Irugur",          "இருகூர்"),
        vp("cbe-avinashi",       "Avinashi",        "அவிநாசி"),
        vp("cbe-tirupur-rd",     "Tirupur Road",    "திருப்பூர் சாலை"),
      ]},
      { id: "cbe-mettupalayam", name: "Mettupalayam", nameTa: "மேட்டுப்பாளையம்", localities: [
        m ("cbe-mettu-m",        "Mettupalayam",    "மேட்டுப்பாளையம்"),
        vp("cbe-kotagiri-rd",    "Kotagiri Road",   "கோத்தகிரி சாலை"),
        vp("cbe-sirumugai",      "Sirumugai",       "சிறுமுகை"),
        vp("cbe-negamam",        "Negamam",         "நெகமம்"),
      ]},
    ],
  },

  /* ──────────────────────────── 05. CUDDALORE ───────────────────────── */
  {
    id: "cuddalore", name: "Cuddalore", nameTa: "கடலூர்",
    blocks: [
      { id: "cdl-cuddalore", name: "Cuddalore", nameTa: "கடலூர்", localities: [
        m ("cdl-cuddalore-m",    "Cuddalore Municipality", "கடலூர் நகராட்சி"),
        tp("cdl-panruti",        "Panruti",         "பண்ருட்டி"),
        vp("cdl-titilaiyur",     "Titilaiyur",      "திட்டிலையூர்"),
        vp("cdl-vriddhachalam",  "Vriddhachalam",   "விருத்தாசலம்"),
      ]},
      { id: "cdl-chidambaram", name: "Chidambaram", nameTa: "சிதம்பரம்", localities: [
        m ("cdl-chidambaram-m",  "Chidambaram",     "சிதம்பரம்"),
        tp("cdl-sirkali",        "Sirkali",         "சீர்காழி"),
        vp("cdl-bhuvanagiri",    "Bhuvanagiri",     "புவனகிரி"),
        vp("cdl-kattumanarkoil", "Kattumanarkoil",  "கட்டுமன்னார்கோவில்"),
        vp("cdl-annamalainagar", "Annamalai Nagar", "அண்ணாமலை நகர்"),
      ]},
      { id: "cdl-neyveli", name: "Neyveli", nameTa: "நெய்வேலி", localities: [
        tp("cdl-neyveli-tp",     "Neyveli",         "நெய்வேலி"),
        vp("cdl-manampadi",      "Manampadi",       "மணம்பாடி"),
        vp("cdl-kudikadu",       "Kudikadu",        "குடிகாடு"),
        vp("cdl-kammapuram",     "Kammapuram",      "கம்மாபுரம்"),
      ]},
      { id: "cdl-tittagudi", name: "Tittagudi", nameTa: "திட்டக்குடி", localities: [
        tp("cdl-tittagudi-tp",   "Tittagudi",       "திட்டக்குடி"),
        vp("cdl-kurinjipadi",    "Kurinjipadi",     "குறிஞ்சிப்பாடி"),
        vp("cdl-thittakudi-vp",  "Mangalur",        "மங்களூர்"),
      ]},
    ],
  },

  /* ─────────────────────────── 06. DHARMAPURI ───────────────────────── */
  {
    id: "dharmapuri", name: "Dharmapuri", nameTa: "தர்மபுரி",
    blocks: [
      { id: "dhp-dharmapuri", name: "Dharmapuri", nameTa: "தர்மபுரி", localities: [
        m ("dhp-dharmapuri-m",   "Dharmapuri Municipality", "தர்மபுரி நகராட்சி"),
        vp("dhp-pennagaram",     "Pennagaram",      "பெண்ணாகரம்"),
        vp("dhp-morappur",       "Morappur",        "மோரப்பூர்"),
        vp("dhp-pappireddipatti","Pappireddipatti", "பாப்பிரெட்டிபட்டி"),
      ]},
      { id: "dhp-hosur-bl", name: "Hosur Block", nameTa: "ஓசூர் வட்டம்", localities: [
        m ("dhp-hosur-m",        "Hosur",           "ஓசூர்"),
        vp("dhp-kelamangalam",   "Kelamangalam",    "கேளம்பாக்கம்"),
        vp("dhp-mathur",         "Mathur",          "மாத்தூர்"),
        vp("dhp-bargur",         "Bargur",          "பர்கூர்"),
      ]},
      { id: "dhp-krishnagiri-bl", name: "Krishnagiri Block", nameTa: "கிருஷ்ணகிரி வட்டம்", localities: [
        m ("dhp-krishnagiri-m",  "Krishnagiri",     "கிருஷ்ணகிரி"),
        vp("dhp-shoolagiri",     "Shoolagiri",      "சூலகிரி"),
        vp("dhp-pochampalli",    "Pochampalli",     "பொச்சம்பள்ளி"),
        vp("dhp-denkanikottai",  "Denkanikottai",   "தேன்கனிக்கோட்டை"),
      ]},
    ],
  },

  /* ──────────────────────────── 07. DINDIGUL ────────────────────────── */
  {
    id: "dindigul", name: "Dindigul", nameTa: "திண்டுக்கல்",
    blocks: [
      { id: "dgl-dindigul", name: "Dindigul", nameTa: "திண்டுக்கல்", localities: [
        m ("dgl-dindigul-m",     "Dindigul Municipality", "திண்டுக்கல் நகராட்சி"),
        vp("dgl-natham",         "Natham",          "நாதம்"),
        vp("dgl-batlagundu",     "Batlagundu",      "பட்லகுண்டு"),
        vp("dgl-oddanchatram",   "Oddanchatram",    "ஒட்டன்சத்திரம்"),
      ]},
      { id: "dgl-palani", name: "Palani", nameTa: "பழனி", localities: [
        m ("dgl-palani-m",       "Palani",          "பழனி"),
        vp("dgl-udumalpet",      "Udumalpet",       "உடுமலைப்பேட்டை"),
        vp("dgl-vedasandur",     "Vedasandur",      "வேடசந்தூர்"),
        vp("dgl-dharapuram",     "Dharapuram",      "தாராபுரம்"),
      ]},
      { id: "dgl-kodaikanal", name: "Kodaikanal", nameTa: "கொடைக்கானல்", localities: [
        m ("dgl-kodaikanal-m",   "Kodaikanal",      "கொடைக்கானல்"),
        vp("dgl-mannavanur",     "Mannavanur",      "மண்ணவனூர்"),
        vp("dgl-perumalmalai",   "Perumalmalai",    "பெருமாள் மலை"),
        vp("dgl-poombarai",      "Poombarai",       "பூம்பாறை"),
      ]},
    ],
  },

  /* ─────────────────────────────── 08. ERODE ────────────────────────── */
  {
    id: "erode", name: "Erode", nameTa: "ஈரோடு",
    blocks: [
      { id: "erd-erode", name: "Erode", nameTa: "ஈரோடு", localities: [
        m ("erd-erode-m",        "Erode Municipality",  "ஈரோடு நகராட்சி"),
        vp("erd-perundurai",     "Perundurai",      "பெருந்துறை"),
        vp("erd-bhavani",        "Bhavani",         "பவானி"),
        vp("erd-thindal",        "Thindal",         "திண்டல்"),
        vp("erd-kavundampalayam","Kavundampalayam",  "கவுண்டம்பாளையம்"),
      ]},
      { id: "erd-gobichettipalayam", name: "Gobichettipalayam", nameTa: "கோபிசெட்டிபாளையம்", localities: [
        m ("erd-gobi-m",         "Gobichettipalayam","கோபிசெட்டிபாளையம்"),
        vp("erd-anthiyur",       "Anthiyur",        "அந்தியூர்"),
        vp("erd-sathyamangalam", "Sathyamangalam",  "சத்தியமங்கலம்"),
        vp("erd-bargur-e",       "Bargur",          "பர்கூர்"),
      ]},
      { id: "erd-tiruppur-bl", name: "Tiruppur Block", nameTa: "திருப்பூர் வட்டம்", localities: [
        m ("erd-tiruppur-m",     "Tiruppur",        "திருப்பூர்"),
        vp("erd-kangeyam",       "Kangeyam",        "கங்கேயம்"),
        vp("erd-palladam-e",     "Palladam",        "பல்லடம்"),
        vp("erd-uthukuli",       "Uthukuli",        "உத்துக்குளி"),
      ]},
    ],
  },

  /* ─────────────────────────── 09. KALLAKURICHI ─────────────────────── */
  {
    id: "kallakurichi", name: "Kallakurichi", nameTa: "கள்ளக்குறிச்சி",
    blocks: [
      { id: "kal-kallakurichi", name: "Kallakurichi", nameTa: "கள்ளக்குறிச்சி", localities: [
        m ("kal-kal-m",          "Kallakurichi",    "கள்ளக்குறிச்சி"),
        vp("kal-ulundurpettai",  "Ulundurpettai",   "உளுந்தூர்பேட்டை"),
        vp("kal-sankarapuram",   "Sankarapuram",    "சங்கரபுரம்"),
        vp("kal-chinnasalem",    "Chinnasalem",     "சின்னசேலம்"),
      ]},
      { id: "kal-vridhachalam", name: "Vridhachalam", nameTa: "விருத்தாசலம்", localities: [
        m ("kal-vriddha-m",      "Vridhachalam",    "விருத்தாசலம்"),
        vp("kal-gangavalli",     "Gangavalli",      "காங்கவல்லி"),
        vp("kal-attur-k",        "Attur",           "அத்தூர்"),
      ]},
    ],
  },

  /* ─────────────────────────── 10. KANCHEEPURAM ─────────────────────── */
  {
    id: "kancheepuram", name: "Kancheepuram", nameTa: "காஞ்சிபுரம்",
    blocks: [
      { id: "knc-kancheepuram", name: "Kancheepuram", nameTa: "காஞ்சிபுரம்", localities: [
        m ("knc-kanchi-m",       "Kancheepuram",    "காஞ்சிபுரம்"),
        vp("knc-walajabad",      "Walajabad",       "வாலாஜாபாத்"),
        vp("knc-uthiramerur",    "Uthiramerur",     "உத்திரமேரூர்"),
        vp("knc-maduranthakam",  "Maduranthakam",   "மதுராந்தகம்"),
      ]},
      { id: "knc-cheyyar", name: "Cheyyar", nameTa: "செய்யாறு", localities: [
        tp("knc-cheyyar-tp",     "Cheyyar",         "செய்யாறு"),
        vp("knc-tirukalukundram","Tirukalukundram",  "திருக்கழுகுண்றம்"),
        vp("knc-maraimalainagar","Maraimalai Nagar", "மாறைமலை நகர்"),
        vp("knc-lathur",         "Lathur",          "லத்தூர்"),
      ]},
    ],
  },

  /* ─────────────────────────── 11. KANYAKUMARI ──────────────────────── */
  {
    id: "kanyakumari", name: "Kanyakumari", nameTa: "கன்னியாகுமரி",
    blocks: [
      { id: "kk-nagercoil", name: "Nagercoil", nameTa: "நாகர்கோவில்", localities: [
        m ("kk-nagercoil-m",     "Nagercoil",       "நாகர்கோவில்"),
        tp("kk-thuckalay",       "Thuckalay",       "தக்கலை"),
        vp("kk-marthandam",      "Marthandam",      "மார்த்தாண்டம்"),
        vp("kk-colachel",        "Colachel",        "கோலச்சல்"),
        vp("kk-kulasekharam",    "Kulasekharam",    "குளசேகரம்"),
      ]},
      { id: "kk-padmanabhapuram", name: "Padmanabhapuram", nameTa: "பத்மனாபபுரம்", localities: [
        tp("kk-padmanabha-tp",   "Padmanabhapuram", "பத்மனாபபுரம்"),
        vp("kk-thiruvattar",     "Thiruvattar",     "திருவட்டார்"),
        vp("kk-boothapandi",     "Boothapandi",     "பூதபாண்டி"),
        vp("kk-kaliyakkavilai",  "Kaliyakkavilai",  "காளியக்காவிளை"),
      ]},
      { id: "kk-kanyakumari-bl", name: "Kanyakumari Block", nameTa: "கன்னியாகுமரி வட்டம்", localities: [
        tp("kk-kanyakumari-tp",  "Kanyakumari",     "கன்னியாகுமரி"),
        vp("kk-agastheeswaram",  "Agastheeswaram",  "அகஸ்தீஸ்வரம்"),
        vp("kk-suchindram",      "Suchindram",      "சுசீந்திரம்"),
        vp("kk-navaloor",        "Navaloor",        "நாவலூர்"),
      ]},
    ],
  },

  /* ─────────────────────────────── 12. KARUR ────────────────────────── */
  {
    id: "karur", name: "Karur", nameTa: "கரூர்",
    blocks: [
      { id: "kar-karur", name: "Karur", nameTa: "கரூர்", localities: [
        m ("kar-karur-m",        "Karur Municipality",  "கரூர் நகராட்சி"),
        vp("kar-aravakurichi",   "Aravakurichi",    "அரவக்குறிச்சி"),
        vp("kar-kulithalai",     "Kulithalai",      "குளித்தலை"),
        vp("kar-kadavur",        "Kadavur",         "கடவூர்"),
      ]},
      { id: "kar-krishnarayapuram", name: "Krishnarayapuram", nameTa: "கிருஷ்ணராயபுரம்", localities: [
        vp("kar-krishnaraya-vp", "Krishnarayapuram", "கிருஷ்ணராயபுரம்"),
        vp("kar-thanthoni",      "Thanthoni",       "தாந்தோனி"),
        vp("kar-manmangalam",    "Manmangalam",     "மண்மங்கலம்"),
      ]},
    ],
  },

  /* ─────────────────────────── 13. KRISHNAGIRI ──────────────────────── */
  {
    id: "krishnagiri", name: "Krishnagiri", nameTa: "கிருஷ்ணகிரி",
    blocks: [
      { id: "kri-krishnagiri", name: "Krishnagiri", nameTa: "கிருஷ்ணகிரி", localities: [
        m ("kri-krishnagiri-m",  "Krishnagiri",     "கிருஷ்ணகிரி"),
        vp("kri-shoolagiri",     "Shoolagiri",      "சூலகிரி"),
        vp("kri-pochampalli-k",  "Pochampalli",     "பொச்சம்பள்ளி"),
        vp("kri-mathur-k",       "Mathur",          "மாத்தூர்"),
      ]},
      { id: "kri-hosur", name: "Hosur", nameTa: "ஓசூர்", localities: [
        m ("kri-hosur-m",        "Hosur",           "ஓசூர்"),
        vp("kri-denkanikottai",  "Denkanikottai",   "தேன்கனிக்கோட்டை"),
        vp("kri-kelamangalam",   "Kelamangalam",    "கேளம்பாக்கம்"),
        vp("kri-veppampattu",    "Veppampattu",     "வேப்பம்பட்டு"),
        vp("kri-uthangarai",     "Uthangarai",      "ஒட்டன்காரை"),
      ]},
    ],
  },

  /* ──────────────────────────── 14. MADURAI ─────────────────────────── */
  {
    id: "madurai", name: "Madurai", nameTa: "மதுரை",
    blocks: [
      { id: "mdu-north", name: "Madurai North", nameTa: "மதுரை வடக்கு", localities: [
        w("mdu-alagapuri",       "Alagapuri",       "அழகாபுரி"),
        w("mdu-anna-nagar-mdu",  "Anna Nagar",      "அண்ணா நகர்"),
        w("mdu-tallakulam",      "Tallakulam",      "தல்லாக்குளம்"),
        w("mdu-KK-nagar",        "K.K. Nagar",      "கே.கே. நகர்"),
      ]},
      { id: "mdu-south", name: "Madurai South", nameTa: "மதுரை தெற்கு", localities: [
        w("mdu-goripalayam",     "Goripalayam",     "கோரிப்பாளையம்"),
        w("mdu-villapuram",      "Villapuram",      "வில்லாபுரம்"),
        w("mdu-palanganatham",   "Palanganatham",   "பாளங்காநாதம்"),
        w("mdu-arasaradi",       "Arasaradi",       "அரசாரடி"),
      ]},
      { id: "mdu-melur", name: "Melur", nameTa: "மேலூர்", localities: [
        tp("mdu-melur-tp",       "Melur",           "மேலூர்"),
        vp("mdu-thiruparankundram","Thiruparankundram","திருப்பரங்குன்றம்"),
        vp("mdu-kallikudi",      "Kallikudi",       "கல்லிக்குடி"),
        vp("mdu-T-kallupatti",   "T. Kallupatti",   "தி. கள்ளுப்பட்டி"),
      ]},
      { id: "mdu-thirumangalam", name: "Thirumangalam", nameTa: "திருமங்கலம்", localities: [
        tp("mdu-thirumangalam",  "Thirumangalam",   "திருமங்கலம்"),
        vp("mdu-usilampatti",    "Usilampatti",     "உசிலம்பட்டி"),
        vp("mdu-avinashi-mdu",   "Avinashi",        "அவிநாசி"),
        vp("mdu-peraiyur",       "Peraiyur",        "பேரையூர்"),
      ]},
    ],
  },

  /* ─────────────────────────── 15. MAYILADUTHURAI ───────────────────── */
  {
    id: "mayiladuthurai", name: "Mayiladuthurai", nameTa: "மயிலாடுதுறை",
    blocks: [
      { id: "myl-mayiladuthurai", name: "Mayiladuthurai", nameTa: "மயிலாடுதுறை", localities: [
        m ("myl-mayiladu-m",     "Mayiladuthurai",  "மயிலாடுதுறை"),
        tp("myl-sirkazhi",       "Sirkazhi",        "சீர்காழி"),
        vp("myl-kuthalam",       "Kuthalam",        "குத்தாலம்"),
        vp("myl-poompuhar",      "Poompuhar",       "பூம்புகார்"),
      ]},
      { id: "myl-kumbakonam-bl", name: "Kumbakonam Block", nameTa: "கும்பகோணம் வட்டம்", localities: [
        m ("myl-kumbakonam-m",   "Kumbakonam",      "கும்பகோணம்"),
        tp("myl-papanasam",      "Papanasam",       "பாபநாசம்"),
        vp("myl-tiruvidaimaruthur","Tiruvidaimaruthur","திருவிடைமருதூர்"),
        vp("myl-thirubuvanam",   "Thirubuvanam",    "திருப்புவனம்"),
      ]},
    ],
  },

  /* ──────────────────────────── 16. NAGAPATTINAM ────────────────────── */
  {
    id: "nagapattinam", name: "Nagapattinam", nameTa: "நாகப்பட்டினம்",
    blocks: [
      { id: "ngp-nagapattinam", name: "Nagapattinam", nameTa: "நாகப்பட்டினம்", localities: [
        m ("ngp-nagapattnam-m",  "Nagapattinam",    "நாகப்பட்டினம்"),
        tp("ngp-velankanni",     "Velankanni",      "வேளாங்கண்ணி"),
        vp("ngp-keelakarai-ng",  "Keelakarai",      "கீழக்கரை"),
        vp("ngp-thirumarugal",   "Thirumarugal",    "திருமருகல்"),
      ]},
      { id: "ngp-vedaranyam", name: "Vedaranyam", nameTa: "வேதாரண்யம்", localities: [
        tp("ngp-vedaranyam-tp",  "Vedaranyam",      "வேதாரண்யம்"),
        vp("ngp-nagore",         "Nagore",          "நாகூர்"),
        vp("ngp-akkaraipettai",  "Akkaraipettai",   "அக்கரைப்பேட்டை"),
        vp("ngp-kollidam",       "Kollidam",        "கொல்லிடம்"),
      ]},
    ],
  },

  /* ──────────────────────────── 17. NAMAKKAL ────────────────────────── */
  {
    id: "namakkal", name: "Namakkal", nameTa: "நாமக்கல்",
    blocks: [
      { id: "nmk-namakkal", name: "Namakkal", nameTa: "நாமக்கல்", localities: [
        m ("nmk-namakkal-m",     "Namakkal",        "நாமக்கல்"),
        vp("nmk-rasipuram",      "Rasipuram",       "ராசிபுரம்"),
        vp("nmk-tiruchengode",   "Tiruchengode",    "திருச்செங்கோடு"),
        vp("nmk-mohanur",        "Mohanur",         "மோகனூர்"),
      ]},
      { id: "nmk-erumapatti", name: "Erumapatti", nameTa: "எருமாபட்டி", localities: [
        vp("nmk-erumapatti-vp",  "Erumapatti",      "எருமாபட்டி"),
        vp("nmk-kolli-hills",    "Kolli Hills",     "கொல்லி மலை"),
        vp("nmk-senthamangalam", "Senthamangalam",  "சேந்தமங்கலம்"),
        vp("nmk-paramathi",      "Paramathi",       "பரமத்தி"),
      ]},
    ],
  },

  /* ─────────────────────────────── 18. NILGIRIS ─────────────────────── */
  {
    id: "nilgiris", name: "Nilgiris", nameTa: "நீலகிரி",
    blocks: [
      { id: "nlg-ooty", name: "Ooty (Udhagamandalam)", nameTa: "ஊட்டி (உதகமண்டலம்)", localities: [
        m ("nlg-ooty-m",         "Ooty",            "ஊட்டி"),
        tp("nlg-coonoor",        "Coonoor",         "கூனூர்"),
        vp("nlg-kotagiri",       "Kotagiri",        "கோத்தகிரி"),
        vp("nlg-gudalur",        "Gudalur",         "குடலூர்"),
        vp("nlg-pandalur",       "Pandalur",        "பாண்டலூர்"),
      ]},
      { id: "nlg-kundah", name: "Kundah", nameTa: "குந்தா", localities: [
        vp("nlg-kundah-vp",      "Kundah",          "குந்தா"),
        vp("nlg-avalanche",      "Avalanche",       "அவலாஞ்சி"),
        vp("nlg-emerald",        "Emerald",         "எமரால்டு"),
      ]},
    ],
  },

  /* ─────────────────────────── 19. PERAMBALUR ───────────────────────── */
  {
    id: "perambalur", name: "Perambalur", nameTa: "பெரம்பலூர்",
    blocks: [
      { id: "prb-perambalur", name: "Perambalur", nameTa: "பெரம்பலூர்", localities: [
        m ("prb-perambalur-m",   "Perambalur",      "பெரம்பலூர்"),
        vp("prb-kunnam",         "Kunnam",          "குன்னம்"),
        vp("prb-veppanthattai",  "Veppanthattai",   "வேப்பந்தட்டை"),
        vp("prb-alathur-p",      "Alathur",         "ஆலத்தூர்"),
      ]},
      { id: "prb-veppur", name: "Veppur", nameTa: "வேப்பூர்", localities: [
        vp("prb-veppur-vp",      "Veppur",          "வேப்பூர்"),
        vp("prb-arumbavur",      "Arumbavur",       "அரும்பாவூர்"),
        vp("prb-thirumanur-p",   "Thirumanur",      "திருமணூர்"),
      ]},
    ],
  },

  /* ─────────────────────────── 20. PUDUKKOTTAI ──────────────────────── */
  {
    id: "pudukkottai", name: "Pudukkottai", nameTa: "புதுக்கோட்டை",
    blocks: [
      { id: "pdk-pudukkottai", name: "Pudukkottai", nameTa: "புதுக்கோட்டை", localities: [
        m ("pdk-pudukkottai-m",  "Pudukkottai",     "புதுக்கோட்டை"),
        vp("pdk-aranthangi",     "Aranthangi",      "அரந்தாங்கி"),
        vp("pdk-alangudi",       "Alangudi",        "ஆலங்குடி"),
        vp("pdk-illuppur",       "Illuppur",        "இலுப்பூர்"),
      ]},
      { id: "pdk-tirumayam", name: "Tirumayam", nameTa: "திருமயம்", localities: [
        tp("pdk-tirumayam-tp",   "Tirumayam",       "திருமயம்"),
        vp("pdk-ponnamaravathi", "Ponnamaravathi",  "பொன்னமராவதி"),
        vp("pdk-karambakudi",    "Karambakudi",     "கரம்பக்குடி"),
      ]},
    ],
  },

  /* ─────────────────────────── 21. RAMANATHAPURAM ───────────────────── */
  {
    id: "ramanathapuram", name: "Ramanathapuram", nameTa: "இராமநாதபுரம்",
    blocks: [
      { id: "rmn-ramanathapuram", name: "Ramanathapuram", nameTa: "இராமநாதபுரம்", localities: [
        m ("rmn-ramnad-m",       "Ramanathapuram",  "இராமநாதபுரம்"),
        tp("rmn-paramakudi",     "Paramakudi",      "பரமக்குடி"),
        vp("rmn-keelakarai",     "Keelakarai",      "கீழக்கரை"),
        vp("rmn-uchipuli",       "Uchipuli",        "உச்சிப்புலி"),
      ]},
      { id: "rmn-rameswaram", name: "Rameswaram", nameTa: "இராமேஸ்வரம்", localities: [
        tp("rmn-rameswaram-tp",  "Rameswaram",      "இராமேஸ்வரம்"),
        vp("rmn-mandapam",       "Mandapam",        "மண்டபம்"),
        vp("rmn-pamban",         "Pamban",          "பாம்பன்"),
        vp("rmn-devipattinam",   "Devipattinam",    "தேவிப்பட்டினம்"),
      ]},
    ],
  },

  /* ──────────────────────────── 22. RANIPET ─────────────────────────── */
  {
    id: "ranipet", name: "Ranipet", nameTa: "இரானிப்பேட்டை",
    blocks: [
      { id: "rnp-ranipet", name: "Ranipet", nameTa: "இரானிப்பேட்டை", localities: [
        m ("rnp-ranipet-m",      "Ranipet",         "இரானிப்பேட்டை"),
        tp("rnp-walajapet",      "Walajapet",       "வாலாஜாப்பேட்டை"),
        tp("rnp-arcot",          "Arcot",           "ஆற்காடு"),
        vp("rnp-sholinghur",     "Sholinghur",      "சோழிங்கர்"),
      ]},
      { id: "rnp-vellore-bl", name: "Vellore Block", nameTa: "வேலூர் வட்டம்", localities: [
        m ("rnp-vellore-m",      "Vellore",         "வேலூர்"),
        tp("rnp-katpadi",        "Katpadi",         "காட்பாடி"),
        vp("rnp-gudiyatham",     "Gudiyatham",      "குடியாத்தம்"),
        vp("rnp-pernambut",      "Pernambut",       "பேர்ணம்பூட்டு"),
        vp("rnp-veppampattu-r",  "Veppampattu",     "வேப்பம்பட்டு"),
      ]},
    ],
  },

  /* ─────────────────────────────── 23. SALEM ────────────────────────── */
  {
    id: "salem", name: "Salem", nameTa: "சேலம்",
    blocks: [
      { id: "slm-salem", name: "Salem", nameTa: "சேலம்", localities: [
        m ("slm-salem-m",        "Salem Corporation",  "சேலம் மாநகராட்சி"),
        w("slm-swarnapuri",      "Swarnapuri",      "சுவர்ணபுரி"),
        w("slm-suramangalam",    "Suramangalam",    "சூரமங்கலம்"),
        w("slm-kondalampatti",   "Kondalampatti",   "கொண்டலாம்பட்டி"),
        vp("slm-veerapandi",     "Veerapandi",      "வீரபாண்டி"),
      ]},
      { id: "slm-attur", name: "Attur", nameTa: "அத்தூர்", localities: [
        tp("slm-attur-tp",       "Attur",           "அத்தூர்"),
        vp("slm-vazhapadi",      "Vazhapadi",       "வாழப்பாடி"),
        vp("slm-yercaud",        "Yercaud",         "யேர்காடு"),
        vp("slm-omalur",         "Omalur",          "ஒமலூர்"),
      ]},
      { id: "slm-mettur", name: "Mettur", nameTa: "மேட்டூர்", localities: [
        tp("slm-mettur-tp",      "Mettur Dam",      "மேட்டூர் அணை"),
        vp("slm-mecheri",        "Mecheri",         "மேச்சேரி"),
        vp("slm-edapadi",        "Edapadi",         "ஏற்பாடி"),
        vp("slm-sankagiri",      "Sankagiri",       "சங்ககிரி"),
      ]},
    ],
  },

  /* ─────────────────────────── 24. SIVAGANGA ────────────────────────── */
  {
    id: "sivaganga", name: "Sivaganga", nameTa: "சிவகங்கை",
    blocks: [
      { id: "svg-sivaganga", name: "Sivaganga", nameTa: "சிவகங்கை", localities: [
        m ("svg-sivaganga-m",    "Sivaganga",       "சிவகங்கை"),
        tp("svg-karaikudi",      "Karaikudi",       "காரைக்குடி"),
        vp("svg-devakottai",     "Devakottai",      "தேவகோட்டை"),
        vp("svg-manamadurai",    "Manamadurai",     "மானாமதுரை"),
      ]},
      { id: "svg-tirupattur-sv", name: "Tirupattur (Sivaganga)", nameTa: "திருப்பத்தூர் (சிவகங்கை)", localities: [
        vp("svg-tirupattur-vp",  "Tirupattur",      "திருப்பத்தூர்"),
        vp("svg-singampuneri",   "Singampuneri",    "சிங்கம்புணர்"),
        vp("svg-ilayangudi",     "Ilayangudi",      "இளையங்குடி"),
      ]},
    ],
  },

  /* ─────────────────────────────── 25. TENKASI ──────────────────────── */
  {
    id: "tenkasi", name: "Tenkasi", nameTa: "தென்காசி",
    blocks: [
      { id: "tnk-tenkasi", name: "Tenkasi", nameTa: "தென்காசி", localities: [
        m ("tnk-tenkasi-m",      "Tenkasi",         "தென்காசி"),
        tp("tnk-courtallam",     "Courtallam",      "குற்றாலம்"),
        vp("tnk-sivagiri",       "Sivagiri",        "சிவகிரி"),
        vp("tnk-sankarankovil",  "Sankarankovil",   "சங்கரன்கோவில்"),
      ]},
      { id: "tnk-kadayanallur", name: "Kadayanallur", nameTa: "கடையநல்லூர்", localities: [
        tp("tnk-kadayanallur-tp","Kadayanallur",    "கடையநல்லூர்"),
        vp("tnk-alangulam",      "Alangulam",       "ஆலங்குளம்"),
        vp("tnk-rajapalayam-tnk","Rajapalayam",     "இராஜபாளையம்"),
      ]},
    ],
  },

  /* ─────────────────────────── 26. THANJAVUR ────────────────────────── */
  {
    id: "thanjavur", name: "Thanjavur", nameTa: "தஞ்சாவூர்",
    blocks: [
      { id: "thj-thanjavur", name: "Thanjavur", nameTa: "தஞ்சாவூர்", localities: [
        m ("thj-thanjavur-m",    "Thanjavur",       "தஞ்சாவூர்"),
        tp("thj-kumbakonam-thj", "Kumbakonam",      "கும்பகோணம்"),
        vp("thj-papanasam-thj",  "Papanasam",       "பாபநாசம்"),
        vp("thj-orathanadu",     "Orathanadu",      "ஒரத்தநாடு"),
        vp("thj-pattukottai",    "Pattukottai",     "பட்டுக்கோட்டை"),
      ]},
      { id: "thj-tiruvaiyaru", name: "Tiruvaiyaru", nameTa: "திருவையாறு", localities: [
        tp("thj-tiruvaiyaru-tp", "Tiruvaiyaru",     "திருவையாறு"),
        vp("thj-papanasam-v",    "Papanasam",       "பாபநாசம்"),
        vp("thj-thiruvidaimarudur","Tiruvidaimarudur","திருவிடைமருதூர்"),
      ]},
    ],
  },

  /* ─────────────────────────────── 27. THENI ────────────────────────── */
  {
    id: "theni", name: "Theni", nameTa: "தேனி",
    blocks: [
      { id: "thn-theni", name: "Theni", nameTa: "தேனி", localities: [
        m ("thn-theni-m",        "Theni",           "தேனி"),
        tp("thn-bodinayakanur",  "Bodinayakanur",   "போடிநாயக்கனூர்"),
        vp("thn-uthamapalayam",  "Uthamapalayam",   "உத்தமபாளையம்"),
        vp("thn-periyakulam",    "Periyakulam",     "பெரியகுளம்"),
      ]},
      { id: "thn-andipatti", name: "Andipatti", nameTa: "ஆண்டிபட்டி", localities: [
        vp("thn-andipatti-vp",   "Andipatti",       "ஆண்டிபட்டி"),
        vp("thn-cumbum",         "Cumbum",          "கம்பம்"),
        vp("thn-gudalur-theni",  "Gudalur",         "குடலூர்"),
        vp("thn-thandikudi",     "Thandikudi",      "தண்டிக்குடி"),
      ]},
    ],
  },

  /* ──────────────────────────── 28. THOOTHUKUDI ─────────────────────── */
  {
    id: "thoothukudi", name: "Thoothukudi (Tuticorin)", nameTa: "தூத்துக்குடி",
    blocks: [
      { id: "tut-thoothukudi", name: "Thoothukudi", nameTa: "தூத்துக்குடி", localities: [
        m ("tut-thoothukudi-m",  "Thoothukudi",     "தூத்துக்குடி"),
        tp("tut-kovilpatti",     "Kovilpatti",      "கோவில்பட்டி"),
        vp("tut-ottapidaram",    "Ottapidaram",     "ஒட்டப்பிடாரம்"),
        vp("tut-kayalpattinam",  "Kayalpattinam",   "கயல்பட்டினம்"),
      ]},
      { id: "tut-srivaikuntam", name: "Srivaikuntam", nameTa: "ஸ்ரீவைகுண்டம்", localities: [
        tp("tut-srivaikuntam-tp","Srivaikuntam",    "ஸ்ரீவைகுண்டம்"),
        vp("tut-tiruchendur",    "Tiruchendur",     "திருச்செந்தூர்"),
        vp("tut-eral",           "Eral",            "ஏரல்"),
        vp("tut-nazareth",       "Nazareth",        "நசரேத்"),
      ]},
    ],
  },

  /* ──────────────────────────── 29. TIRUCHIRAPPALLI ─────────────────── */
  {
    id: "tiruchirappalli", name: "Tiruchirappalli (Trichy)", nameTa: "திருச்சிராப்பள்ளி",
    blocks: [
      { id: "try-trichy-city", name: "Trichy City", nameTa: "திருச்சி நகரம்", localities: [
        w("try-srirangam",       "Srirangam",       "ஸ்ரீரங்கம்"),
        w("try-ariyamangalam",   "Ariyamangalam",   "ஆரியமங்கலம்"),
        w("try-cantonment",      "Cantonment",      "கந்தோன்மெண்ட்"),
        w("try-thillai-nagar",   "Thillai Nagar",   "தில்லை நகர்"),
        w("try-k-k-nagar-try",   "K.K. Nagar",      "கே.கே. நகர்"),
      ]},
      { id: "try-lalgudi", name: "Lalgudi", nameTa: "லால்குடி", localities: [
        tp("try-lalgudi-tp",     "Lalgudi",         "லால்குடி"),
        vp("try-manachanallur",  "Manachanallur",   "மனச்சநல்லூர்"),
        vp("try-musiri",         "Musiri",          "முசிறி"),
        vp("try-thuraiyur",      "Thuraiyur",       "துறையூர்"),
      ]},
      { id: "try-perambalur-bl", name: "Perambalur Block", nameTa: "பெரம்பலூர் வட்டம்", localities: [
        m ("try-perambalur-m",   "Perambalur",      "பெரம்பலூர்"),
        vp("try-veppanthattai-t","Veppanthattai",   "வேப்பந்தட்டை"),
        vp("try-alathur-t",      "Alathur",         "ஆலத்தூர்"),
      ]},
    ],
  },

  /* ──────────────────────────── 30. TIRUNELVELI ─────────────────────── */
  {
    id: "tirunelveli", name: "Tirunelveli", nameTa: "திருநெல்வேலி",
    blocks: [
      { id: "tnl-tirunelveli", name: "Tirunelveli", nameTa: "திருநெல்வேலி", localities: [
        m ("tnl-tirunelveli-m",  "Tirunelveli",     "திருநெல்வேலி"),
        tp("tnl-palayamkottai",  "Palayamkottai",   "பாளையங்கோட்டை"),
        vp("tnl-nanguneri",      "Nanguneri",       "நாங்குநேரி"),
        vp("tnl-cheranmahadevi", "Cheranmahadevi",  "சேரன்மகாதேவி"),
      ]},
      { id: "tnl-tenkasi-bl", name: "Tenkasi Block", nameTa: "தென்காசி வட்டம்", localities: [
        m ("tnl-tenkasi-m",      "Tenkasi",         "தென்காசி"),
        tp("tnl-courtallam-t",   "Courtallam",      "குற்றாலம்"),
        vp("tnl-ambasamudram",   "Ambasamudram",    "அம்பாசமுத்திரம்"),
        vp("tnl-shencottah",     "Shencottah",      "செங்கோட்டை"),
      ]},
      { id: "tnl-rajapalayam", name: "Rajapalayam", nameTa: "இராஜபாளையம்", localities: [
        m ("tnl-rajapalayam-m",  "Rajapalayam",     "இராஜபாளையம்"),
        vp("tnl-srivilliputtur", "Srivilliputtur",  "ஸ்ரீவிலலிபுத்தூர்"),
        vp("tnl-sivakasi",       "Sivakasi",        "சிவகாசி"),
        vp("tnl-sattur",         "Sattur",          "சாத்தூர்"),
      ]},
    ],
  },

  /* ─────────────────────────── 31. TIRUPATHUR ───────────────────────── */
  {
    id: "tirupathur", name: "Tirupathur", nameTa: "திருப்பத்தூர்",
    blocks: [
      { id: "tpr-tirupathur", name: "Tirupathur", nameTa: "திருப்பத்தூர்", localities: [
        m ("tpr-tirupathur-m",   "Tirupathur",      "திருப்பத்தூர்"),
        tp("tpr-ambur",          "Ambur",           "ஆம்பூர்"),
        tp("tpr-vaniyambadi",    "Vaniyambadi",     "வாணியம்பாடி"),
        vp("tpr-jolarpettai",    "Jolarpettai",     "ஜோலார்பேட்டை"),
      ]},
      { id: "tpr-natrampalli", name: "Natrampalli", nameTa: "நாட்ராம்பள்ளி", localities: [
        vp("tpr-natrampalli-vp", "Natrampalli",     "நாட்ராம்பள்ளி"),
        vp("tpr-alangayam",      "Alangayam",       "ஆலங்காயம்"),
        vp("tpr-yelagiri",       "Yelagiri",        "ஏலகிரி"),
      ]},
    ],
  },

  /* ──────────────────────────── 32. TIRUPPUR ────────────────────────── */
  {
    id: "tiruppur", name: "Tiruppur", nameTa: "திருப்பூர்",
    blocks: [
      { id: "tpp-tiruppur", name: "Tiruppur", nameTa: "திருப்பூர்", localities: [
        m ("tpp-tiruppur-m",     "Tiruppur",        "திருப்பூர்"),
        vp("tpp-palladam",       "Palladam",        "பல்லடம்"),
        vp("tpp-kangeyam",       "Kangeyam",        "கங்கேயம்"),
        vp("tpp-dharapuram-tp",  "Dharapuram",      "தாராபுரம்"),
        vp("tpp-avinashi-tp",    "Avinashi",        "அவிநாசி"),
      ]},
      { id: "tpp-udumalpet", name: "Udumalpet", nameTa: "உடுமலைப்பேட்டை", localities: [
        m ("tpp-udumalpet-m",    "Udumalpet",       "உடுமலைப்பேட்டை"),
        vp("tpp-mulanur",        "Mulanur",         "முல்லனூர்"),
        vp("tpp-vellakoil",      "Vellakoil",       "வெள்ளக்கோவில்"),
      ]},
    ],
  },

  /* ─────────────────────────── 33. TIRUVALLUR ───────────────────────── */
  {
    id: "tiruvallur", name: "Tiruvallur", nameTa: "திருவள்ளூர்",
    blocks: [
      { id: "tvl-tiruvallur", name: "Tiruvallur", nameTa: "திருவள்ளூர்", localities: [
        m ("tvl-tiruvallur-m",   "Tiruvallur",      "திருவள்ளூர்"),
        tp("tvl-avadi-bl",       "Avadi",           "ஆவடி"),
        tp("tvl-gummidipoondi",  "Gummidipoondi",   "கும்மிடிப்பூண்டி"),
        vp("tvl-ponneri",        "Ponneri",         "பொன்னேரி"),
        vp("tvl-red-hills-bl",   "Red Hills",       "சிவப்பு மலை"),
      ]},
      { id: "tvl-poonamallee", name: "Poonamallee", nameTa: "பூனமல்லி", localities: [
        tp("tvl-poonamallee-tp", "Poonamallee",     "பூனமல்லி"),
        vp("tvl-veppampattu-tv", "Veppampattu",     "வேப்பம்பட்டு"),
        vp("tvl-thirumazhisai",  "Thirumazhisai",   "திருமழிசை"),
        vp("tvl-ambattur-bl",    "Ambattur",        "அம்பத்தூர்"),
        vp("tvl-pattabiram-bl",  "Pattabiram",      "பட்டாபிராம்"),
      ]},
      { id: "tvl-uthukottai", name: "Uthukottai", nameTa: "உதுக்கோட்டை", localities: [
        vp("tvl-uthukottai-vp",  "Uthukottai",      "உதுக்கோட்டை"),
        vp("tvl-pallipattu",     "Pallipattu",      "பள்ளிப்பட்டு"),
        vp("tvl-tiruttani",      "Tiruttani",       "திருத்தணி"),
      ]},
    ],
  },

  /* ─────────────────────────── 34. TIRUVANNAMALAI ───────────────────── */
  {
    id: "tiruvannamalai", name: "Tiruvannamalai", nameTa: "திருவண்ணாமலை",
    blocks: [
      { id: "tvm-tiruvannamalai", name: "Tiruvannamalai", nameTa: "திருவண்ணாமலை", localities: [
        m ("tvm-tiruvannamalai-m","Tiruvannamalai",  "திருவண்ணாமலை"),
        tp("tvm-polur",           "Polur",           "போளூர்"),
        vp("tvm-chengam",         "Chengam",         "செங்கம்"),
        vp("tvm-kalasapakkam",    "Kalasapakkam",    "கலசப்பாக்கம்"),
      ]},
      { id: "tvm-vandavasi", name: "Vandavasi", nameTa: "வந்தவாசி", localities: [
        tp("tvm-vandavasi-tp",   "Vandavasi",       "வந்தவாசி"),
        vp("tvm-cheyyar-tvm",    "Cheyyar",         "செய்யாறு"),
        vp("tvm-kilpennathur",   "Kilpennathur",    "கீழ்பெண்ணாதூர்"),
        vp("tvm-arani",          "Arani",           "ஆரணி"),
      ]},
    ],
  },

  /* ──────────────────────────── 35. VELLORE ─────────────────────────── */
  {
    id: "vellore", name: "Vellore", nameTa: "வேலூர்",
    blocks: [
      { id: "vll-vellore", name: "Vellore", nameTa: "வேலூர்", localities: [
        m ("vll-vellore-m",      "Vellore",         "வேலூர்"),
        tp("vll-katpadi",        "Katpadi",         "காட்பாடி"),
        vp("vll-gudiyatham",     "Gudiyatham",      "குடியாத்தம்"),
        vp("vll-pernambut",      "Pernambut",       "பேர்ணம்பூட்டு"),
        vp("vll-veppampattu-vl", "Veppampattu",     "வேப்பம்பட்டு"),
      ]},
      { id: "vll-walajah", name: "Walajah", nameTa: "வாலாஜா", localities: [
        tp("vll-walajapet",      "Walajapet",       "வாலாஜாப்பேட்டை"),
        tp("vll-arcot-vl",       "Arcot",           "ஆற்காடு"),
        vp("vll-sholinghur-vl",  "Sholinghur",      "சோழிங்கர்"),
        vp("vll-anaicut",        "Anaicut",         "ஆணைகட்டு"),
      ]},
    ],
  },

  /* ──────────────────────────── 36. VILUPPURAM ──────────────────────── */
  {
    id: "viluppuram", name: "Viluppuram", nameTa: "விழுப்புரம்",
    blocks: [
      { id: "vlp-viluppuram", name: "Viluppuram", nameTa: "விழுப்புரம்", localities: [
        m ("vlp-viluppuram-m",   "Viluppuram",      "விழுப்புரம்"),
        tp("vlp-tindivanam",     "Tindivanam",      "திண்டிவனம்"),
        vp("vlp-gingee",         "Gingee",          "செஞ்சி"),
        vp("vlp-ulundurpettai",  "Ulundurpettai",   "உளுந்தூர்பேட்டை"),
      ]},
      { id: "vlp-kallakurichi-bl", name: "Kallakurichi Block", nameTa: "கள்ளக்குறிச்சி வட்டம்", localities: [
        m ("vlp-kallakurichi-m", "Kallakurichi",    "கள்ளக்குறிச்சி"),
        vp("vlp-sankarapuram-v", "Sankarapuram",    "சங்கரபுரம்"),
        vp("vlp-chinnasalem-v",  "Chinnasalem",     "சின்னசேலம்"),
        vp("vlp-rishivandiyam",  "Rishivandiyam",   "ரிஷிவந்தியம்"),
      ]},
      { id: "vlp-pondicherry-bl", name: "Pondicherry Border", nameTa: "புதுச்சேரி எல்லை", localities: [
        tp("vlp-cuddalore-border","Cuddalore Border","கடலூர் எல்லை"),
        vp("vlp-vikravandi",     "Vikravandi",      "விக்கிரவாண்டி"),
        vp("vlp-thiruvennainallur","Thiruvennainallur","திருவெண்ணைநல்லூர்"),
      ]},
    ],
  },

  /* ──────────────────────────── 37. VIRUDHUNAGAR ────────────────────── */
  {
    id: "virudhunagar", name: "Virudhunagar", nameTa: "விருதுநகர்",
    blocks: [
      { id: "vdn-virudhunagar", name: "Virudhunagar", nameTa: "விருதுநகர்", localities: [
        m ("vdn-virudhunagar-m", "Virudhunagar",    "விருதுநகர்"),
        tp("vdn-sivakasi-vdn",   "Sivakasi",        "சிவகாசி"),
        tp("vdn-sattur",         "Sattur",          "சாத்தூர்"),
        vp("vdn-srivilliputtur-v","Srivilliputtur", "ஸ்ரீவில்லிபுத்தூர்"),
      ]},
      { id: "vdn-rajapalayam-vdn","name": "Rajapalayam", nameTa: "இராஜபாளையம்", localities: [
        m ("vdn-rajapalayam-m",  "Rajapalayam",     "இராஜபாளையம்"),
        vp("vdn-thiruvengadam",  "Thiruvengadam",   "திருவேங்கடம்"),
        vp("vdn-aruppukkottai",  "Aruppukkottai",   "அருப்புக்கோட்டை"),
        vp("vdn-kariapatti",     "Kariapatti",      "காரியாபட்டி"),
      ]},
    ],
  },

  /* ──────────────────────────── 38. TIRUVARUR ───────────────────────── */
  {
    id: "tiruvarur", name: "Tiruvarur", nameTa: "திருவாரூர்",
    blocks: [
      { id: "tvr-tiruvarur", name: "Tiruvarur", nameTa: "திருவாரூர்", localities: [
        m ("tvr-tiruvarur-m",    "Tiruvarur",       "திருவாரூர்"),
        tp("tvr-nagapattinam-t", "Nagapattinam",    "நாகப்பட்டினம்"),
        vp("tvr-kodavasal",      "Kodavasal",       "கோடவாசல்"),
        vp("tvr-thiruthuraipoondi","Thiruthuraipoondi","திருத்துறைப்பூண்டி"),
      ]},
      { id: "tvr-mannargudi", name: "Mannargudi", nameTa: "மன்னார்குடி", localities: [
        tp("tvr-mannargudi-tp",  "Mannargudi",      "மன்னார்குடி"),
        vp("tvr-needamangalam",  "Needamangalam",   "நீடாமங்கலம்"),
        vp("tvr-papanasam-tvr",  "Papanasam",       "பாபநாசம்"),
        vp("tvr-muthupet",       "Muthupet",        "முத்துப்பேட்டை"),
      ]},
    ],
  },
];

/** Flat list of all districts (for simple dropdowns) */
export const DISTRICT_LIST = TN_DISTRICTS.map(d => ({ id: d.id, name: d.name, nameTa: d.nameTa }));

/** Get blocks for a given district id */
export function getBlocks(districtId: string): Block[] {
  return TN_DISTRICTS.find(d => d.id === districtId)?.blocks ?? [];
}

/** Get localities for a given block id */
export function getLocalities(districtId: string, blockId: string): Locality[] {
  return getBlocks(districtId).find(b => b.id === blockId)?.localities ?? [];
}

/** Locality type labels */
export const LOCALITY_TYPE_LABELS: Record<LocalityType, string> = {
  VP:   "Village Panchayat",
  TP:   "Town Panchayat",
  M:    "Municipality",
  Corp: "Corporation",
  W:    "Ward",
};
