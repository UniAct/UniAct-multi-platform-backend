import z from "zod";

interface ProgramRefinementData {
  levels?: any[];
  levelsNumber?: number;
  academicLoadSemester?: any[];
  academicLoadGPA?: any[];
  transcriptDefinition?: any[];
}

export function applyProgramRefinements<T extends z.ZodTypeAny>(schema: T) {
  return schema
    
    .refine((data) => {
      const { levels, levelsNumber } = data as ProgramRefinementData;
      if (levels && levelsNumber) {
        return levels.length === levelsNumber;
      }
      return true;
    }, { message: "Level definitions count mismatch", path: ["levels"] })
    
    .refine((data) => {
      const { levels } = data as ProgramRefinementData;
      return validateSequentialLevels(levels);
    }, {
      message: "Level numbers must be sequential (1, 2, 3...)",
      path: ["levels"]
    })

    .refine((data) => {
      const { levels, academicLoadSemester } = data as ProgramRefinementData;
      if (!levels || !academicLoadSemester) return true;
      const validLevels = new Set(levels.map((l: any) => l.level));
      return academicLoadSemester.every((entry: any) => validLevels.has(entry.level));
    }, { message: "Semester load references invalid level", path: ["academicLoadSemester"] })

    .refine((data) => {
      const { academicLoadGPA } = data as ProgramRefinementData;
      return validateNoOverlap(academicLoadGPA, "minGPA", "maxGPA");
    }, {
      message: "GPA load rules must not overlap",
      path: ["academicLoadGPA"]
    })

    .refine((data) => {
      const { transcriptDefinition } = data as ProgramRefinementData;
      return validateNoOverlap(transcriptDefinition, "minScore", "maxScore");
    }, {
      message: "Transcript score ranges must not overlap",
      path: ["transcriptDefinition"]
    });
}




const validateNoOverlap = (items: any[] | undefined, minKey: string, maxKey: string) => {
  if (!items || items.length < 2) return true;
  const sorted = [...items].sort((a, b) => a[minKey] - b[minKey]);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i][maxKey] >= sorted[i + 1][minKey]) return false;
  }
  return true;
};

const validateSequentialLevels = (levels: { level: number }[] | undefined) => {
  if (!levels) return true;
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  return sorted.every((l, i) => l.level === i + 1);
};