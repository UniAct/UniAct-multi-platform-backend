import { StudentRepository } from "../../../Repositories/StudentRepository";
import { IPage } from "../../Common/PaginatedList";

type GetAllRawResult = Awaited<ReturnType<typeof StudentRepository.GetAll>>;
type GetAllRawItem   = NonNullable<GetAllRawResult["items"]>[number];

function MapGetStudentItem(raw: GetAllRawItem) {
  return {
    // ── User ─────────────────────────────────────────────
    id:          raw.user.id,
    username:    raw.user.username,
    firstName:   raw.user.firstName,
    lastName:    raw.user.lastName,
    fullName:    raw.fullname,
    email:       raw.user.email,
    phone:       raw.user.phone,
    city:        raw.user.city,
    country:     raw.user.country,
    nationalId:  raw.user.nationalId,
    isVerified:  raw.user.isVerified,
    isBlocked:   raw.user.isBlocked,

    // ── Student ───────────────────────────────────────────
    universityStudentId: raw.universityStudentId,
    status:              raw.status,
    gender:              raw.gender,
    religion:            raw.religion,
    cgpa:                raw.cgpa,
    enrollmentDate:      raw.enrollmentDate,
    programId:           raw.programId,
    
    // ── Program ───────────────────────────────────────────
    programName:        raw.program.name,
    programType:        raw.program.programType,
    
    // ── Program Level ─────────────────────────────────────
    programLevelId:      raw.programLevelId,
    programLevelName:   raw.programLevel.level,
  };
}

export type GetStudentItemResponseDto = ReturnType<typeof MapGetStudentItem>;

export function MapGetStudentPage(raw: GetAllRawResult): IPage<GetStudentItemResponseDto> {
  return {
    pageNumber: raw.pageNumber,
    pageSize:   raw.pageSize,
    totalPages: raw.totalPages,
    totalCount: raw.totalCount,
    items:      raw.items?.map(MapGetStudentItem),
  };
}