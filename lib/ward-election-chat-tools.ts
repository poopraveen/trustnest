import { getWardsForArea, getWardByPart, type Ward } from "@/lib/ward-election-data";
import { getAnalyticsByWard, getAnalyticsForArea } from "@/lib/ward-election-analytics";
import { getHouseholdsByWard, HOUSEHOLDS_BY_AREA } from "@/lib/ward-households";
import { isValidAreaId } from "@/lib/ward-election-areas";
import { getElectionMetaForArea } from "@/lib/ward-election-data";
import { loadAllVoters, queryVoters, type VoterRecord } from "@/lib/ward-voters";

export const WARD_CHAT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_election_areas",
      description:
        "List configured election areas (Veppampattu, Perumalpattu) with part counts and elector totals.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_ward_parts",
      description:
        "List all polling parts (wards) for an area with electorate, male/female counts, polling station.",
      parameters: {
        type: "object",
        properties: {
          areaId: {
            type: "string",
            enum: ["veppampattu", "perumalpattu", "all"],
            description: "Town panchayat area",
          },
        },
        required: ["areaId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_ward_details",
      description:
        "Get full details for one polling part: sections, polling station, roll PDF path, official elector counts, sample analytics.",
      parameters: {
        type: "object",
        properties: {
          partNo: { type: "number", description: "Polling part number e.g. 164, 188" },
          areaId: {
            type: "string",
            enum: ["veppampattu", "perumalpattu"],
            description: "Required when part numbers could exist in both areas",
          },
        },
        required: ["partNo", "areaId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_voters",
      description:
        "Search voter-level JSON by name, voter ID, house number, or relative name. Returns matching records from ward_members.json.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search text" },
          areaId: {
            type: "string",
            enum: ["veppampattu", "perumalpattu", "all"],
          },
          partNo: { type: "number", description: "Filter to one polling part" },
          houseNumber: { type: "string", description: "Exact house number filter" },
          limit: { type: "number", description: "Max rows (default 25, max 50)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "aggregate_voters",
      description:
        "Aggregate voter JSON counts by part, gender, or age band for an area.",
      parameters: {
        type: "object",
        properties: {
          areaId: {
            type: "string",
            enum: ["veppampattu", "perumalpattu", "all"],
          },
          groupBy: {
            type: "string",
            enum: ["part", "gender", "age_band"],
          },
          partNo: { type: "number", description: "Optional filter to one part" },
        },
        required: ["areaId", "groupBy"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_households",
      description:
        "List household canvassing routes for a polling part (house number, voter count, youth/senior flags).",
      parameters: {
        type: "object",
        properties: {
          partNo: { type: "number" },
          areaId: { type: "string", enum: ["veppampattu", "perumalpattu"] },
          searchHouse: { type: "string", description: "Filter houses containing this text" },
          limit: { type: "number" },
        },
        required: ["partNo", "areaId"],
      },
    },
  },
];

function ageBand(age: number | null): string {
  if (age == null) return "unknown";
  if (age < 18) return "under_18";
  if (age <= 29) return "18_29";
  if (age <= 44) return "30_44";
  if (age <= 59) return "45_59";
  return "60_plus";
}

function voterToRow(v: VoterRecord) {
  return {
    part: v.ward,
    serial: v.serialNo,
    voterId: v.voterId,
    name: v.name,
    relative: v.relativeName ? `${v.relativeType} ${v.relativeName}`.trim() : "",
    house: v.houseNumber,
    age: v.age,
    gender: v.gender || null,
  };
}

function summarizeWard(w: Ward) {
  const part = w.partNo ?? w.number;
  const a = getAnalyticsByWard(part, w.areaId);
  return {
    areaId: w.areaId,
    partNo: part,
    name: w.name,
    electorate: w.electorate,
    male: w.male,
    female: w.female,
    thirdGender: w.thirdGender,
    sections: w.sections,
    pollingStation: w.pollingStation,
    pincode: w.pincode,
    rollPdf: w.rollPdf,
    sampleAnalytics: a
      ? {
          analyzedVoters: a.analyzedVoters,
          households: a.households,
          avgAge: a.avgAge,
          ageBands: a.ageBands,
        }
      : null,
  };
}

export function runWardElectionTool(
  name: string,
  args: Record<string, unknown>,
  defaultArea: "veppampattu" | "perumalpattu" | "all" = "all"
): unknown {
  switch (name) {
    case "list_election_areas": {
      return {
        areas: (["veppampattu", "perumalpattu"] as const).map((id) => ({
          id,
          ...getElectionMetaForArea(id),
          voterJsonLoaded: loadAllVoters(id).length,
          households: HOUSEHOLDS_BY_AREA[id]?.totalHouseholds ?? 0,
          sampleParts: getAnalyticsForArea(id).length,
        })),
      };
    }

    case "list_ward_parts": {
      const areaId = (args.areaId as string) || defaultArea;
      const ids =
        areaId === "all" ? (["veppampattu", "perumalpattu"] as const) : [areaId as "veppampattu" | "perumalpattu"];
      return {
        wards: ids.flatMap((id) => getWardsForArea(id).map(summarizeWard)),
      };
    }

    case "get_ward_details": {
      const partNo = Number(args.partNo);
      const areaId = String(args.areaId);
      if (!isValidAreaId(areaId)) return { error: "Invalid areaId" };
      const w = getWardByPart(partNo, areaId);
      if (!w) return { error: `Part ${partNo} not found in ${areaId}` };
      return summarizeWard(w);
    }

    case "search_voters": {
      const query = String(args.query || "").trim();
      if (!query) return { error: "query required", items: [] };
      const areaId = (args.areaId as string) || defaultArea;
      const partNo = args.partNo != null ? Number(args.partNo) : undefined;
      const house = args.houseNumber ? String(args.houseNumber) : undefined;
      const limit = Math.min(Number(args.limit) || 25, 50);

      const areas =
        areaId === "all" ? (["veppampattu", "perumalpattu"] as const) : [areaId as "veppampattu" | "perumalpattu"];

      const items: ReturnType<typeof voterToRow>[] = [];
      for (const id of areas) {
        const voters = loadAllVoters(id);
        if (voters.length === 0) continue;
        const { items: batch } = queryVoters({
          areaId: id,
          ward: partNo,
          house,
          q: query,
          limit: limit - items.length,
        });
        items.push(...batch.map(voterToRow));
        if (items.length >= limit) break;
      }

      return {
        query,
        count: items.length,
        items: items.slice(0, limit),
        note:
          items.length === 0
            ? "No matches — voter JSON may be empty for that area. Official roll totals are still in ward details."
            : undefined,
      };
    }

    case "aggregate_voters": {
      const areaId = (args.areaId as string) || defaultArea;
      const groupBy = String(args.groupBy || "part");
      const partNo = args.partNo != null ? Number(args.partNo) : undefined;
      const areas =
        areaId === "all" ? (["veppampattu", "perumalpattu"] as const) : [areaId as "veppampattu" | "perumalpattu"];

      let rows: VoterRecord[] = [];
      for (const id of areas) {
        let v = loadAllVoters(id);
        if (partNo != null) v = v.filter((r) => r.ward === partNo);
        rows = rows.concat(v);
      }

      if (rows.length === 0) {
        return { error: "No voter JSON loaded for this area", total: 0, groups: [] };
      }

      const groups = new Map<string, number>();
      for (const r of rows) {
        let key: string;
        if (groupBy === "gender") key = (r.gender || "unknown").toLowerCase() || "unknown";
        else if (groupBy === "age_band") key = ageBand(r.age);
        else key = `part_${r.ward}`;
        groups.set(key, (groups.get(key) ?? 0) + 1);
      }

      return {
        total: rows.length,
        groupBy,
        groups: Array.from(groups.entries())
          .map(([key, count]) => ({ key, count }))
          .sort((a, b) => b.count - a.count),
      };
    }

    case "list_households": {
      const partNo = Number(args.partNo);
      const areaId = String(args.areaId);
      const limit = Math.min(Number(args.limit) || 30, 100);
      const searchHouse = args.searchHouse ? String(args.searchHouse).toLowerCase() : "";
      let list = getHouseholdsByWard(partNo, areaId);
      if (searchHouse) list = list.filter((h) => h.house.toLowerCase().includes(searchHouse));
      return {
        partNo,
        areaId,
        total: list.length,
        households: list.slice(0, limit),
        truncated: list.length > limit,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
