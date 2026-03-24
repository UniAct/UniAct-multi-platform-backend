import { StudentStatus } from '@prisma/client';
import { body } from 'express-validator';
import { ValidateEgyptianNationalId } from './EgyptianIdValidation';
import { Environment } from '../Utils/Environment';

export default class StudentValidator {
  public static Create() {
    return [
      body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage('Username can only contain letters, numbers, dots, underscores, and hyphens'),

      body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s'-]+$/)
        .withMessage('First name contains invalid characters'),

      body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s'-]+$/)
        .withMessage('Last name contains invalid characters'),

      body('universityStudentId')
        .isInt({ min: 1000000, max: 99999999 })
        .withMessage('University Student ID must be a valid 7-8 digit number'),

      body('nationalId')
        .trim()
        .matches(/^\d{14}$/)
        .withMessage('National ID must be exactly 14 digits')
        .custom((nationalId) => {
          if (!Environment.IsDevelopment() && !ValidateEgyptianNationalId(nationalId)) {
            throw new Error('Invalid Egyptian National ID');
          }
          return true;
        }),

      body('programId')
        .isInt({ min: 1 })
        .withMessage('Valid program ID is required'),

      body('programLevelId')
        .isInt({ min: 1 })
        .withMessage('Valid program level ID is required'),

      body('semesterId')
        .isInt({ min: 1 })
        .withMessage('Semester ID is required'),

      body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail()
        .withMessage('Valid email address is required')
        .normalizeEmail()
        .toLowerCase(),

      body('phone')
        .trim()
        .matches(/^01[0125]\d{8}$/)
        .withMessage('Phone must be a valid Egyptian mobile number (e.g., 01012345678)'),

    body('homePhone')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        const pattern = /^(?:\+20|20|0)(2|3|40|45|46|47|48|50|55|57|62|64|65|66|68|82|84|86|88|92|93|95|96|97)\d{7}$/;
        
        if(!Environment.IsDevelopment() && !pattern.test(value)){
          throw new Error("Home phone must be a valid Egyptian landline number");
        }

        return true;
      }),

      body('dateOfBirth')
        .trim()
        .isISO8601()
        .withMessage('Date of birth must be in YYYY-MM-DD format')
        .custom((value) => {
          const dob = new Date(value);
          const today = new Date();

          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }

          if (age < 15 || age > 100) {
            throw new Error('Student must be between 15 and 100 years old');
          }

          return true;
        }),

      body('enrollmentDate')
        .trim()
        .isISO8601()
        .withMessage('Enrollment date must be in YYYY-MM-DD format'),

      body('address')
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 5, max: 255 })
        .withMessage('Address must be between 5 and 255 characters'),

      body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Valid city name is required'),

      body('country')
        .trim()
        .notEmpty().withMessage('Country is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Valid country name is required'),

      body('status')
        .isIn(Object.values(StudentStatus))
        .withMessage(`Status must be one of: ${Object.values(StudentStatus).join(', ')}`),

      body('religion')
        .isIn(['M', 'C'])
        .withMessage('Religion must be either M (Muslim) or C (Christian)'),

      body('gender')
        .isIn(['M', 'F'])
        .withMessage('Gender must be either M (Male) or F (Female)'),

      body('previousQualification')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 100 }),

      body('secondarySchoolName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 150 })
        .withMessage('Secondary school name must be between 2 and 150 characters'),

      body('totalHighSchoolGrades')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat({ min: 0, max: 100 })
        .withMessage('Grades must be between 0 and 100'),

      body('highSchoolSeatNumber')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 50 }),
    ];
  }

  public static CreateBulk() {
    return [
      body('programId')
        .isInt({ min: 1 })
        .withMessage('Valid program ID is required'),

      body('programLevelId')
        .isInt({ min: 1 })
        .withMessage('Valid program level ID is required'),

      body('semesterId')
        .isInt({ min: 1 })
        .withMessage('Valid Semester ID is required'),
    ];
  }
}