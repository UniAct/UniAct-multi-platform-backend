import { StudentStatus } from "@prisma/client";
import { StudentExcelHeaders } from "../../../Enums/StudentHeader";
import { Gender, Religion } from "../../../Interfaces/Student";
import { ValidateEgyptianNationalId } from "../../../Validators/EgyptianIdValidation";
import { Environment } from "../../../Utils/Environment";

export interface RowValidationError {
  row: number;
  field: string;
  message: string;
}

export interface RowValidationResult {
  valid: boolean;
  errors: RowValidationError[];
  data?: Record<string, any>;
}

const EGYPTIAN_MOBILE_RE  = /^01[0125]\d{8}$/;
const EGYPTIAN_LANDLINE_RE = /^(?:\+20|20|0)(2|3|40|45|46|47|48|50|55|57|62|64|65|66|68|82|84|86|88|92|93|95|96|97)\d{7}$/;
const NATIONAL_ID_RE      = /^\d{14}$/;
const USERNAME_RE         = /^[a-zA-Z0-9_.-]+$/;
const NAME_RE             = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;

/**
 * Validates a single Excel data row against all student field rules.
 *
 * Mirrors the same constraints as `StudentValidator.Create` (express-validator),
 * but operates directly on raw cell values instead of an HTTP request body.
 *
 * Returns either:
 *  - `{ valid: true,  data: <parsed fields> }` — ready to insert.
 *  - `{ valid: false, errors: [...] }`          — one entry per broken rule.
 */
