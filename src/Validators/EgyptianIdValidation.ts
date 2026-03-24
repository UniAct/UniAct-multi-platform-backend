const governorates: Record<number, string> = {
  1: "Cairo",
  2: "Alexandria",
  3: "Port Said",
  4: "Suez",
  11: "Damietta",
  12: "Dakahlia",
  13: "Sharqia",
  14: "Qalyubia",
  15: "Kafr El Sheikh",
  16: "Gharbia",
  17: "Monufia",
  18: "Beheira",
  19: "Ismailia",
  21: "Giza",
  22: "Beni Suef",
  23: "Faiyum",
  24: "Minya",
  25: "Asyut",
  26: "Sohag",
  27: "Qena",
  28: "Aswan",
  29: "Luxor",
  31: "Red Sea",
  32: "New Valley",
  33: "Matruh",
  34: "North Sinai",
  35: "South Sinai",
  88: "Foreigners",
};

function ValidateChecksum(id: string): boolean {
  const weights = [2, 7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 13; i++) {
    sum += Number(id[i]) * weights[i];
  }

  let k = 11 - (sum % 11);
  if (k === 10) k = 0;
  else if (k === 11) k = 1;

  return k === Number(id[13]);
}

type IdGroups = {
  century: "2" | "3";
  year: string;
  month: string;
  day: string;
  gov: string;
  unique: string;
  gender: string;
};

export function ValidateEgyptianNationalId(id: string): boolean {
  const value = String(id).trim();

  if (!/^\d{14}$/.test(value)) return false;
  if (!ValidateChecksum(value)) return false;

  const pattern =
    /^(?<century>[23])(?<year>\d{2})(?<month>0[1-9]|1[0-2])(?<day>0[1-9]|[12]\d|3[01])(?<gov>\d{2})(?<unique>\d{3})(?<gender>\d)\d$/;

  const match = value.match(pattern);
  const groups = match?.groups as IdGroups | undefined;

  if (!groups) return false;

  const govCode = parseInt(groups.gov);
  if (!governorates[govCode]) return false;

  return true;
}