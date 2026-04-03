import { StudentRepository } from "../../../Repositories/StudentRepository";

type DeleteStudentRaw = Awaited<ReturnType<typeof StudentRepository.Delete>>;

export function MapDeleteStudent(raw: DeleteStudentRaw) {
  return {
    username:              raw.user.username,
    firstName:             raw.user.firstName,
    lastName:              raw.user.lastName,
    email:                 raw.user.email,
    phone:                 raw.user.phone,
    dateOfBirth:           raw.user.dateOfBirth,
    address:               raw.user.address,
    city:                  raw.user.city,
    country:               raw.user.country,
    nationalId:            raw.user.nationalId,
    isBlocked:             raw.user.isBlocked,
    fullname:              raw.fullname,
    universityStudentId:   raw.universityStudentId,
    programId:             raw.programId,
    programLevelId:        raw.programLevelId,
    status:                raw.status,
    enrollmentDate:        raw.enrollmentDate,
    cgpa:                  raw.cgpa,
    religion:              raw.religion,
    gender:                raw.gender,
    homePhone:             raw.homePhone,
    previousQualification: raw.previousQualification,
    secondarySchoolName:   raw.secondarySchoolName,
    totalHighSchoolGrades: raw.totalHighSchoolGrades,
    highSchoolSeatNumber:  raw.highSchoolSeatNumber,
  };
}

export type DeleteStudentResponseDto = ReturnType<typeof MapDeleteStudent>;