/**
 * Converts a known Excel column header to its camelCase field name.
 * Falls back to the original header string if no mapping is found.
 */

export function ToCamelKey(header: string): string {
  const HEADER_TO_FIELD: Record<string, string> = {
    "Username":                 "username",
    "First Name":               "firstName",
    "Last Name":                "lastName",
    "Full Name":                "fullname",
    "University Student ID":    "universityStudentId",
    "National ID":              "nationalId",
    "Email":                    "email",
    "Phone":                    "phone",
    "Date of Birth":            "dateOfBirth",
    "Address":                  "address",
    "City":                     "city",
    "Country":                  "country",
    "Status":                   "status",
    "Enrollment Date":          "enrollmentDate",
    "Religion":                 "religion",
    "Gender":                   "gender",
    "Home Phone":               "homePhone",
    "Previous Qualification":   "previousQualification",
    "Secondary School Name":    "secondarySchoolName",
    "Total High School Grades": "totalHighSchoolGrades",
    "High School Seat Number":  "highSchoolSeatNumber",
  };

  return HEADER_TO_FIELD[header] ?? header;
}