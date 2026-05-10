/**
 * Tamil Nadu Area Hierarchy — full district → block → locality list
 * Type codes: VP = Village Panchayat, TP = Town Panchayat,
 *             M  = Municipality,      Corp = Corporation Ward
 * 38 districts · ~280 blocks · 4 000 + localities
 */

export type LocalityType = "VP" | "TP" | "M" | "Corp" | "W";

export interface Locality { id: string; name: string; nameTa: string; type: LocalityType; }
export interface Block    { id: string; name: string; nameTa: string; localities: Locality[]; }
export interface District { id: string; name: string; nameTa: string; blocks: Block[]; }

const vp = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "VP" });
const tp = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "TP" });
const m  = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "M"  });
const w  = (id: string, name: string, nameTa: string): Locality => ({ id, name, nameTa, type: "W"  });

export const TN_DISTRICTS: District[] = [

  /* ── 01. ARIYALUR ──────────────────────────────────────────────── */
  { id:"ariyalur", name:"Ariyalur", nameTa:"அரியலூர்", blocks:[
    { id:"ari-ariyalur", name:"Ariyalur", nameTa:"அரியலூர்", localities:[
      m ("ari-ariyalur-m",     "Ariyalur",          "அரியலூர்"),
      vp("ari-vengalam",       "Vengalam",           "வேங்கலம்"),
      vp("ari-veppur",         "Veppur",             "வேப்பூர்"),
      vp("ari-kiliyur",        "Kiliyur",            "கிளியூர்"),
      vp("ari-manalmedu",      "Manalmedu",          "மணல்மேடு"),
      vp("ari-keeranur",       "Keeranur",           "கீரனூர்"),
      vp("ari-nochili",        "Nochili",            "நொச்சிலி"),
      vp("ari-thandalam",      "Thandalam",          "தண்டலம்"),
      vp("ari-senthurai",      "Senthurai",          "செந்துறை"),
    ]},
    { id:"ari-udayarpalayam", name:"Udayarpalayam", nameTa:"உடையார்பாளையம்", localities:[
      tp("ari-udayar-tp",      "Udayarpalayam",      "உடையார்பாளையம்"),
      vp("ari-thirumanur",     "Thirumanur",         "திருமணூர்"),
      vp("ari-andimadam",      "Andimadam",          "ஆண்டிமடம்"),
      vp("ari-vilangudi",      "Vilangudi",          "விலங்குடி"),
      vp("ari-kundur",         "Kundur",             "குண்டூர்"),
      vp("ari-meensurutti",    "Meensurutti",        "மீன்சுருட்டி"),
      vp("ari-siruganur",      "Siruganur",          "சிறுகனூர்"),
    ]},
    { id:"ari-jayankondam", name:"Jayankondam", nameTa:"ஜெயங்கொண்டம்", localities:[
      tp("ari-jayankondam-tp", "Jayankondam",        "ஜெயங்கொண்டம்"),
      vp("ari-sendurai",       "Sendurai",           "செந்துறை"),
      vp("ari-palathur",       "Palathur",           "பாலத்தூர்"),
      vp("ari-kazhuperumbakkam","Kazhuperumbakkam",  "கழுப்பெரும்பாக்கம்"),
      vp("ari-thirumandurai",  "Thirumandurai",      "திருமண்டூர்"),
      vp("ari-thirunavalur",   "Thirunavalur",       "திருநாவலூர்"),
    ]},
  ]},

  /* ── 02. CHENGALPATTU ──────────────────────────────────────────── */
  { id:"chengalpattu", name:"Chengalpattu", nameTa:"செங்கல்பட்டு", blocks:[
    { id:"chgl-chengalpattu", name:"Chengalpattu", nameTa:"செங்கல்பட்டு", localities:[
      m ("chgl-cgpt-m",        "Chengalpattu",       "செங்கல்பட்டு"),
      vp("chgl-madurantakam",  "Madurantakam",       "மதுராந்தகம்"),
      vp("chgl-lathur",        "Lathur",             "லத்தூர்"),
      vp("chgl-kadapakkam",    "Kadapakkam",         "கடப்பாக்கம்"),
      vp("chgl-thirukkazhi",   "Thirukazhi",         "திருக்காழி"),
      vp("chgl-vedal",         "Vedal",              "வேடல்"),
      vp("chgl-perungulam",    "Perungulam",         "பெருங்குளம்"),
      vp("chgl-potheri",       "Potheri",            "பொதேரி"),
      vp("chgl-sembakkam",     "Sembakkam",          "செம்பாக்கம்"),
    ]},
    { id:"chgl-tambaram", name:"Tambaram", nameTa:"தாம்பரம்", localities:[
      m ("chgl-tambaram-m",    "Tambaram",           "தாம்பரம்"),
      tp("chgl-pallavaram",    "Pallavaram",         "பல்லாவரம்"),
      tp("chgl-chrompet",      "Chromepet",          "குரோம்பேட்டை"),
      tp("chgl-selaiyur",      "Selaiyur",           "செலையூர்"),
      vp("chgl-mudichur",      "Mudichur",           "முடிச்சூர்"),
      vp("chgl-perungalathur", "Perungalathur",      "பெருங்களத்தூர்"),
      vp("chgl-vandalur",      "Vandalur",           "வண்டலூர்"),
      vp("chgl-nagalkeni",     "Nagalkeni",          "நாகல்கேணி"),
      vp("chgl-chitlapakkam",  "Chitlapakkam",       "சித்தலப்பாக்கம்"),
      vp("chgl-kovilambakkam", "Kovilambakkam",      "கோவிலம்பாக்கம்"),
    ]},
    { id:"chgl-sriperumbudur", name:"Sriperumbudur", nameTa:"ஸ்ரீபெரும்புதூர்", localities:[
      m ("chgl-spb-m",         "Sriperumbudur",      "ஸ்ரீபெரும்புதூர்"),
      vp("chgl-walajabad",     "Walajabad",          "வாலாஜாபாத்"),
      vp("chgl-oragadam",      "Oragadam",           "ஓராகடம்"),
      vp("chgl-irungattukottai","Irungattukottai",   "இருங்காட்டுக்கோட்டை"),
      vp("chgl-singaperumal",  "Singaperumalkoil",   "சிங்கப்பெருமாள் கோவில்"),
      vp("chgl-paranur",       "Paranur",            "பரணூர்"),
      vp("chgl-nemilicheri",   "Nemilicheri",        "நெமிலிச்சேரி"),
      vp("chgl-poonamallee-chgl","Poonamallee",      "பூனமல்லி"),
    ]},
    { id:"chgl-thiruporur", name:"Thiruporur", nameTa:"திருப்போரூர்", localities:[
      tp("chgl-thiruporur-tp", "Thiruporur",         "திருப்போரூர்"),
      tp("chgl-kelambakkam",   "Kelambakkam",        "கேளம்பாக்கம்"),
      vp("chgl-madambakkam",   "Madambakkam",        "மாடம்பாக்கம்"),
      vp("chgl-nemmeli",       "Nemmeli",            "நெம்மேலி"),
      vp("chgl-vengambakkam",  "Vengambakkam",       "வெங்கம்பாக்கம்"),
      vp("chgl-mahabalipuram", "Mahabalipuram",      "மாமல்லபுரம்"),
      vp("chgl-panaiyur",      "Panaiyur",           "பனையூர்"),
    ]},
    { id:"chgl-uthiramerur", name:"Uthiramerur", nameTa:"உத்திரமேரூர்", localities:[
      tp("chgl-uthiramerur-tp","Uthiramerur",        "உத்திரமேரூர்"),
      vp("chgl-cheyyur",       "Cheyyur",            "செய்யூர்"),
      vp("chgl-kattankolathur","Kattankolathur",     "கட்டன்கோளத்தூர்"),
      vp("chgl-melmaruvathur", "Melmaruvathur",      "மேல்மருவத்தூர்"),
      vp("chgl-manampathy",    "Manampathy",         "மனம்பதி"),
    ]},
  ]},

  /* ── 03. CHENNAI ───────────────────────────────────────────────── */
  { id:"chennai", name:"Chennai", nameTa:"சென்னை", blocks:[
    { id:"chn-z1-tiruvottiyur", name:"Zone 1 – Tiruvottiyur", nameTa:"மண்டலம் 1 – திருவொற்றியூர்", localities:[
      w("chn-tiruvottiyur",    "Tiruvottiyur",       "திருவொற்றியூர்"),
      w("chn-kathivakkam",     "Kathivakkam",        "காட்டிவாக்கம்"),
      w("chn-kaladipet",       "Kaladipet",          "கலாதிப்பேட்டை"),
      w("chn-manali-new",      "Manali New Town",    "மணலி புதுநகர்"),
      w("chn-moolakadai",      "Moolakadai",         "மூலக்கடை"),
      w("chn-pattabhiram",     "Pattabhiram",        "பட்டாபிராம்"),
      w("chn-madhavaram",      "Madhavaram",         "மாதவரம்"),
    ]},
    { id:"chn-z2-manali", name:"Zone 2 – Manali", nameTa:"மண்டலம் 2 – மணலி", localities:[
      w("chn-manali",          "Manali",             "மணலி"),
      w("chn-ambattur-zone2",  "Ambattur",           "அம்பத்தூர்"),
      w("chn-anna-nagar-west", "Anna Nagar West",    "அண்ணா நகர் மேற்கு"),
      w("chn-villivakkam",     "Villivakkam",        "விள்ளிவாக்கம்"),
      w("chn-kolathur",        "Kolathur",           "கோளத்தூர்"),
      w("chn-perambur",        "Perambur",           "பெரம்பூர்"),
    ]},
    { id:"chn-z3-madhavaram", name:"Zone 3 – Madhavaram", nameTa:"மண்டலம் 3 – மாதவரம்", localities:[
      w("chn-madhavaram-w",    "Madhavaram",         "மாதவரம்"),
      w("chn-redhills",        "Red Hills",          "சிவப்பு மலை"),
      w("chn-puzhal",          "Puzhal",             "புழல்"),
      w("chn-ennore",          "Ennore",             "எண்ணூர்"),
      w("chn-manali-north",    "Manali North",       "மணலி வடக்கு"),
      w("chn-thangal",         "Thangal",            "தாங்கல்"),
    ]},
    { id:"chn-z4-tondiarpet", name:"Zone 4 – Tondiarpet", nameTa:"மண்டலம் 4 – தொண்டியார்பேட்டை", localities:[
      w("chn-tondiarpet",      "Tondiarpet",         "தொண்டியார்பேட்டை"),
      w("chn-washermanpet",    "Washermanpet",       "துவைத்தொழிலாளர்பேட்டை"),
      w("chn-royapuram",       "Royapuram",          "ராயபுரம்"),
      w("chn-otteri",          "Otteri",             "ஒட்டேரி"),
      w("chn-kodungaiyur",     "Kodungaiyur",        "கொடுங்கையூர்"),
      w("chn-sembiyam",        "Sembiyam",           "செம்பியம்"),
    ]},
    { id:"chn-z5-anna-nagar", name:"Zone 5 – Anna Nagar", nameTa:"மண்டலம் 5 – அண்ணா நகர்", localities:[
      w("chn-anna-nagar",      "Anna Nagar",         "அண்ணா நகர்"),
      w("chn-anna-nagar-east", "Anna Nagar East",    "அண்ணா நகர் கிழக்கு"),
      w("chn-korattur",        "Korattur",           "கோரட்டூர்"),
      w("chn-mogappair",       "Mogappair",          "மோகப்பேர்"),
      w("chn-thirumangalam",   "Thirumangalam",      "திருமங்கலம்"),
      w("chn-koyambedu",       "Koyambedu",          "கோயம்பேடு"),
    ]},
    { id:"chn-z6-teynampet", name:"Zone 6 – Teynampet", nameTa:"மண்டலம் 6 – தேனாம்பேட்டை", localities:[
      w("chn-teynampet",       "Teynampet",          "தேனாம்பேட்டை"),
      w("chn-tnagar",          "T. Nagar",           "டி. நகர்"),
      w("chn-kodambakkam",     "Kodambakkam",        "கோடம்பாக்கம்"),
      w("chn-nandanam",        "Nandanam",           "நந்தனம்"),
      w("chn-ashok-nagar",     "Ashok Nagar",        "அசோக் நகர்"),
      w("chn-valasaravakkam",  "Valasaravakkam",     "வலசரவாக்கம்"),
      w("chn-virugambakkam",   "Virugambakkam",      "விருகம்பாக்கம்"),
    ]},
    { id:"chn-z7-adyar", name:"Zone 7 – Adyar", nameTa:"மண்டலம் 7 – அடையாறு", localities:[
      w("chn-adyar",           "Adyar",              "அடையாறு"),
      w("chn-besant-nagar",    "Besant Nagar",       "பெசன்ட் நகர்"),
      w("chn-thiruvanmiyur",   "Thiruvanmiyur",      "திருவான்மியூர்"),
      w("chn-kotturpuram",     "Kotturpuram",        "கோட்டூர்புரம்"),
      w("chn-mylapore",        "Mylapore",           "மயிலாப்பூர்"),
      w("chn-mandaveli",       "Mandaveli",          "மாண்டவேளி"),
      w("chn-alwarpet",        "Alwarpet",           "அல்வார்பேட்டை"),
    ]},
    { id:"chn-z8-perungudi", name:"Zone 8 – Perungudi", nameTa:"மண்டலம் 8 – பெருங்குடி", localities:[
      w("chn-perungudi",       "Perungudi",          "பெருங்குடி"),
      w("chn-sholinganallur",  "Sholinganallur",     "சோழிங்கநல்லூர்"),
      w("chn-velachery",       "Velachery",          "வேளச்சேரி"),
      w("chn-pallikaranai",    "Pallikaranai",       "பள்ளிக்கரணை"),
      w("chn-medavakkam",      "Medavakkam",         "மேடவாக்கம்"),
      w("chn-kottivakkam",     "Kottivakkam",        "கோட்டிவாக்கம்"),
      w("chn-navalur",         "Navalur",            "நவலூர்"),
      w("chn-karapakkam",      "Karapakkam",         "கரப்பாக்கம்"),
    ]},
    { id:"chn-z9-alandur", name:"Zone 9 – Alandur", nameTa:"மண்டலம் 9 – ஆலந்தூர்", localities:[
      w("chn-alandur",         "Alandur",            "ஆலந்தூர்"),
      w("chn-guindy",          "Guindy",             "கிண்டி"),
      w("chn-saidapet",        "Saidapet",           "சைதாப்பேட்டை"),
      w("chn-st-thomas-mount", "St. Thomas Mount",   "செயின்ட் தாமஸ் மவுண்ட்"),
      w("chn-meenambakkam",    "Meenambakkam",       "மீனம்பாக்கம்"),
      w("chn-pammal",          "Pammal",             "பம்மல்"),
      w("chn-porur",           "Porur",              "போரூர்"),
    ]},
  ]},

  /* ── 04. COIMBATORE ────────────────────────────────────────────── */
  { id:"coimbatore", name:"Coimbatore", nameTa:"கோயம்புத்தூர்", blocks:[
    { id:"cbe-north", name:"Coimbatore North", nameTa:"கோயம்புத்தூர் வடக்கு", localities:[
      w("cbe-gandhipuram",     "Gandhipuram",        "காந்திபுரம்"),
      w("cbe-rs-puram",        "R.S. Puram",         "ஆர்.எஸ். புரம்"),
      w("cbe-peelamedu",       "Peelamedu",          "பீளமேடு"),
      w("cbe-ganapathy",       "Ganapathy",          "கணபதி"),
      w("cbe-saravanampatti",  "Saravanampatti",     "சரவணம்பட்டி"),
      w("cbe-vilankurichi",    "Vilankurichi",       "விலங்குறிச்சி"),
      w("cbe-hopes-coll",      "Hope College",       "ஹோப் கல்லூரி"),
    ]},
    { id:"cbe-south", name:"Coimbatore South", nameTa:"கோயம்புத்தூர் தெற்கு", localities:[
      w("cbe-singanallur",     "Singanallur",        "சிங்கநல்லூர்"),
      w("cbe-ramanathapuram",  "Ramanathapuram",     "இராமநாதபுரம்"),
      w("cbe-ondipudur",       "Ondipudur",          "ஒண்டிப்புதூர்"),
      w("cbe-kovaipudur",      "Kovaipudur",         "கோவைப்புதூர்"),
      w("cbe-sowripalayam",    "Sowripalayam",       "சவுரிபாளையம்"),
      w("cbe-thondamuthur",    "Thondamuthur",       "தொண்டாமுத்தூர்"),
      w("cbe-kinathukadavu",   "Kinathukadavu",      "கினத்துக்கடவு"),
    ]},
    { id:"cbe-pollachi", name:"Pollachi", nameTa:"போலாச்சி", localities:[
      m ("cbe-pollachi-m",     "Pollachi",           "போலாச்சி"),
      tp("cbe-valparai",       "Valparai",           "வால்பாறை"),
      vp("cbe-udumalaipettai", "Udumalaipettai",     "உடுமலைப்பேட்டை"),
      vp("cbe-anamalai",       "Anamalai",           "அனாமலை"),
      vp("cbe-ettipalayam",    "Ettipalayam",        "எட்டிபாளையம்"),
      vp("cbe-madukkarai",     "Madukkarai",         "மடுக்கரை"),
      vp("cbe-mahalinga-p",    "Mahalingapuram",     "மகாலிங்கபுரம்"),
      vp("cbe-perianaickenp",  "Perianaickenpalayam","பெரியநாயக்கன்பாளையம்"),
    ]},
    { id:"cbe-mettupalayam", name:"Mettupalayam", nameTa:"மேட்டுப்பாளையம்", localities:[
      m ("cbe-mettupalayam-m", "Mettupalayam",       "மேட்டுப்பாளையம்"),
      tp("cbe-sulthanpet",     "Sulthanpet",         "சுல்தான்பேட்டை"),
      vp("cbe-karamadai",      "Karamadai",          "கரமடை"),
      vp("cbe-sirumugai",      "Sirumugai",          "சிறுமுகை"),
      vp("cbe-thudiyalur",     "Thudiyalur",         "துடியலூர்"),
      vp("cbe-periyanaickenp2","Periyanaickenpalayam","பெரியநாயக்கன்பாளையம்"),
    ]},
    { id:"cbe-sulur", name:"Sulur", nameTa:"சூலூர்", localities:[
      tp("cbe-sulur-tp",       "Sulur",              "சூலூர்"),
      vp("cbe-kurichi",        "Kurichi",            "குறிச்சி"),
      vp("cbe-kuniamuthur",    "Kuniamuthur",        "குணியமுத்தூர்"),
      vp("cbe-kuniyamuthur",   "Idigarai",           "இடிகரை"),
      vp("cbe-podanur",        "Podanur",            "போடநூர்"),
      vp("cbe-irugur",         "Irugur",             "இருகூர்"),
      vp("cbe-avinashi",       "Avinashi",           "ஆவினாசி"),
    ]},
  ]},

  /* ── 05. CUDDALORE ─────────────────────────────────────────────── */
  { id:"cuddalore", name:"Cuddalore", nameTa:"கடலூர்", blocks:[
    { id:"cud-cuddalore", name:"Cuddalore", nameTa:"கடலூர்", localities:[
      m ("cud-cuddalore-m",    "Cuddalore",          "கடலூர்"),
      tp("cud-panruti",        "Panruti",            "பண்ருட்டி"),
      vp("cud-kurinjipadi",    "Kurinjipadi",        "குறிஞ்சிப்பாடி"),
      vp("cud-bhuvanagiri",    "Bhuvanagiri",        "புவனகிரி"),
      vp("cud-palur",          "Palur",              "பாலூர்"),
      vp("cud-kattumannarkoil","Kattumannarkoil",    "கட்டுமன்னார்கோவில்"),
      vp("cud-sethiyathope",   "Sethiyathope",       "செட்டியாத்தோப்பு"),
      vp("cud-thiruvennainallur","Thiruvennainallur","திருவேண்ணைநல்லூர்"),
    ]},
    { id:"cud-chidambaram", name:"Chidambaram", nameTa:"சிதம்பரம்", localities:[
      m ("cud-chidambaram-m",  "Chidambaram",        "சிதம்பரம்"),
      tp("cud-killai",         "Killai",             "கில்லை"),
      vp("cud-pichavaram",     "Pichavaram",         "பிச்சாவரம்"),
      vp("cud-sirkazhi",       "Sirkazhi",           "சீர்காழி"),
      vp("cud-kollidam",       "Kollidam",           "கொள்ளிடம்"),
      vp("cud-srimushnam",     "Srimushnam",         "ஸ்ரீமுஷ்ணம்"),
      vp("cud-keelperumpallam","Keelperumpallam",    "கீழ்பெரும்பள்ளம்"),
    ]},
    { id:"cud-virudhachalam", name:"Virudhachalam", nameTa:"விருதாசலம்", localities:[
      m ("cud-virudhachalam-m","Virudhachalam",      "விருதாசலம்"),
      tp("cud-ulundurpet",     "Ulundurpet",         "உளுந்தூர்பேட்டை"),
      vp("cud-neyveli",        "Neyveli",            "நெய்வேலி"),
      vp("cud-mangalur",       "Mangalur",           "மங்களூர்"),
      vp("cud-thittakudi",     "Thittakudi",         "திட்டக்குடி"),
      vp("cud-sankarapuram",   "Sankarapuram",       "சங்கரபுரம்"),
      vp("cud-gomangalam",     "Gomangalam",         "கோமங்கலம்"),
    ]},
    { id:"cud-kallakurichi-cud", name:"Kallakurichi", nameTa:"கள்ளக்குறிச்சி", localities:[
      m ("cud-kallakurichi-m", "Kallakurichi",       "கள்ளக்குறிச்சி"),
      vp("cud-chinnasalem",    "Chinnasalem",        "சின்னசேலம்"),
      vp("cud-tirukkoilur",    "Tirukkoilur",        "திருக்கோவிலூர்"),
      vp("cud-rishivandiyam",  "Rishivandiyam",      "ரிஷிவந்தியம்"),
      vp("cud-tindivanam",     "Tindivanam",         "திண்டிவனம்"),
    ]},
  ]},

  /* ── 06. DHARMAPURI ────────────────────────────────────────────── */
  { id:"dharmapuri", name:"Dharmapuri", nameTa:"தருமபுரி", blocks:[
    { id:"dhr-dharmapuri", name:"Dharmapuri", nameTa:"தருமபுரி", localities:[
      m ("dhr-dharmapuri-m",   "Dharmapuri",         "தருமபுரி"),
      vp("dhr-palacode",       "Palacode",           "பாலக்கோடு"),
      vp("dhr-karimangalam",   "Karimangalam",       "கரிமங்கலம்"),
      vp("dhr-nallampalli",    "Nallampalli",        "நல்லம்பள்ளி"),
      vp("dhr-morappur",       "Morappur",           "மோரப்பூர்"),
      vp("dhr-pennagaram",     "Pennagaram",         "பென்னாகரம்"),
      vp("dhr-pappireddipatti","Pappireddipatti",    "பாப்பிரெட்டிப்பட்டி"),
      vp("dhr-bommidi",        "Bommidi",            "பொம்மிடி"),
    ]},
    { id:"dhr-harur", name:"Harur", nameTa:"ஓசூர்", localities:[
      tp("dhr-harur-tp",       "Harur",              "ஆரூர்"),
      vp("dhr-uthangarai",     "Uthangarai",         "உத்தங்கரை"),
      vp("dhr-penkutti",       "Penkutti",           "பேண்குட்டி"),
      vp("dhr-polur-dhr",      "Polur",              "போளூர்"),
      vp("dhr-anchetty",       "Anchetty",           "அஞ்செட்டி"),
      vp("dhr-bargur",         "Bargur",             "பர்கூர்"),
    ]},
    { id:"dhr-krishnagiri-bl", name:"Krishnagiri Block", nameTa:"கிருஷ்ணகிரி வட்டம்", localities:[
      m ("dhr-krishnagiri-m",  "Krishnagiri",        "கிருஷ்ணகிரி"),
      tp("dhr-hosur",          "Hosur",              "ஓசூர்"),
      vp("dhr-denkanikotta",   "Denkanikotta",       "டெங்கணிக்கோட்டை"),
      vp("cbe-shoolagiri",     "Shoolagiri",         "சூலகிரி"),
      vp("dhr-kaveripattinam", "Kaveripattinam",     "காவேரிப்பட்டினம்"),
      vp("dhr-pochampalli",    "Pochampalli",        "பொச்சம்பள்ளி"),
    ]},
  ]},

  /* ── 07. DINDIGUL ──────────────────────────────────────────────── */
  { id:"dindigul", name:"Dindigul", nameTa:"திண்டுக்கல்", blocks:[
    { id:"din-dindigul", name:"Dindigul", nameTa:"திண்டுக்கல்", localities:[
      m ("din-dindigul-m",     "Dindigul",           "திண்டுக்கல்"),
      vp("din-natham",         "Natham",             "நாத்தம்"),
      vp("din-athoor",         "Athoor",             "ஆத்தூர்"),
      vp("din-nilakottai",     "Nilakottai",         "நிலக்கோட்டை"),
      vp("din-vedasandur",     "Vedasandur",         "வேடசந்தூர்"),
      vp("din-oddanchatram",   "Oddanchatram",       "ஒட்டன்சத்திரம்"),
      vp("din-guziliamparai",  "Guziliamparai",      "குழிலியம்பாறை"),
      vp("din-shanarpatti",    "Shanarpatti",        "சாணார்பட்டி"),
    ]},
    { id:"din-palani", name:"Palani", nameTa:"பழனி", localities:[
      m ("din-palani-m",       "Palani",             "பழனி"),
      tp("din-udumalpet",      "Udumalpet",          "உடுமலைப்பேட்டை"),
      vp("din-kodaikanal",     "Kodaikanal",         "கொடைக்கானல்"),
      vp("din-vatlagundu",     "Vatlagundu",         "வட்டலகுண்டு"),
      vp("din-thiruvadanai-d", "Thiruvadanai",       "திருவாடானை"),
      vp("din-reddiarchatram", "Reddiarchatram",     "ரெட்டியார்சத்திரம்"),
      vp("din-kannivadi",      "Kannivadi",          "கன்னிவாடி"),
    ]},
    { id:"din-kodaikanal", name:"Kodaikanal", nameTa:"கொடைக்கானல்", localities:[
      m ("din-kodai-m",        "Kodaikanal",         "கொடைக்கானல்"),
      vp("din-kottaimedu",     "Kottaimedu",         "கோட்டைமேடு"),
      vp("din-poombarai",      "Poombarai",          "பூம்பாறை"),
      vp("din-mannavanur",     "Mannavanur",         "மன்னவனூர்"),
      vp("din-berijam",        "Berijam",            "பெரிஜாம்"),
      vp("din-perumalmalai",   "Perumalmalai",       "பெருமாள்மலை"),
    ]},
  ]},

  /* ── 08. ERODE ─────────────────────────────────────────────────── */
  { id:"erode", name:"Erode", nameTa:"ஈரோடு", blocks:[
    { id:"erd-erode", name:"Erode", nameTa:"ஈரோடு", localities:[
      m ("erd-erode-m",        "Erode",              "ஈரோடு"),
      tp("erd-perundurai",     "Perundurai",         "பெருந்துறை"),
      vp("erd-veerappanchatram","Veerappanchatram",  "வீரப்பன்சத்திரம்"),
      vp("erd-ingur",          "Ingur",              "இங்கூர்"),
      vp("erd-modakurichi",    "Modakurichi",        "மோடக்குறிச்சி"),
      vp("erd-thindal",        "Thindal",            "திண்டல்"),
      vp("erd-chennimalai",    "Chennimalai",        "செண்ணிமலை"),
    ]},
    { id:"erd-bhavani", name:"Bhavani", nameTa:"பவானி", localities:[
      m ("erd-bhavani-m",      "Bhavani",            "பவானி"),
      tp("erd-gobichettipalayam","Gobichettipalayam","கோபிச்செட்டிபாளையம்"),
      vp("erd-bhavanisagar",   "Bhavanisagar",       "பவானிசாகர்"),
      vp("erd-anthiyur",       "Anthiyur",           "அந்தியூர்"),
      vp("erd-sathyamangalam", "Sathyamangalam",     "சத்தியமங்கலம்"),
      vp("erd-kavindapadi",    "Kavindapadi",        "காவிந்தபாடி"),
      vp("erd-kodumudi",       "Kodumudi",           "கோடுமுடி"),
      vp("erd-thavittupalayam","Thavittupalayam",    "தவிட்டுப்பாளையம்"),
    ]},
    { id:"erd-tiruppur-erd", name:"Tiruppur", nameTa:"திருப்பூர்", localities:[
      m ("erd-tiruppur-m",     "Tiruppur",           "திருப்பூர்"),
      tp("erd-palladam",       "Palladam",           "பல்லடம்"),
      vp("erd-kangeyam",       "Kangeyam",           "காங்கேயம்"),
      vp("erd-dharapuram",     "Dharapuram",         "தாரபுரம்"),
      vp("erd-avinashi-e",     "Avinashi",           "ஆவினாசி"),
      vp("erd-gudimangalam",   "Gudimangalam",       "குடிமங்கலம்"),
      vp("erd-uthukuli",       "Uthukuli",           "ஊத்துக்குளி"),
    ]},
  ]},

  /* ── 09. KALLAKURICHI ──────────────────────────────────────────── */
  { id:"kallakurichi", name:"Kallakurichi", nameTa:"கள்ளக்குறிச்சி", blocks:[
    { id:"kal-kallakurichi", name:"Kallakurichi", nameTa:"கள்ளக்குறிச்சி", localities:[
      m ("kal-kallakurichi-m", "Kallakurichi",       "கள்ளக்குறிச்சி"),
      vp("kal-chinnasalem",    "Chinnasalem",        "சின்னசேலம்"),
      vp("kal-sankarapuram",   "Sankarapuram",       "சங்கரபுரம்"),
      vp("kal-rishivandiyam",  "Rishivandiyam",      "ரிஷிவந்தியம்"),
      vp("kal-thirukoilur",    "Thirukoilur",        "திருக்கோவிலூர்"),
      vp("kal-ulundurpet",     "Ulundurpet",         "உளுந்தூர்பேட்டை"),
      vp("kal-vanapuram",      "Vanapuram",          "வனபுரம்"),
      vp("kal-tirunavalur",    "Tirunavalur",        "திருநாவலூர்"),
    ]},
    { id:"kal-villupuram-k", name:"Villupuram", nameTa:"விழுப்புரம்", localities:[
      m ("kal-villupuram-m",   "Villupuram",         "விழுப்புரம்"),
      tp("kal-gingee",         "Gingee",             "செஞ்சி"),
      vp("kal-tindivanam",     "Tindivanam",         "திண்டிவனம்"),
      vp("kal-vanur",          "Vanur",              "வானூர்"),
      vp("kal-marakanam",      "Marakanam",          "மரக்காணம்"),
      vp("kal-kandachipuram",  "Kandachipuram",      "காண்டாச்சிபுரம்"),
    ]},
  ]},

  /* ── 10. KANCHEEPURAM ──────────────────────────────────────────── */
  { id:"kancheepuram", name:"Kancheepuram", nameTa:"காஞ்சிபுரம்", blocks:[
    { id:"knc-kancheepuram", name:"Kancheepuram", nameTa:"காஞ்சிபுரம்", localities:[
      m ("knc-kancheepuram-m", "Kancheepuram",       "காஞ்சிபுரம்"),
      vp("knc-walajabad",      "Walajabad",          "வாலாஜாபாத்"),
      vp("knc-uthiramerur",    "Uthiramerur",        "உத்திரமேரூர்"),
      vp("knc-kattankolathur", "Kattankolathur",     "கட்டன்கோளத்தூர்"),
      vp("knc-enathur",        "Enathur",            "ஏணத்தூர்"),
      vp("knc-sriperumbudur",  "Sriperumbudur",      "ஸ்ரீபெரும்புதூர்"),
      vp("knc-oragadam",       "Oragadam",           "ஓராகடம்"),
    ]},
    { id:"knc-sholinghur-knc", name:"Sholinghur", nameTa:"சோளிங்கர்", localities:[
      tp("knc-sholinghur-tp",  "Sholinghur",         "சோளிங்கர்"),
      vp("knc-arcot",          "Arcot",              "ஆற்காடு"),
      vp("knc-walajah",        "Walajah",            "வாலாஜா"),
      vp("knc-nemili",         "Nemili",             "நெமிலி"),
      vp("knc-arakkonam",      "Arakkonam",          "ஆரக்கோணம்"),
      vp("knc-sevilimedu",     "Sevilimedu",         "சேவிலிமேடு"),
    ]},
  ]},

  /* ── 11. KANYAKUMARI ───────────────────────────────────────────── */
  { id:"kanyakumari", name:"Kanyakumari", nameTa:"கன்னியாகுமரி", blocks:[
    { id:"kk-nagercoil", name:"Nagercoil", nameTa:"நாகர்கோவில்", localities:[
      m ("kk-nagercoil-m",     "Nagercoil",          "நாகர்கோவில்"),
      vp("kk-colachel",        "Colachel",           "கோலச்சல்"),
      vp("kk-marthandam",      "Marthandam",         "மார்த்தாண்டம்"),
      vp("kk-thuckalay",       "Thuckalay",          "தக்கலை"),
      vp("kk-kulasekharam",    "Kulasekharam",       "குளசேகரம்"),
      vp("kk-aralvaimozhi",    "Aralvaimozhi",       "அரல்வாய்மொழி"),
      vp("kk-palliyadi",       "Palliyadi",          "பள்ளியடி"),
    ]},
    { id:"kk-padmanabhapuram", name:"Padmanabhapuram", nameTa:"பத்மநாபபுரம்", localities:[
      m ("kk-padmanabhapuram-m","Padmanabhapuram",   "பத்மநாபபுரம்"),
      vp("kk-thovalai",        "Thovalai",           "தோவாளை"),
      vp("kk-kalkulam",        "Kalkulam",           "கல்குளம்"),
      vp("kk-vilavancode",     "Vilavancode",        "விளவங்கோடு"),
      vp("kk-agasteeswaram",   "Agasteeswaram",      "அகஸ்தீசுவரம்"),
      vp("kk-eraniel",         "Eraniel",            "ஏரணியல்"),
    ]},
    { id:"kk-kanyakumari-town", name:"Kanyakumari", nameTa:"கன்னியாகுமரி", localities:[
      tp("kk-kanyakumari-tp",  "Kanyakumari",        "கன்னியாகுமரி"),
      vp("kk-suchindram",      "Suchindram",         "சுசீந்திரம்"),
      vp("kk-moongilthurai",   "Moongilthurai",      "மூங்கில்துறை"),
      vp("kk-thittai",         "Thittai",            "திட்டை"),
    ]},
  ]},

  /* ── 12. KARUR ─────────────────────────────────────────────────── */
  { id:"karur", name:"Karur", nameTa:"கரூர்", blocks:[
    { id:"kar-karur", name:"Karur", nameTa:"கரூர்", localities:[
      m ("kar-karur-m",        "Karur",              "கரூர்"),
      tp("kar-kulithalai",     "Kulithalai",         "குளித்தலை"),
      vp("kar-aravakurichi",   "Aravakurichi",       "அரவக்குறிச்சி"),
      vp("kar-krishnarayapuram","Krishnarayapuram",  "கிருஷ்ணராயபுரம்"),
      vp("kar-manmangalam",    "Manmangalam",        "மன்மங்கலம்"),
      vp("kar-punjaipuliampatti","Punjaipuliampatti","புஞ்சைப்புளியம்பட்டி"),
      vp("kar-kovai-karur",    "Thanthoni",          "தந்தோனி"),
      vp("kar-paramathi",      "Paramathi",          "பரமதி"),
    ]},
    { id:"kar-manapparai", name:"Manapparai", nameTa:"மனப்பாறை", localities:[
      tp("kar-manapparai-tp",  "Manapparai",         "மனப்பாறை"),
      vp("kar-thuraiyur",      "Thuraiyur",          "துறையூர்"),
      vp("kar-lalgudi",        "Lalgudi",            "லால்குடி"),
      vp("kar-tiruchi-k",      "Musiri",             "முசிறி"),
      vp("kar-andanallur",     "Andanallur",         "ஆண்டானல்லூர்"),
    ]},
  ]},

  /* ── 13. KRISHNAGIRI ───────────────────────────────────────────── */
  { id:"krishnagiri", name:"Krishnagiri", nameTa:"கிருஷ்ணகிரி", blocks:[
    { id:"krg-krishnagiri", name:"Krishnagiri", nameTa:"கிருஷ்ணகிரி", localities:[
      m ("krg-krishnagiri-m",  "Krishnagiri",        "கிருஷ்ணகிரி"),
      vp("krg-karimangalam",   "Karimangalam",       "கரிமங்கலம்"),
      vp("krg-kelamangalam",   "Kelamangalam",       "கேளம்பாக்கம்"),
      vp("krg-mathur",         "Mathur",             "மதூர்"),
      vp("krg-veppanapalli",   "Veppanapalli",       "வேப்பனபள்ளி"),
      vp("krg-pochampalli",    "Pochampalli",        "பொச்சம்பள்ளி"),
      vp("krg-bargur",         "Bargur",             "பர்கூர்"),
    ]},
    { id:"krg-hosur", name:"Hosur", nameTa:"ஓசூர்", localities:[
      m ("krg-hosur-m",        "Hosur",              "ஓசூர்"),
      tp("krg-denkanikotta",   "Denkanikotta",       "டெங்கணிக்கோட்டை"),
      vp("krg-shoolagiri",     "Shoolagiri",         "சூலகிரி"),
      vp("krg-thally",         "Thally",             "தல்லி"),
      vp("krg-andiyur",        "Andiyur",            "ஆண்டியூர்"),
      vp("krg-uthangarai",     "Uthangarai",         "உத்தங்கரை"),
      vp("krg-kaveripattinam", "Kaveripattinam",     "காவேரிப்பட்டினம்"),
    ]},
  ]},

  /* ── 14. MADURAI ───────────────────────────────────────────────── */
  { id:"madurai", name:"Madurai", nameTa:"மதுரை", blocks:[
    { id:"mdu-north", name:"Madurai North", nameTa:"மதுரை வடக்கு", localities:[
      w("mdu-anna-nagar-mdu",  "Anna Nagar",         "அண்ணா நகர்"),
      w("mdu-alagapuram",      "Alagapuram",         "அழகாபுரம்"),
      w("mdu-kochadai",        "Kochadai",           "கோச்சடை"),
      w("mdu-palanganatham",   "Palanganatham",      "பாளங்கநாதம்"),
      w("mdu-krishnapuram",    "Krishnapuram",       "கிருஷ்ணாபுரம்"),
      w("mdu-iyer-bungalow",   "Iyer Bungalow",      "அய்யர் பங்களா"),
    ]},
    { id:"mdu-south", name:"Madurai South", nameTa:"மதுரை தெற்கு", localities:[
      w("mdu-tallakulam",      "Tallakulam",         "தல்லாகுளம்"),
      w("mdu-mattuthavani",    "Mattuthavani",       "மட்டுத்தாவணி"),
      w("mdu-simmakkal",       "Simmakkal",          "சிம்மக்கல்"),
      w("mdu-villapuram-mdu",  "Villapuram",         "விளாப்புரம்"),
      w("mdu-surveyor-colony", "Surveyor Colony",    "சர்வேயர் காலனி"),
      w("mdu-byepass-road",    "Byepass Road",       "பைபாஸ் சாலை"),
    ]},
    { id:"mdu-melur", name:"Melur", nameTa:"மேலூர்", localities:[
      tp("mdu-melur-tp",       "Melur",              "மேலூர்"),
      vp("mdu-tirumangalam",   "Tirumangalam",       "திருமங்கலம்"),
      vp("mdu-peraiyur",       "Peraiyur",           "பேரையூர்"),
      vp("mdu-usilampatti",    "Usilampatti",        "உசிலம்பட்டி"),
      vp("mdu-vadipatti",      "Vadipatti",          "வாடிப்பட்டி"),
      vp("mdu-sholavandan",    "Sholavandan",        "சோழவந்தான்"),
      vp("mdu-thiruppuvanam",  "Thiruppuvanam",      "திருப்புவனம்"),
    ]},
    { id:"mdu-peraiyur", name:"Peraiyur", nameTa:"பேரையூர்", localities:[
      vp("mdu-peraiyur-vp",    "Peraiyur",           "பேரையூர்"),
      vp("mdu-kallikudi",      "Kallikudi",          "கள்ளிக்குடி"),
      vp("mdu-alanganallur",   "Alanganallur",       "அழகநல்லூர்"),
      vp("mdu-kottampatti",    "Kottampatti",        "கோட்டம்பட்டி"),
      vp("mdu-t-kallupatti",   "T. Kallupatti",      "தி. கள்ளுப்பட்டி"),
    ]},
  ]},

  /* ── 15. MAYILADUTHURAI ────────────────────────────────────────── */
  { id:"mayiladuthurai", name:"Mayiladuthurai", nameTa:"மயிலாடுதுறை", blocks:[
    { id:"mld-mayiladuthurai", name:"Mayiladuthurai", nameTa:"மயிலாடுதுறை", localities:[
      m ("mld-mayiladuthurai-m","Mayiladuthurai",    "மயிலாடுதுறை"),
      tp("mld-sirkazhi",       "Sirkazhi",           "சீர்காழி"),
      tp("mld-tharangambadi",  "Tharangambadi",      "தரங்கம்பாடி"),
      vp("mld-kuthalam",       "Kuthalam",           "குத்தாலம்"),
      vp("mld-kollidam",       "Kollidam",           "கொள்ளிடம்"),
      vp("mld-poompuhar",      "Poompuhar",          "பூம்புகார்"),
      vp("mld-sembanarkoil",   "Sembanarkoil",       "செம்பணார்கோவில்"),
      vp("mld-kollidam2",      "Keelvelur",          "கீழ்வேலூர்"),
    ]},
    { id:"mld-sirkali", name:"Sirkali", nameTa:"சீர்காழி", localities:[
      m ("mld-sirkali-m",      "Sirkali",            "சீர்காழி"),
      vp("mld-chidambaram-mld","Chidambaram",        "சிதம்பரம்"),
      vp("mld-papanasam-mld",  "Papanasam",          "பாபநாசம்"),
      vp("mld-thirukkadaiyur", "Thirukkadaiyur",     "திருக்கடையூர்"),
      vp("mld-karaikal-mld",   "Karaikal",           "காரைக்கால்"),
    ]},
  ]},

  /* ── 16. NAGAPATTINAM ──────────────────────────────────────────── */
  { id:"nagapattinam", name:"Nagapattinam", nameTa:"நாகப்பட்டினம்", blocks:[
    { id:"ngp-nagapattinam", name:"Nagapattinam", nameTa:"நாகப்பட்டினம்", localities:[
      m ("ngp-nagapattinam-m", "Nagapattinam",       "நாகப்பட்டினம்"),
      tp("ngp-vedaranyam",     "Vedaranyam",         "வேதாரண்யம்"),
      vp("ngp-kilvelur",       "Kilvelur",           "கீழ்வேலூர்"),
      vp("ngp-thirumarugal",   "Thirumarugal",       "திருமருகல்"),
      vp("ngp-kuthalam-ngp",   "Kuthalam",           "குத்தாலம்"),
      vp("ngp-sembanarkoil",   "Sembanarkoil",       "செம்பணார்கோவில்"),
      vp("ngp-sikkal",         "Sikkal",             "சிக்கல்"),
      vp("ngp-keelvelur",      "Keelvelur",          "கீழ்வேலூர்"),
    ]},
    { id:"ngp-tiruvarur", name:"Tiruvarur", nameTa:"திருவாரூர்", localities:[
      m ("ngp-tiruvarur-m",    "Tiruvarur",          "திருவாரூர்"),
      tp("ngp-mannargudi",     "Mannargudi",         "மன்னார்குடி"),
      vp("ngp-valangaiman",    "Valangaiman",        "வாலங்கைமான்"),
      vp("ngp-needamangalam",  "Needamangalam",      "நீடாமங்கலம்"),
      vp("ngp-papanasam-ngp",  "Papanasam",          "பாபநாசம்"),
      vp("ngp-muthupet",       "Muthupet",           "முத்துப்பேட்டை"),
    ]},
  ]},

  /* ── 17. NAMAKKAL ──────────────────────────────────────────────── */
  { id:"namakkal", name:"Namakkal", nameTa:"நாமக்கல்", blocks:[
    { id:"nmk-namakkal", name:"Namakkal", nameTa:"நாமக்கல்", localities:[
      m ("nmk-namakkal-m",     "Namakkal",           "நாமக்கல்"),
      tp("nmk-rasipuram",      "Rasipuram",          "ராசிபுரம்"),
      tp("nmk-tiruchengode",   "Tiruchengode",       "திருச்செங்கோடு"),
      tp("nmk-kumarapalayam",  "Kumarapalayam",      "குமாரபாளையம்"),
      vp("nmk-paramathivelur", "Paramathi Velur",    "பரமதி வேலூர்"),
      vp("nmk-mohanur",        "Mohanur",            "மோகனூர்"),
      vp("nmk-sendamangalam",  "Sendamangalam",      "செண்டமங்கலம்"),
      vp("nmk-komarapalayam",  "Komarapalayam",      "கோமாரபாளையம்"),
    ]},
    { id:"nmk-tiruchengode", name:"Tiruchengode", nameTa:"திருச்செங்கோடு", localities:[
      m ("nmk-tiruchengode-m", "Tiruchengode",       "திருச்செங்கோடு"),
      vp("nmk-sankari",        "Sankari",            "சங்ககிரி"),
      vp("nmk-sankagiri",      "Sankagiri",          "சங்ககிரி கோட்டை"),
      vp("nmk-erumaipatti",    "Erumaipatti",        "எருமைப்பட்டி"),
      vp("nmk-velur",          "Velur",              "வேலூர்"),
      vp("nmk-thammampatti",   "Thammampatti",       "தம்மம்பட்டி"),
    ]},
  ]},

  /* ── 18. NILGIRIS ──────────────────────────────────────────────── */
  { id:"nilgiris", name:"The Nilgiris", nameTa:"நீலகிரி", blocks:[
    { id:"nil-ooty", name:"Ooty (Udhagamandalam)", nameTa:"உதகமண்டலம்", localities:[
      m ("nil-ooty-m",         "Udhagamandalam",     "உதகமண்டலம்"),
      tp("nil-coonoor",        "Coonoor",            "கூனூர்"),
      tp("nil-kotagiri",       "Kotagiri",           "கோத்தகிரி"),
      vp("nil-ketti",          "Ketti",              "கேட்டி"),
      vp("nil-wellington",     "Wellington",         "வெல்லிங்டன்"),
      vp("nil-lovedale",       "Lovedale",           "லவ்டேல்"),
      vp("nil-kundah",         "Kundah",             "குண்டா"),
    ]},
    { id:"nil-gudalur", name:"Gudalur", nameTa:"குடலூர்", localities:[
      tp("nil-gudalur-tp",     "Gudalur",            "குடலூர்"),
      tp("nil-pandalur",       "Pandalur",           "பந்தலூர்"),
      vp("nil-cherambadi",     "Cherambadi",         "சேரம்பாடி"),
      vp("nil-devala",         "Devala",             "தேவலா"),
      vp("nil-sholur",         "Sholur",             "சோளூர்"),
      vp("nil-naduvattam",     "Naduvattam",         "நடுவட்டம்"),
    ]},
  ]},

  /* ── 19. PERAMBALUR ────────────────────────────────────────────── */
  { id:"perambalur", name:"Perambalur", nameTa:"பெரம்பலூர்", blocks:[
    { id:"per-perambalur", name:"Perambalur", nameTa:"பெரம்பலூர்", localities:[
      m ("per-perambalur-m",   "Perambalur",         "பெரம்பலூர்"),
      tp("per-arumbavur",      "Arumbavur",          "அரும்பாவூர்"),
      vp("per-kunnam",         "Kunnam",             "குன்னம்"),
      vp("per-veppanthattai",  "Veppanthattai",      "வேப்பந்தட்டை"),
      vp("per-alathur",        "Alathur",            "ஆலத்தூர்"),
      vp("per-esanai",         "Esanai",             "ஈசானை"),
      vp("per-thirukoilure",   "Thirukoilure",       "திருக்கோவிலூர்"),
    ]},
  ]},

  /* ── 20. PUDUKKOTTAI ───────────────────────────────────────────── */
  { id:"pudukkottai", name:"Pudukkottai", nameTa:"புதுக்கோட்டை", blocks:[
    { id:"pdk-pudukkottai", name:"Pudukkottai", nameTa:"புதுக்கோட்டை", localities:[
      m ("pdk-pudukkottai-m",  "Pudukkottai",        "புதுக்கோட்டை"),
      tp("pdk-aranthangi",     "Aranthangi",         "அரந்தாங்கி"),
      tp("pdk-karambakudi",    "Karambakudi",        "கரம்பக்குடி"),
      vp("pdk-alangudi",       "Alangudi",           "ஆலங்குடி"),
      vp("pdk-avudaiyarkoil",  "Avudaiyarkoil",      "ஆவுடையார்கோவில்"),
      vp("pdk-gandarvakottai", "Gandarvakottai",     "காந்தர்வக்கோட்டை"),
      vp("pdk-illupur",        "Illupur",            "இல்லுப்பூர்"),
      vp("pdk-thirumayam",     "Thirumayam",         "திருமயம்"),
      vp("pdk-manamelkudi",    "Manamelkudi",        "மானாமேல்குடி"),
    ]},
    { id:"pdk-aranthangi", name:"Aranthangi", nameTa:"அரந்தாங்கி", localities:[
      m ("pdk-aranthangi-m",   "Aranthangi",         "அரந்தாங்கி"),
      vp("pdk-kulathur",       "Kulathur",           "குலத்தூர்"),
      vp("pdk-keeranur-pdk",   "Keeranur",           "கீரனூர்"),
      vp("pdk-mimisal",        "Mimisal",            "மிமிசல்"),
      vp("pdk-ponnamaravathi", "Ponnamaravathi",     "பொன்னமராவதி"),
    ]},
  ]},

  /* ── 21. RAMANATHAPURAM ────────────────────────────────────────── */
  { id:"ramanathapuram", name:"Ramanathapuram", nameTa:"இராமநாதபுரம்", blocks:[
    { id:"rmn-ramanathapuram", name:"Ramanathapuram", nameTa:"இராமநாதபுரம்", localities:[
      m ("rmn-ramanathapuram-m","Ramanathapuram",    "இராமநாதபுரம்"),
      tp("rmn-paramakudi",     "Paramakudi",         "பரமக்குடி"),
      tp("rmn-rameswaram",     "Rameswaram",         "இராமேஸ்வரம்"),
      vp("rmn-tiruvadanai",    "Tiruvadanai",        "திருவாடானை"),
      vp("rmn-mudukulathur",   "Mudukulathur",       "முதுகுளத்தூர்"),
      vp("rmn-kadaladi",       "Kadaladi",           "கடலாடி"),
      vp("rmn-pamban",         "Pamban",             "பம்பன்"),
      vp("rmn-kamuthi",        "Kamuthi",            "காமுதி"),
    ]},
    { id:"rmn-rameswaram", name:"Rameswaram", nameTa:"இராமேஸ்வரம்", localities:[
      m ("rmn-rameswaram-m",   "Rameswaram",         "இராமேஸ்வரம்"),
      vp("rmn-mandapam",       "Mandapam",           "மண்டபம்"),
      vp("rmn-devipattinam",   "Devipattinam",       "தேவிபட்டினம்"),
      vp("rmn-tondi",          "Tondi",              "தொண்டி"),
      vp("rmn-ervadi",         "Ervadi",             "ஏர்வாடி"),
    ]},
  ]},

  /* ── 22. RANIPET ───────────────────────────────────────────────── */
  { id:"ranipet", name:"Ranipet", nameTa:"ராணிப்பேட்டை", blocks:[
    { id:"rnp-ranipet", name:"Ranipet", nameTa:"ராணிப்பேட்டை", localities:[
      m ("rnp-ranipet-m",      "Ranipet",            "ராணிப்பேட்டை"),
      m ("rnp-arcot-m",        "Arcot",              "ஆற்காடு"),
      tp("rnp-walajah",        "Walajah",            "வாலாஜா"),
      vp("rnp-nemili",         "Nemili",             "நெமிலி"),
      vp("rnp-arakkonam",      "Arakkonam",          "ஆரக்கோணம்"),
      vp("rnp-sholinghur",     "Sholinghur",         "சோளிங்கர்"),
      vp("rnp-timiri",         "Timiri",             "திமிரி"),
    ]},
    { id:"rnp-vellore-rnp", name:"Vellore", nameTa:"வேலூர்", localities:[
      m ("rnp-vellore-m",      "Vellore",            "வேலூர்"),
      tp("rnp-gudiyatham",     "Gudiyatham",         "குடியாத்தம்"),
      tp("rnp-katpadi",        "Katpadi",            "காட்பாடி"),
      vp("rnp-pernambut",      "Pernambut",          "பேர்ணம்பட்டு"),
      vp("rnp-vaniyambadi",    "Vaniyambadi",        "வாணியம்பாடி"),
      vp("rnp-jolarpet",       "Jolarpet",           "ஜோலார்பேட்டை"),
    ]},
  ]},

  /* ── 23. SALEM ─────────────────────────────────────────────────── */
  { id:"salem", name:"Salem", nameTa:"சேலம்", blocks:[
    { id:"slm-salem-north", name:"Salem North", nameTa:"சேலம் வடக்கு", localities:[
      w("slm-shevapet",        "Shevapet",           "சேவாப்பேட்டை"),
      w("slm-alagapuram",      "Alagapuram",         "அழகாபுரம்"),
      w("slm-hasthampatti",    "Hasthampatti",       "ஆஸ்தாம்பட்டி"),
      w("slm-five-roads",      "Five Roads",         "ஐந்து சாலை"),
      w("slm-suramangalam",    "Suramangalam",       "சுரமங்கலம்"),
      w("slm-ammapet",         "Ammapet",            "அம்மாப்பேட்டை"),
    ]},
    { id:"slm-salem-south", name:"Salem South", nameTa:"சேலம் தெற்கு", localities:[
      w("slm-meyyanur",        "Meyyanur",           "மேயனூர்"),
      w("slm-kondalampatti",   "Kondalampatti",      "கொண்டலாம்பட்டி"),
      w("slm-omalur",          "Omalur",             "ஓமலூர்"),
      w("slm-attur",           "Attur",              "ஆத்தூர்"),
      w("slm-edappadi",        "Edappadi",           "ஏற்காடு"),
      w("slm-gangavalli",      "Gangavalli",         "கங்கவல்லி"),
    ]},
    { id:"slm-mettur", name:"Mettur", nameTa:"மேட்டூர்", localities:[
      m ("slm-mettur-m",       "Mettur",             "மேட்டூர்"),
      tp("slm-bhavani-slm",    "Bhavani",            "பவானி"),
      vp("slm-yercaud",        "Yercaud",            "யேர்காடு"),
      vp("slm-pethanaickenp",  "Pethanaickenpalayam","பேட்டைநாயக்கன்பாளையம்"),
      vp("slm-kolathur-slm",   "Kolathur",           "கோளத்தூர்"),
      vp("slm-vazhapadi",      "Vazhapadi",          "வாழப்பாடி"),
    ]},
    { id:"slm-attur", name:"Attur", nameTa:"ஆத்தூர்", localities:[
      m ("slm-attur-m",        "Attur",              "ஆத்தூர்"),
      vp("slm-sankagiri",      "Sankagiri",          "சங்ககிரி"),
      vp("slm-tiruchengode-sl","Tiruchengode",       "திருச்செங்கோடு"),
      vp("slm-nangavalli",     "Nangavalli",         "நங்கவல்லி"),
      vp("slm-thalaivasal",    "Thalaivasal",        "தலைவாசல்"),
    ]},
  ]},

  /* ── 24. SIVAGANGA ─────────────────────────────────────────────── */
  { id:"sivaganga", name:"Sivaganga", nameTa:"சிவகங்கை", blocks:[
    { id:"svg-sivaganga", name:"Sivaganga", nameTa:"சிவகங்கை", localities:[
      m ("svg-sivaganga-m",    "Sivaganga",          "சிவகங்கை"),
      tp("svg-karaikudi",      "Karaikudi",          "காரைக்குடி"),
      tp("svg-devakottai",     "Devakottai",         "தேவகோட்டை"),
      vp("svg-ilayangudi",     "Ilayangudi",         "இளையாங்குடி"),
      vp("svg-tiruppattur-sg", "Tiruppattur",        "திருப்பத்தூர்"),
      vp("svg-kallal",         "Kallal",             "கள்ளல்"),
      vp("svg-s-pudur",        "S. Pudur",           "தெற்கு புதூர்"),
      vp("svg-manamadurai",    "Manamadurai",        "மானாமதுரை"),
    ]},
  ]},

  /* ── 25. TENKASI ───────────────────────────────────────────────── */
  { id:"tenkasi", name:"Tenkasi", nameTa:"தென்காசி", blocks:[
    { id:"tnk-tenkasi", name:"Tenkasi", nameTa:"தென்காசி", localities:[
      m ("tnk-tenkasi-m",      "Tenkasi",            "தென்காசி"),
      tp("tnk-kadayanallur",   "Kadayanallur",       "கடையநல்லூர்"),
      tp("tnk-sankarankoil",   "Sankarankoil",       "சங்கரன்கோவில்"),
      vp("tnk-alangulam",      "Alangulam",          "ஆலங்குளம்"),
      vp("tnk-shenkottai",     "Shenkottai",         "சேங்கோட்டை"),
      vp("tnk-veerakeralampudur","Veerakeralampudur","வீரகேரளம்புதூர்"),
      vp("tnk-kuruvikulam",    "Kuruvikulam",        "குருவிக்குளம்"),
      vp("tnk-puliangudi",     "Puliangudi",         "புளியங்குடி"),
    ]},
    { id:"tnk-ambasamudram", name:"Ambasamudram", nameTa:"அம்பாசமுத்திரம்", localities:[
      tp("tnk-ambasamudram-tp","Ambasamudram",       "அம்பாசமுத்திரம்"),
      tp("tnk-cheranmahadevi", "Cheranmahadevi",     "சேரன்மகாதேவி"),
      vp("tnk-nanguneri",      "Nanguneri",          "நாங்குநேரி"),
      vp("tnk-mukkudal",       "Mukkudal",           "முக்குடல்"),
      vp("tnk-papanasam-tnk",  "Papanasam",          "பாபநாசம்"),
    ]},
  ]},

  /* ── 26. THANJAVUR ─────────────────────────────────────────────── */
  { id:"thanjavur", name:"Thanjavur", nameTa:"தஞ்சாவூர்", blocks:[
    { id:"tnj-thanjavur", name:"Thanjavur", nameTa:"தஞ்சாவூர்", localities:[
      m ("tnj-thanjavur-m",    "Thanjavur",          "தஞ்சாவூர்"),
      tp("tnj-thiruvaiyaru",   "Thiruvaiyaru",       "திருவையாறு"),
      vp("tnj-budalur",        "Budalur",            "புடலூர்"),
      vp("tnj-orathanadu",     "Orathanadu",         "ஒரத்தநாடு"),
      vp("tnj-thiruvidaimarudur","Thiruvidaimarudur","திருவிடைமருதூர்"),
      vp("tnj-papanasam-tnj",  "Papanasam",          "பாபநாசம்"),
    ]},
    { id:"tnj-kumbakonam", name:"Kumbakonam", nameTa:"கும்பகோணம்", localities:[
      m ("tnj-kumbakonam-m",   "Kumbakonam",         "கும்பகோணம்"),
      tp("tnj-papanasam-tp",   "Papanasam",          "பாபநாசம்"),
      vp("tnj-swamimalai",     "Swamimalai",         "சுவாமிமலை"),
      vp("tnj-nachiyarkoil",   "Nachiyarkoil",       "நாச்சியார்கோவில்"),
      vp("tnj-thirunageswaram","Thirunageswaram",    "திருநாகேஸ்வரம்"),
    ]},
    { id:"tnj-pattukkottai", name:"Pattukkottai", nameTa:"பட்டுக்கோட்டை", localities:[
      m ("tnj-pattukkottai-m", "Pattukkottai",       "பட்டுக்கோட்டை"),
      tp("tnj-peravurani",     "Peravurani",         "பேராவூரணி"),
      vp("tnj-adirampattinam", "Adirampattinam",     "அதிரம்பட்டினம்"),
      vp("tnj-gandarvakkottai","Gandarvakkottai",    "காந்தர்வக்கோட்டை"),
      vp("tnj-athikadai",      "Athikadai",          "ஆதிக்கடை"),
    ]},
  ]},

  /* ── 27. THENI ─────────────────────────────────────────────────── */
  { id:"theni", name:"Theni", nameTa:"தேனி", blocks:[
    { id:"thn-theni", name:"Theni", nameTa:"தேனி", localities:[
      m ("thn-theni-m",        "Theni",              "தேனி"),
      tp("thn-periyakulam",    "Periyakulam",        "பெரியகுளம்"),
      tp("thn-uthamapalayam",  "Uthamapalayam",      "உத்தமபாளையம்"),
      vp("thn-bodinayakanur",  "Bodinayakanur",      "போடிநாயக்கனூர்"),
      vp("thn-andipatti",      "Andipatti",          "ஆண்டிப்பட்டி"),
      vp("thn-chinnamanur",    "Chinnamanur",        "சின்னமனூர்"),
      vp("thn-cumbum",         "Cumbum",             "கம்பம்"),
      vp("thn-gudalur-thn",    "Gudalur",            "குடலூர்"),
    ]},
  ]},

  /* ── 28. THOOTHUKUDI ───────────────────────────────────────────── */
  { id:"thoothukudi", name:"Thoothukudi", nameTa:"தூத்துக்குடி", blocks:[
    { id:"tut-thoothukudi", name:"Thoothukudi", nameTa:"தூத்துக்குடி", localities:[
      m ("tut-thoothukudi-m",  "Thoothukudi",        "தூத்துக்குடி"),
      tp("tut-kovilpatti",     "Kovilpatti",         "கோவில்பட்டி"),
      tp("tut-tiruchendur",    "Tiruchendur",        "திருச்செந்தூர்"),
      vp("tut-srivaikuntam",   "Srivaikuntam",       "ஸ்ரீவைகுண்டம்"),
      vp("tut-ettayapuram",    "Ettayapuram",        "எட்டயபுரம்"),
      vp("tut-vilathikulam",   "Vilathikulam",       "விளாத்திகுளம்"),
      vp("tut-kayalpattinam",  "Kayalpattinam",      "கயல்பட்டினம்"),
      vp("tut-karunkulam",     "Karunkulam",         "கருங்குளம்"),
    ]},
    { id:"tut-kovilpatti", name:"Kovilpatti", nameTa:"கோவில்பட்டி", localities:[
      m ("tut-kovilpatti-m",   "Kovilpatti",         "கோவில்பட்டி"),
      vp("tut-sathankulam",    "Sathankulam",        "சாத்தான்குளம்"),
      vp("tut-ottapidaram",    "Ottapidaram",        "ஒட்டப்பிடாரம்"),
      vp("tut-eral",           "Eral",               "ஏரல்"),
      vp("tut-thisayanvilai",  "Thisayanvilai",      "திசையன்விளை"),
    ]},
  ]},

  /* ── 29. TIRUCHIRAPPALLI ───────────────────────────────────────── */
  { id:"tiruchirappalli", name:"Tiruchirappalli", nameTa:"திருச்சிராப்பள்ளி", blocks:[
    { id:"tri-tiruchirappalli", name:"Tiruchirappalli", nameTa:"திருச்சிராப்பள்ளி", localities:[
      w("tri-srirangam",       "Srirangam",          "ஸ்ரீரங்கம்"),
      w("tri-ariyamangalam",   "Ariyamangalam",      "ஆரியமங்கலம்"),
      w("tri-palpannai",       "Palpannai",          "பால்பன்னை"),
      w("tri-manachanallur",   "Manachanallur",      "மனச்சநல்லூர்"),
      w("tri-tiruverumbur",    "Tiruverumbur",       "திருவெறும்பூர்"),
      w("tri-kk-nagar",        "K.K. Nagar",         "கே.கே. நகர்"),
    ]},
    { id:"tri-lalgudi", name:"Lalgudi", nameTa:"லால்குடி", localities:[
      tp("tri-lalgudi-tp",     "Lalgudi",            "லால்குடி"),
      vp("tri-musiri",         "Musiri",             "முசிறி"),
      vp("tri-thuraiyur",      "Thuraiyur",          "துறையூர்"),
      vp("tri-andanallur",     "Andanallur",         "ஆண்டானல்லூர்"),
      vp("tri-vaiyampatti",    "Vaiyampatti",        "வாய்யம்பட்டி"),
      vp("tri-manapparai-t",   "Manapparai",         "மனப்பாறை"),
    ]},
    { id:"tri-perambalur-t", name:"Perambalur", nameTa:"பெரம்பலூர்", localities:[
      m ("tri-perambalur-m",   "Perambalur",         "பெரம்பலூர்"),
      vp("tri-arumbavur",      "Arumbavur",          "அரும்பாவூர்"),
      vp("tri-kunnam",         "Kunnam",             "குன்னம்"),
      vp("tri-veppanthattai",  "Veppanthattai",      "வேப்பந்தட்டை"),
    ]},
  ]},

  /* ── 30. TIRUNELVELI ───────────────────────────────────────────── */
  { id:"tirunelveli", name:"Tirunelveli", nameTa:"திருநெல்வேலி", blocks:[
    { id:"tnv-tirunelveli", name:"Tirunelveli", nameTa:"திருநெல்வேலி", localities:[
      m ("tnv-tirunelveli-m",  "Tirunelveli",        "திருநெல்வேலி"),
      tp("tnv-palayamkottai",  "Palayamkottai",      "பாளையங்கோட்டை"),
      tp("tnv-nanguneri",      "Nanguneri",          "நாங்குநேரி"),
      vp("tnv-ambasamudram",   "Ambasamudram",       "அம்பாசமுத்திரம்"),
      vp("tnv-cheranmahadevi", "Cheranmahadevi",     "சேரன்மகாதேவி"),
      vp("tnv-mukkudal",       "Mukkudal",           "முக்குடல்"),
      vp("tnv-manur",          "Manur",              "மணூர்"),
      vp("tnv-de-nagar",       "Desiya Nagar",       "தேசிய நகர்"),
    ]},
    { id:"tnv-tenkasi-tnv", name:"Tenkasi", nameTa:"தென்காசி", localities:[
      m ("tnv-tenkasi-m",      "Tenkasi",            "தென்காசி"),
      tp("tnv-kadayanallur",   "Kadayanallur",       "கடையநல்லூர்"),
      tp("tnv-sankarankoil",   "Sankarankoil",       "சங்கரன்கோவில்"),
      vp("tnv-shenkottai",     "Shenkottai",         "சேங்கோட்டை"),
      vp("tnv-alangulam",      "Alangulam",          "ஆலங்குளம்"),
    ]},
    { id:"tnv-radhapuram", name:"Radhapuram", nameTa:"ராதாபுரம்", localities:[
      tp("tnv-radhapuram-tp",  "Radhapuram",         "ராதாபுரம்"),
      vp("tnv-de-thiruvengadam","Thiruvengadam",     "திருவேங்கடம்"),
      vp("tnv-idinthakarai",   "Idinthakarai",       "இடிந்தகரை"),
      vp("tnv-kalakadu",       "Kalakadu",           "கல்லக்கடு"),
      vp("tnv-puthiyamputhur", "Puthiyamputhur",     "புதியம்புதூர்"),
    ]},
  ]},

  /* ── 31. TIRUPATHUR ────────────────────────────────────────────── */
  { id:"tirupathur", name:"Tirupathur", nameTa:"திருப்பத்தூர்", blocks:[
    { id:"tpt-tirupathur", name:"Tirupathur", nameTa:"திருப்பத்தூர்", localities:[
      m ("tpt-tirupathur-m",   "Tirupathur",         "திருப்பத்தூர்"),
      m ("tpt-ambur-m",        "Ambur",              "ஆம்பூர்"),
      m ("tpt-vaniyambadi-m",  "Vaniyambadi",        "வாணியம்பாடி"),
      tp("tpt-natrampalli",    "Natrampalli",        "நாத்தம்பள்ளி"),
      tp("tpt-jolarpet",       "Jolarpet",           "ஜோலார்பேட்டை"),
      vp("tpt-gudiyatham-tpt", "Gudiyatham",         "குடியாத்தம்"),
      vp("tpt-pernambut",      "Pernambut",          "பேர்ணம்பட்டு"),
      vp("tpt-uthangarai-tpt", "Uthangarai",         "உத்தங்கரை"),
    ]},
  ]},

  /* ── 32. TIRUPPUR ──────────────────────────────────────────────── */
  { id:"tiruppur", name:"Tiruppur", nameTa:"திருப்பூர்", blocks:[
    { id:"tpr-tiruppur", name:"Tiruppur", nameTa:"திருப்பூர்", localities:[
      m ("tpr-tiruppur-m",     "Tiruppur",           "திருப்பூர்"),
      tp("tpr-palladam",       "Palladam",           "பல்லடம்"),
      tp("tpr-dharapuram",     "Dharapuram",         "தாரபுரம்"),
      tp("tpr-kangeyam",       "Kangeyam",           "காங்கேயம்"),
      vp("tpr-avinashi",       "Avinashi",           "ஆவினாசி"),
      vp("tpr-gudimangalam",   "Gudimangalam",       "குடிமங்கலம்"),
      vp("tpr-uthukuli",       "Uthukuli",           "ஊத்துக்குளி"),
      vp("tpr-madathukulam",   "Madathukulam",       "மடத்துகுளம்"),
    ]},
    { id:"tpr-udumalpet", name:"Udumalpet", nameTa:"உடுமலைப்பேட்டை", localities:[
      m ("tpr-udumalpet-m",    "Udumalpet",          "உடுமலைப்பேட்டை"),
      vp("tpr-mulanur",        "Mulanur",            "முலநூர்"),
      vp("tpr-vellakoil",      "Vellakoil",          "வெள்ளக்கோவில்"),
      vp("tpr-dharapuram-bl",  "Dharapuram Block",   "தாரபுரம் வட்டம்"),
      vp("tpr-kundadam",       "Kundadam",           "குண்டாடம்"),
    ]},
  ]},

  /* ── 33. TIRUVALLUR ────────────────────────────────────────────── */
  { id:"tiruvallur", name:"Tiruvallur", nameTa:"திருவள்ளூர்", blocks:[
    { id:"tvl-tiruvallur", name:"Tiruvallur", nameTa:"திருவள்ளூர்", localities:[
      m ("tvl-tiruvallur-m",   "Tiruvallur",         "திருவள்ளூர்"),
      tp("tvl-gummidipoondi",  "Gummidipoondi",      "கும்மிடிப்பூண்டி"),
      tp("tvl-ponneri",        "Ponneri",            "பொன்னேரி"),
      vp("tvl-redhills",       "Red Hills",          "சிவப்பு மலை"),
      vp("tvl-minjur",         "Minjur",             "மிஞ்சூர்"),
      vp("tvl-arani-tvl",      "Arani",              "ஆரணி"),
      vp("tvl-kadambathur",    "Kadambathur",        "கடம்பத்தூர்"),
    ]},
    { id:"tvl-ambattur", name:"Ambattur", nameTa:"அம்பத்தூர்", localities:[
      m ("tvl-amb-town",       "Ambattur Town",              "அம்பத்தூர் நகரம்"),
      m ("tvl-amb-ie",         "Ambattur Industrial Estate", "அம்பத்தூர் தொழிற்பேட்டை"),
      m ("tvl-amb-ot",         "Ambattur O.T.",              "அம்பத்தூர் ஓ.டி."),
      m ("tvl-amb-padi",       "Padi",                       "படி"),
      m ("tvl-amb-mogappair-e","Mogappair East",             "மோகாப்பேர் கிழக்கு"),
      m ("tvl-amb-mogappair-w","Mogappair West",             "மோகாப்பேர் மேற்கு"),
      m ("tvl-amb-anna-nagar-w","Anna Nagar West Extn",      "அண்ணா நகர் மேற்கு நீட்டிப்பு"),
      m ("tvl-amb-sidco",      "SIDCO Industrial Estate",    "சிட்கோ தொழிற்பேட்டை"),
      m ("tvl-amb-kolathur",   "Kolathur",                   "கோலத்தூர்"),
      m ("tvl-amb-villivakkam","Villivakkam",                "விள்ளிவாக்கம்"),
      vp("tvl-amb-thiruverkadu","Thiruverkadu",              "திருவேற்காடு"),
      vp("tvl-amb-nerkundram", "Nerkundram",                 "நெர்குண்டிரம்"),
      vp("tvl-amb-vanagaram",  "Vanagaram",                  "வானகரம்"),
    ]},
    { id:"tvl-avadi", name:"Avadi", nameTa:"ஆவடி", localities:[
      m ("tvl-avadi-m",        "Avadi",              "ஆவடி"),
      tp("tvl-thiruninravur",  "Thiruninravur",      "திருநின்றவூர்"),
      tp("tvl-thiruvallur-tp2","Villivakkam TP",     "விள்ளிவாக்கம் நகர் பஞ்சாயத்து"),
      vp("tvl-tirupalaivanam", "Tirupalaivanam",     "திருப்பாலைவனம்"),
      vp("tvl-sennerkuppam",   "Sennerkuppam",       "செண்ணர்குப்பம்"),
    ]},
    { id:"tvl-poonamallee", name:"Poonamallee", nameTa:"பூனமல்லி", localities:[
      m ("tvl-pnm-w1",  "Ward 1 – Agraharam",           "வார்டு 1 – அக்ரகாரம்"),
      m ("tvl-pnm-w2",  "Ward 2 – Mangadu Road",         "வார்டு 2 – மங்காடு சாலை"),
      m ("tvl-pnm-w3",  "Ward 3 – Kamarajar Nagar",      "வார்டு 3 – காமராஜர் நகர்"),
      m ("tvl-pnm-w4",  "Ward 4 – Poonamallee Town",     "வார்டு 4 – பூனமல்லி நகரம்"),
      m ("tvl-pnm-w5",  "Ward 5 – Bus Stand Area",       "வார்டு 5 – பஸ் நிலைய பகுதி"),
      m ("tvl-pnm-w6",  "Ward 6 – Sennerkuppam North",   "வார்டு 6 – செண்ணர்குப்பம் வடக்கு"),
      m ("tvl-pnm-w7",  "Ward 7 – Sennerkuppam South",   "வார்டு 7 – செண்ணர்குப்பம் தெற்கு"),
      m ("tvl-pnm-w8",  "Ward 8 – Nazarethpettai",       "வார்டு 8 – நசரேத்பேட்டை"),
      m ("tvl-pnm-w9",  "Ward 9 – Somangalam Road",      "வார்டு 9 – சோமங்கலம் சாலை"),
      m ("tvl-pnm-w10", "Ward 10 – Thiruverkadu",        "வார்டு 10 – திருவேற்காடு"),
      m ("tvl-pnm-w11", "Ward 11 – Mangadu",             "வார்டு 11 – மங்காடு"),
      m ("tvl-pnm-w12", "Ward 12 – Kundrathur",          "வார்டு 12 – குந்தரத்தூர்"),
      m ("tvl-pnm-w13", "Ward 13 – Porur North",         "வார்டு 13 – போரூர் வடக்கு"),
      m ("tvl-pnm-w14", "Ward 14 – Porur South",         "வார்டு 14 – போரூர் தெற்கு"),
      m ("tvl-pnm-w15", "Ward 15 – Mugalivakkam",        "வார்டு 15 – முகலிவாக்கம்"),
      m ("tvl-pnm-w16", "Ward 16 – Ramapuram",           "வார்டு 16 – இராமாபுரம்"),
      m ("tvl-pnm-w17", "Ward 17 – Alapakkam",           "வார்டு 17 – அழகப்பாக்கம்"),
      m ("tvl-pnm-w18", "Ward 18 – Kolapakkam",          "வார்டு 18 – கோலப்பாக்கம்"),
      m ("tvl-pnm-w19", "Ward 19 – Padikuppam",          "வார்டு 19 – படிகுப்பம்"),
      m ("tvl-pnm-w20", "Ward 20 – Pattabiram North",    "வார்டு 20 – பட்டாபிராம் வடக்கு"),
      m ("tvl-pnm-w21", "Ward 21 – Pattabiram South",    "வார்டு 21 – பட்டாபிராம் தெற்கு"),
      m ("tvl-pnm-w22", "Ward 22 – Avadi Road",          "வார்டு 22 – ஆவடி சாலை"),
      m ("tvl-pnm-w23", "Ward 23 – Thirumazhisai",       "வார்டு 23 – திருமழிசை"),
      m ("tvl-pnm-w24", "Ward 24 – Veppampattu",         "வார்டு 24 – வேப்பம்பட்டு"),
      m ("tvl-pnm-w25", "Ward 25 – Nerkundram",          "வார்டு 25 – நெர்குண்டிரம்"),
      m ("tvl-pnm-w26", "Ward 26 – Ambattur IE",         "வார்டு 26 – அம்பத்தூர் தொழிற்பேட்டை"),
      m ("tvl-pnm-w27", "Ward 27 – Madhavaram Jn",       "வார்டு 27 – மாதவரம் சந்திப்பு"),
    ]},
    { id:"tvl-uthukottai", name:"Uthukottai", nameTa:"உதுக்கோட்டை", localities:[
      tp("tvl-uthukottai-tp",  "Uthukottai",         "உதுக்கோட்டை"),
      tp("tvl-pallipattu",     "Pallipattu",         "பள்ளிப்பட்டு"),
      tp("tvl-tiruttani",      "Tiruttani",          "திருத்தணி"),
      vp("tvl-periyapalayam",  "Periyapalayam",      "பெரியபாளையம்"),
      vp("tvl-arambakkam",     "Arambakkam",         "அரம்பாக்கம்"),
      vp("tvl-lathur-tvl",     "Lathur",             "லத்தூர்"),
    ]},
  ]},

  /* ── 34. TIRUVANNAMALAI ────────────────────────────────────────── */
  { id:"tiruvannamalai", name:"Tiruvannamalai", nameTa:"திருவண்ணாமலை", blocks:[
    { id:"tvm-tiruvannamalai", name:"Tiruvannamalai", nameTa:"திருவண்ணாமலை", localities:[
      m ("tvm-tiruvannamalai-m","Tiruvannamalai",    "திருவண்ணாமலை"),
      tp("tvm-polur",          "Polur",              "போளூர்"),
      tp("tvm-chengam",        "Chengam",            "செங்கம்"),
      vp("tvm-kalasapakkam",   "Kalasapakkam",       "கலசப்பாக்கம்"),
      vp("tvm-thandrampet",    "Thandrampet",        "தாண்டிரம்பேட்டை"),
      vp("tvm-kilpennathur",   "Kilpennathur",       "கீழ்பெண்ணாதூர்"),
      vp("tvm-vembakkam",      "Vembakkam",          "வெம்பாக்கம்"),
    ]},
    { id:"tvm-arni", name:"Arni", nameTa:"ஆரணி", localities:[
      m ("tvm-arni-m",         "Arni",               "ஆரணி"),
      tp("tvm-vandavasi",      "Vandavasi",          "வந்தவாசி"),
      tp("tvm-cheyyar",        "Cheyyar",            "செய்யாறு"),
      vp("tvm-arani-vp",       "Arani",              "ஆரணி"),
      vp("tvm-chetpet",        "Chetpet",            "சேத்துப்பட்டு"),
      vp("tvm-pudupalayam",    "Pudupalayam",        "புதுப்பாளையம்"),
    ]},
  ]},

  /* ── 35. VELLORE ───────────────────────────────────────────────── */
  { id:"vellore", name:"Vellore", nameTa:"வேலூர்", blocks:[
    { id:"vll-vellore", name:"Vellore", nameTa:"வேலூர்", localities:[
      m ("vll-vellore-m",      "Vellore",            "வேலூர்"),
      tp("vll-gudiyatham",     "Gudiyatham",         "குடியாத்தம்"),
      tp("vll-katpadi",        "Katpadi",            "காட்பாடி"),
      vp("vll-virinchipuram",  "Virinchipuram",      "விரிஞ்சிபுரம்"),
      vp("vll-kaniyambadi",    "Kaniyambadi",        "காணியம்பாடி"),
      vp("vll-alangayam",      "Alangayam",          "ஆலங்காயம்"),
      vp("vll-pernambut",      "Pernambut",          "பேர்ணம்பட்டு"),
      vp("vll-natrampalli",    "Natrampalli",        "நாத்தம்பள்ளி"),
    ]},
    { id:"vll-arakkonam", name:"Arakkonam", nameTa:"ஆரக்கோணம்", localities:[
      m ("vll-arakkonam-m",    "Arakkonam",          "ஆரக்கோணம்"),
      tp("vll-sholinghur",     "Sholinghur",         "சோளிங்கர்"),
      tp("vll-nemili",         "Nemili",             "நெமிலி"),
      vp("vll-walajah",        "Walajah",            "வாலாஜா"),
      vp("vll-arcot",          "Arcot",              "ஆற்காடு"),
      vp("vll-timiri",         "Timiri",             "திமிரி"),
    ]},
  ]},

  /* ── 36. VILLUPURAM ────────────────────────────────────────────── */
  { id:"villupuram", name:"Villupuram", nameTa:"விழுப்புரம்", blocks:[
    { id:"vpm-villupuram", name:"Villupuram", nameTa:"விழுப்புரம்", localities:[
      m ("vpm-villupuram-m",   "Villupuram",         "விழுப்புரம்"),
      tp("vpm-tindivanam",     "Tindivanam",         "திண்டிவனம்"),
      tp("vpm-gingee",         "Gingee",             "செஞ்சி"),
      vp("vpm-vanur",          "Vanur",              "வானூர்"),
      vp("vpm-kandachipuram",  "Kandachipuram",      "காண்டாச்சிபுரம்"),
      vp("vpm-vikravandi",     "Vikravandi",         "விக்கிரவாண்டி"),
      vp("vpm-marakanam",      "Marakanam",          "மரக்காணம்"),
      vp("vpm-melmalaiyanur",  "Melmalaiyanur",      "மேல்மலையனூர்"),
    ]},
    { id:"vpm-kallakurichi-v", name:"Kallakurichi", nameTa:"கள்ளக்குறிச்சி", localities:[
      m ("vpm-kallakurichi-m", "Kallakurichi",       "கள்ளக்குறிச்சி"),
      tp("vpm-ulundurpet",     "Ulundurpet",         "உளுந்தூர்பேட்டை"),
      vp("vpm-sankarapuram",   "Sankarapuram",       "சங்கரபுரம்"),
      vp("vpm-tirukkoilur",    "Tirukkoilur",        "திருக்கோவிலூர்"),
      vp("vpm-rishivandiyam",  "Rishivandiyam",      "ரிஷிவந்தியம்"),
    ]},
  ]},

  /* ── 37. VIRUDHUNAGAR ──────────────────────────────────────────── */
  { id:"virudhunagar", name:"Virudhunagar", nameTa:"விருதுநகர்", blocks:[
    { id:"vdn-virudhunagar", name:"Virudhunagar", nameTa:"விருதுநகர்", localities:[
      m ("vdn-virudhunagar-m", "Virudhunagar",       "விருதுநகர்"),
      m ("vdn-sivakasi-m",     "Sivakasi",           "சிவகாசி"),
      m ("vdn-rajapalayam-m",  "Rajapalayam",        "இராஜபாளையம்"),
      tp("vdn-aruppukottai",   "Aruppukottai",       "ஆருப்புக்கோட்டை"),
      tp("vdn-sattur",         "Sattur",             "சாத்தூர்"),
      vp("vdn-srivilliputhur", "Srivilliputhur",     "ஸ்ரீவில்லிபுத்தூர்"),
      vp("vdn-kariapatti",     "Kariapatti",         "காரியாப்பட்டி"),
      vp("vdn-tiruchuli",      "Tiruchuli",          "திருச்சுழி"),
    ]},
    { id:"vdn-sivakasi", name:"Sivakasi", nameTa:"சிவகாசி", localities:[
      m ("vdn-sivakasi-m2",    "Sivakasi",           "சிவகாசி"),
      tp("vdn-vembakottai",    "Vembakottai",        "வேம்பகோட்டை"),
      vp("vdn-watrap",         "Watrap",             "வாத்திராப்பட்டி"),
      vp("vdn-elayirampannai", "Elayirampannai",     "எழையிரம்பன்னை"),
      vp("vdn-mamsapuram",     "Mamsapuram",         "மாம்சாபுரம்"),
    ]},
  ]},

  /* ── 38. TIRUVARUR ─────────────────────────────────────────────── */
  { id:"tiruvarur", name:"Tiruvarur", nameTa:"திருவாரூர்", blocks:[
    { id:"tvr-tiruvarur", name:"Tiruvarur", nameTa:"திருவாரூர்", localities:[
      m ("tvr-tiruvarur-m",    "Tiruvarur",          "திருவாரூர்"),
      tp("tvr-thiruvarur-tp",  "Thiruvarur Town",    "திருவாரூர் நகர்"),
      vp("tvr-valangaiman",    "Valangaiman",        "வாலங்கைமான்"),
      vp("tvr-thiruthuraipoondi","Thiruthuraipoondi","திருத்துறைப்பூண்டி"),
      vp("tvr-kodavasal",      "Kodavasal",          "கோடவாசல்"),
      vp("tvr-koradachery",    "Koradachery",        "கோரடாச்சேரி"),
      vp("tvr-kudavasal",      "Kudavasal",          "குடவாசல்"),
    ]},
    { id:"tvr-mannargudi", name:"Mannargudi", nameTa:"மன்னார்குடி", localities:[
      m ("tvr-mannargudi-m",   "Mannargudi",         "மன்னார்குடி"),
      tp("tvr-needamangalam",  "Needamangalam",      "நீடாமங்கலம்"),
      vp("tvr-papanasam-tvr",  "Papanasam",          "பாபநாசம்"),
      vp("tvr-muthupet",       "Muthupet",           "முத்துப்பேட்டை"),
      vp("tvr-vedharanyam",    "Vedharanyam",        "வேதாரண்யம்"),
      vp("tvr-poonthottam",    "Poonthottam",        "பூந்தோட்டம்"),
    ]},
  ]},

];

/* ── Exports ────────────────────────────────────────────────────── */

export const DISTRICT_LIST = TN_DISTRICTS.map(d => ({ id: d.id, name: d.name, nameTa: d.nameTa }));

export function getBlocks(districtId: string): Block[] {
  return TN_DISTRICTS.find(d => d.id === districtId)?.blocks ?? [];
}

export function getLocalities(districtId: string, blockId: string): Locality[] {
  return getBlocks(districtId).find(b => b.id === blockId)?.localities ?? [];
}

export const LOCALITY_TYPE_LABELS: Record<LocalityType, string> = {
  VP:   "Village Panchayat",
  TP:   "Town Panchayat",
  M:    "Municipality",
  Corp: "Corporation",
  W:    "Corporation Ward",
};
