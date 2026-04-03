import { StudentStatus } from '@prisma/client';
import { z } from 'zod/v4';
import { ValidateEgyptianNationalId } from '../../../Validators/EgyptianIdValidation';
import { Environment } from '../../../Utils/Environment';
import { Gender, Religion } from '../../Student';
import { dateString } from '../Shared/dateString';

const egyptianNationalIdRegex = /^\d{14}$/;
const egyptianMobileRegex     = /^01[0125]\d{8}$/;
const egyptianLandlineRegex   = /^(?:\+20|20|0)(2|3|40|45|46|47|48|50|55|57|62|64|65|66|68|82|84|86|88|92|93|95|96|97)\d{7}$/;
const usernameRegex           = /^[a-zA-Z0-9_.-]+$/;
const nameRegex               = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;

// ── Params ────────────────────────────────────────────────────────────────────

export const StudentIdParamSchema = z.object({
  id: z
    .string({ error: 'Student ID is required' })
    .min(1, 'Student ID cannot be empty')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, {
      error: 'Student ID must be a positive integer',
    }),
});

// ── Reusable nullable/optional field helper ───────────────────────────────────
// Mirrors express-validator's optional({ nullable: true, checkFalsy: true })
// Accepts: undefined | null | "" | T
const nullishOrEmpty = <T extends z.ZodType>(schema: T) =>
  z.union([z.literal(''), z.null(), z.undefined(), schema]);

// ── Body ──────────────────────────────────────────────────────────────────────

export const UpdateStudentBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be between 3 and 50 characters')
    .max(50, 'Username must be between 3 and 50 characters')
    .regex(usernameRegex, 'Username can only contain letters, numbers, dots, underscores, and hyphens')
    .optional(),

  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be between 2 and 100 characters')
    .max(100, 'First name must be between 2 and 100 characters')
    .regex(nameRegex, 'First name contains invalid characters')
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be between 2 and 100 characters')
    .max(100, 'Last name must be between 2 and 100 characters')
    .regex(nameRegex, 'Last name contains invalid characters')
    .optional(),

  fullname: z
    .string()
    .trim()
    .min(2, 'Full name must be between 2 and 100 characters')
    .max(100, 'Full name must be between 2 and 100 characters')
    .optional(),

  universityStudentId: z
    .number()
    .int()
    .min(1_000_000, 'University Student ID must be a valid 7-8 digit number')
    .max(99_999_999, 'University Student ID must be a valid 7-8 digit number')
    .optional(),

  nationalId: z
    .string()
    .trim()
    .regex(egyptianNationalIdRegex, 'National ID must be exactly 14 digits')
    .refine(
      (v) => Environment.IsDevelopment() || ValidateEgyptianNationalId(v),
      { error: 'Invalid Egyptian National ID' },
    )
    .optional(),

  programId: z
    .number()
    .int()
    .min(1, 'Valid program ID is required')
    .optional(),

  programLevelId: z
    .number()
    .int()
    .min(1, 'Valid program level ID is required')
    .optional(),

  cgpa: z
    .number()
    .min(0, 'CGPA must be between 0 and 4')
    .max(4, 'CGPA must be between 0 and 4')
    .optional(),

  email: z
    .email('Valid email address is required')
    .toLowerCase()
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(egyptianMobileRegex, 'Phone must be a valid Egyptian mobile number')
    .optional(),

  homePhone: nullishOrEmpty(
    z.string()
      .trim()
      .refine(
        (v) => Environment.IsDevelopment() || !egyptianLandlineRegex.test(v),
        { error: 'Home phone must be a valid Egyptian landline number' },
      )
  ),

  dateOfBirth: dateString
    .transform((val) => new Date(val))
    .refine((dob) => {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();

      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      return age >= 15 && age <= 100;
    }, {
      message: "Student must be between 15 and 100 years old",
    })
    .optional(),

  enrollmentDate: dateString
    .transform((val) => new Date(val))
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, 'Address must be between 5 and 255 characters')
    .max(255, 'Address must be between 5 and 255 characters')
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, 'Valid city name is required')
    .max(100, 'Valid city name is required')
    .optional(),

  country: z
    .string()
    .trim()
    .min(2, 'Valid country name is required')
    .max(100, 'Valid country name is required')
    .optional(),

  status: z
    .enum(StudentStatus, {
      error: `Status must be one of: ${Object.values(StudentStatus).join(', ')}`,
    })
    .optional(),

  religion: z
    .enum(Religion , {
      error: `Religion must be of of: ${Object.values(Religion).join(', ')}`
    })
    .optional(),

  gender: z
    .enum(Gender , {
      error: `Gender must be of of: ${Object.values(Gender).join(', ')}`
    })
    .optional(),

  previousQualification: nullishOrEmpty(
    z.string().trim().max(100)
  ),

  secondarySchoolName: nullishOrEmpty(
    z.string()
      .trim()
      .min(2, 'Secondary school name must be between 2 and 150 characters')
      .max(150, 'Secondary school name must be between 2 and 150 characters')
  ),

  totalHighSchoolGrades: z
    .number()
    .min(0, 'Grades must be between 0 and 100')
    .max(100, 'Grades must be between 0 and 100')
    .nullish(),

  highSchoolSeatNumber: nullishOrEmpty(
    z.string().trim().max(50)
  ),
});

export type StudentIdParam                    = z.infer<typeof StudentIdParamSchema>;
export type UpdateStudentRequestDto           = z.infer<typeof UpdateStudentBodySchema>;