export function ValidateStudentRow(
  rawValues: any[],
  headerMap: Map<string, number>,
  rowNumber: number
): RowValidationResult {
  
  const errors: RowValidationError[] = [];

  const get = (header: StudentExcelHeaders): any => {
    const idx = headerMap.get(header);
    return idx !== undefined ? rawValues[idx] : undefined;
  };

  const err = (field: string, message: string) =>
    errors.push({ row: rowNumber, field, message });

  // ── username ────────────────────────────────────────────────────────────────
  const username = String(get(StudentExcelHeaders.Username) ?? "").trim();
  if (!username)
    err("username", "Username is required");
  else if (username.length < 3 || username.length > 50)
    err("username", "Username must be between 3 and 50 characters");
  else if (!USERNAME_RE.test(username))
    err("username", "Username can only contain letters, numbers, dots, underscores, and hyphens");

  // ── firstName ───────────────────────────────────────────────────────────────
  const firstName = String(get(StudentExcelHeaders.FirstName) ?? "").trim();
  if (!firstName)
    err("firstName", "First name is required");
  else if (firstName.length < 2 || firstName.length > 100)
    err("firstName", "First name must be between 2 and 100 characters");
  else if (!NAME_RE.test(firstName))
    err("firstName", "First name contains invalid characters");

  // ── lastName ────────────────────────────────────────────────────────────────
  const lastName = String(get(StudentExcelHeaders.LastName) ?? "").trim();
  if (!lastName)
    err("lastName", "Last name is required");
  else if (lastName.length < 2 || lastName.length > 100)
    err("lastName", "Last name must be between 2 and 100 characters");
  else if (!NAME_RE.test(lastName))
    err("lastName", "Last name contains invalid characters");

  // ── universityStudentId ─────────────────────────────────────────────────────
  const uniIdRaw = get(StudentExcelHeaders.UniversityStudentId);
  const uniId    = Number(uniIdRaw);
  if (!Number.isInteger(uniId) || uniId < 1000000 || uniId > 99999999)
    err("universityStudentId", "University Student ID must be a valid 7-8 digit number");

  // ── nationalId ──────────────────────────────────────────────────────────────
  const nationalId = String(get(StudentExcelHeaders.NationalId) ?? "").trim();
    if (!Environment.IsDevelopment()) {
      if (!NATIONAL_ID_RE.test(nationalId))
        err("nationalId", "National ID must be exactly 14 digits");
      else if (!ValidateEgyptianNationalId(nationalId))
        err("nationalId", "Invalid Egyptian National ID");
    }


  // ── email ───────────────────────────────────────────────────────────────────
  const email = String(get(StudentExcelHeaders.Email) ?? "").trim().toLowerCase();
  if (!email)
    err("email", "Email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    err("email", "Valid email address is required");

  // ── phone ───────────────────────────────────────────────────────────────────
  const phone = String(get(StudentExcelHeaders.Phone) ?? "").trim();
    if (!Environment.IsDevelopment() && !EGYPTIAN_MOBILE_RE.test(phone))
      err("phone", "Phone must be a valid Egyptian mobile number (e.g., 01012345678)");

  // ── homePhone (optional) ────────────────────────────────────────────────────
  const homePhone = String(get(StudentExcelHeaders.HomePhone) ?? "").trim();
  if (!Environment.IsDevelopment() && homePhone && !EGYPTIAN_LANDLINE_RE.test(homePhone))
    err("homePhone", "Home phone must be a valid Egyptian landline number");

  // ── dateOfBirth ─────────────────────────────────────────────────────────────
  const dobRaw = get(StudentExcelHeaders.DateOfBirth);
  const dobStr = dobRaw instanceof Date
    ? dobRaw.toISOString().split("T")[0]
    : String(dobRaw ?? "").trim();

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    err("dateOfBirth", "Date of birth must be in YYYY-MM-DD format");
  } else {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 15 || age > 100)
      err("dateOfBirth", "Student must be between 15 and 100 years old");
  }

  // ── enrollmentDate ──────────────────────────────────────────────────────────
  const enrollRaw = get(StudentExcelHeaders.EnrollmentDate);
  const enrollStr = enrollRaw instanceof Date
    ? enrollRaw.toISOString().split("T")[0]
    : String(enrollRaw ?? "").trim();

  if (isNaN(new Date(enrollStr).getTime()))
    err("enrollmentDate", "Enrollment date must be in YYYY-MM-DD format");

  // ── address ─────────────────────────────────────────────────────────────────
  const address = String(get(StudentExcelHeaders.Address) ?? "").trim();
  if (!address)
    err("address", "Address is required");
  else if (address.length < 5 || address.length > 255)
    err("address", "Address must be between 5 and 255 characters");

  // ── city ────────────────────────────────────────────────────────────────────
  const city = String(get(StudentExcelHeaders.City) ?? "").trim();
  if (!city)
    err("city", "City is required");
  else if (city.length < 2 || city.length > 100)
    err("city", "Valid city name is required");

  // ── country ─────────────────────────────────────────────────────────────────
  const country = String(get(StudentExcelHeaders.Country) ?? "").trim();
  if (!country)
    err("country", "Country is required");
  else if (country.length < 2 || country.length > 100)
    err("country", "Valid country name is required");

  // ── status ──────────────────────────────────────────────────────────────────
  const status = String(get(StudentExcelHeaders.Status) ?? "").trim();
  if (!Object.values(StudentStatus).includes(status as StudentStatus))
    err("status", `Status must be one of: ${Object.values(StudentStatus).join(", ")}`);

  // ── religion ────────────────────────────────────────────────────────────────
  const religion = String(get(StudentExcelHeaders.Religion) ?? "").trim();
  if (!Object.values(Religion).includes(religion as Religion))
    err("religion", "Religion must be either M (Muslim) or C (Christian)");

  // ── gender ──────────────────────────────────────────────────────────────────
  const gender = String(get(StudentExcelHeaders.Gender) ?? "").trim();
  if (!Object.values(Gender).includes(gender as Gender))
    err("gender", "Gender must be either M (Male) or F (Female)");

  // ── previousQualification (optional) ───────────────────────────────────────
  const prevQual = String(get(StudentExcelHeaders.PreviousQualification) ?? "").trim();
  if (prevQual && prevQual.length > 100)
    err("previousQualification", "Previous qualification must be at most 100 characters");

  // ── secondarySchoolName (optional) ─────────────────────────────────────────
  const schoolName = String(get(StudentExcelHeaders.SecondarySchoolName) ?? "").trim();
  if (schoolName && (schoolName.length < 2 || schoolName.length > 150))
    err("secondarySchoolName", "Secondary school name must be between 2 and 150 characters");

  // ── totalHighSchoolGrades (optional) ───────────────────────────────────────
  const gradesRaw = get(StudentExcelHeaders.TotalHighSchoolGrades);
  if (gradesRaw !== undefined && gradesRaw !== null && gradesRaw !== "") {
    const grades = Number(gradesRaw);
    if (isNaN(grades) || grades < 0 || grades > 100)
      err("totalHighSchoolGrades", "Grades must be between 0 and 100");
  }

  // ── highSchoolSeatNumber (optional) ────────────────────────────────────────
  const seatNumber = String(get(StudentExcelHeaders.HighSchoolSeatNumber) ?? "").trim();
  if (seatNumber && seatNumber.length > 50)
    err("highSchoolSeatNumber", "High school seat number must be at most 50 characters");

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    data: {
      username,
      firstName,
      lastName,
      universityStudentId: uniId,
      nationalId,
      email,
      phone,
      homePhone:              homePhone   || undefined,
      dateOfBirth:            dobStr,
      enrollmentDate:         enrollStr,
      address,
      city,
      country,
      status:                 status      as StudentStatus,
      religion:               religion    as Religion,
      gender:                 gender      as Gender,
      previousQualification:  prevQual    || undefined,
      secondarySchoolName:    schoolName  || undefined,
      totalHighSchoolGrades:  gradesRaw !== "" && gradesRaw != null ? Number(gradesRaw) : undefined,
      highSchoolSeatNumber:   seatNumber  || undefined,
    },
  };
}