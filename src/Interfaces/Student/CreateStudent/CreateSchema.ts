import { z } from 'zod/v4';
import { ValidateEgyptianNationalId } from '../../../Validators/EgyptianIdValidation';
import { Environment } from '../../../Utils/Environment';
import { StudentStatus } from '@prisma/client';
import { Gender, Religion } from '../../Student';
import { dateString } from '../Shared/dateString';

export const CreateStudentSchema = z.object({
  username: z
    .string({ error: "username is required" })
    .trim()
    .min(3, 'Username must be between 3 and 50 characters')
    .max(50, 'Username must be between 3 and 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens'),

  firstName: z
    .string({ error: "first name is required" })
    .trim()
    .min(2, 'First name must be between 2 and 100 characters')
    .max(100, 'First name must be between 2 and 100 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s'-]+$/, 'First name contains invalid characters'),

  lastName: z
    .string({ error: "last name is required" })
    .trim()
    .min(2, 'Last name must be between 2 and 100 characters')
    .max(100, 'Last name must be between 2 and 100 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s'-]+$/, 'Last name contains invalid characters'),

  fullname: z
    .string({ error: "fullname is required" })
    .trim()
    .min(2, 'Fullname must be between 2 and 100 characters')
    .max(100, 'Fullname must be between 2 and 100 characters'),

  universityStudentId: z
    .number({ error: "university student ID is required" })
    .int()
    .min(1000000, 'University Student ID must be a valid 7-8 digit number')
    .max(99999999, 'University Student ID must be a valid 7-8 digit number'),

  nationalId: z
    .string({ error: "nationalId is required" })
    .trim()
    .regex(/^\d{14}$/, 'National ID must be exactly 14 digits')
    .refine(
      (val) => Environment.IsDevelopment() || ValidateEgyptianNationalId(val),
      { message: 'Invalid Egyptian National ID' }
    ),

  programId: z
    .number({ error: "program ID is required" })
    .int()
    .min(1, 'Valid program ID is required'),

  programLevelId: z
    .number({ error: "program level ID is required" })
    .int()
    .min(1, 'Valid program level ID is required'),

  semesterNumber: z
    .number({ error: "semester number is required" })
    .int()
    .min(1, 'Semester Number Should Be One Of: 1(Fall) , 2(Spring)'),

  email: z
    .string({ error: "email is required" })
    .trim()
    .email('Valid email address is required')
    .transform((val) => val.toLowerCase()),

  phone: z
    .string({ error: "phone is required" })
    .trim()
    .regex(/^01[0125]\d{8}$/, 'Phone must be a valid Egyptian mobile number (e.g., 01012345678)'),

  homePhone: z
    .string()
    .trim()
    .refine(
      (val) => Environment.IsDevelopment() || /^(?:\+20|20|0)(2|3|40|45|46|47|48|50|55|57|62|64|65|66|68|82|84|86|88|92|93|95|96|97)\d{7}$/.test(val),
      { message: 'Home phone must be a valid Egyptian landline number' }
    )
    .optional()
    .or(z.literal(''))
    .transform((val) => val === '' ? undefined : val),

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
    }),

  enrollmentDate: dateString
    .transform((val) => new Date(val)),

  address: z
    .string({ error: "address is required" })
    .trim()
    .min(5, 'Address must be between 5 and 255 characters')
    .max(255, 'Address must be between 5 and 255 characters'),

  city: z
    .string({ error: "city is required" })
    .trim()
    .min(2, 'Valid city name is required')
    .max(100, 'Valid city name is required'),

  country: z
    .string({ error: "country is required" })
    .trim()
    .min(2, 'Valid country name is required')
    .max(100, 'Valid country name is required'),

  status: z.enum(StudentStatus, {
    error: `Status Is required and must be one of: ${Object.values(StudentStatus).join(', ')}`,
  }),

  religion: z.enum(Religion, {
    error: `religion is required and must be one of: ${Object.values(Religion).join(', ')}`,
  }),

  gender: z.enum(Gender, {
    error: `gender is required and must be one of: ${Object.values(Gender).join(', ')}`,
  }),

  previousQualification: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(''))
    .transform((val) => val === '' ? undefined : val),

  secondarySchoolName: z
    .string()
    .trim()
    .min(2, 'Secondary school name must be between 2 and 150 characters')
    .max(150, 'Secondary school name must be between 2 and 150 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val === '' ? undefined : val),

  totalHighSchoolGrades: z
    .number()
    .min(0, 'Grades must be between 0 and 100')
    .max(100, 'Grades must be between 0 and 100')
    .optional(),

  highSchoolSeatNumber: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(''))
    .transform((val) => val === '' ? undefined : val),
});

export type CreateStudentRequestDto = z.infer<typeof CreateStudentSchema>;