// AUTO-GENERATED from data/ward-election/ward_members.json
// Regenerate: node scripts/gen-ward-election-data.mjs

export interface AgeBands {
  u18: number; y18_29: number; a30_44: number; a45_59: number; a60plus: number;
}

export interface WardAnalytics {
  ward: number;
  analyzedVoters: number;
  male: number;
  female: number;
  other: number;
  genderMissing: number;
  ageMissing: number;
  avgAge: number;
  households: number;
  ageBands: AgeBands;
}

export const WARD_ANALYTICS: WardAnalytics[] = [
  {
    "ward": 164,
    "analyzedVoters": 260,
    "male": 92,
    "female": 91,
    "other": 0,
    "genderMissing": 77,
    "ageMissing": 82,
    "avgAge": 47,
    "households": 139,
    "ageBands": {
      "u18": 0,
      "y18_29": 36,
      "a30_44": 46,
      "a45_59": 56,
      "a60plus": 40
    }
  },
  {
    "ward": 165,
    "analyzedVoters": 155,
    "male": 58,
    "female": 45,
    "other": 0,
    "genderMissing": 52,
    "ageMissing": 55,
    "avgAge": 45.6,
    "households": 78,
    "ageBands": {
      "u18": 0,
      "y18_29": 22,
      "a30_44": 31,
      "a45_59": 23,
      "a60plus": 24
    }
  },
  {
    "ward": 166,
    "analyzedVoters": 265,
    "male": 100,
    "female": 94,
    "other": 0,
    "genderMissing": 71,
    "ageMissing": 77,
    "avgAge": 47.5,
    "households": 109,
    "ageBands": {
      "u18": 0,
      "y18_29": 31,
      "a30_44": 61,
      "a45_59": 49,
      "a60plus": 47
    }
  },
  {
    "ward": 167,
    "analyzedVoters": 235,
    "male": 83,
    "female": 86,
    "other": 0,
    "genderMissing": 66,
    "ageMissing": 74,
    "avgAge": 47.8,
    "households": 118,
    "ageBands": {
      "u18": 0,
      "y18_29": 27,
      "a30_44": 47,
      "a45_59": 44,
      "a60plus": 43
    }
  },
  {
    "ward": 168,
    "analyzedVoters": 335,
    "male": 110,
    "female": 116,
    "other": 0,
    "genderMissing": 109,
    "ageMissing": 119,
    "avgAge": 45.1,
    "households": 164,
    "ageBands": {
      "u18": 0,
      "y18_29": 47,
      "a30_44": 75,
      "a45_59": 44,
      "a60plus": 50
    }
  },
  {
    "ward": 169,
    "analyzedVoters": 199,
    "male": 63,
    "female": 69,
    "other": 0,
    "genderMissing": 67,
    "ageMissing": 75,
    "avgAge": 49.9,
    "households": 99,
    "ageBands": {
      "u18": 0,
      "y18_29": 15,
      "a30_44": 36,
      "a45_59": 31,
      "a60plus": 42
    }
  },
  {
    "ward": 170,
    "analyzedVoters": 122,
    "male": 42,
    "female": 54,
    "other": 0,
    "genderMissing": 26,
    "ageMissing": 31,
    "avgAge": 46.3,
    "households": 71,
    "ageBands": {
      "u18": 0,
      "y18_29": 16,
      "a30_44": 25,
      "a45_59": 32,
      "a60plus": 18
    }
  },
  {
    "ward": 171,
    "analyzedVoters": 230,
    "male": 72,
    "female": 92,
    "other": 0,
    "genderMissing": 66,
    "ageMissing": 80,
    "avgAge": 46.2,
    "households": 137,
    "ageBands": {
      "u18": 1,
      "y18_29": 19,
      "a30_44": 50,
      "a45_59": 53,
      "a60plus": 27
    }
  },
  {
    "ward": 172,
    "analyzedVoters": 231,
    "male": 79,
    "female": 67,
    "other": 0,
    "genderMissing": 85,
    "ageMissing": 92,
    "avgAge": 46.3,
    "households": 114,
    "ageBands": {
      "u18": 0,
      "y18_29": 23,
      "a30_44": 48,
      "a45_59": 37,
      "a60plus": 31
    }
  },
  {
    "ward": 173,
    "analyzedVoters": 136,
    "male": 35,
    "female": 51,
    "other": 0,
    "genderMissing": 50,
    "ageMissing": 56,
    "avgAge": 43.2,
    "households": 98,
    "ageBands": {
      "u18": 0,
      "y18_29": 16,
      "a30_44": 38,
      "a45_59": 10,
      "a60plus": 16
    }
  }
];

export const ANALYTICS_META = {
  totalAnalyzed: 2168,
  wardsCovered: 10,
  source: "Voter-level extract of ECI Electoral Roll 2026 (SIR), AC 5 Poonamallee",
  note: "Partial OCR extract; some records have missing age/gender. Use official roll totals for electorate size.",
};

export function getAnalyticsByWard(ward: number): WardAnalytics | undefined {
  return WARD_ANALYTICS.find((w) => w.ward === ward);
}
