import { Prisma } from "@prisma/client";
export type StudentListItem = Prisma.StudentGetPayload<{
  include: {
    user: {
      select: {
        id:          true;
        username:    true;
        firstName:   true;
        lastName:    true;
        email:       true;
        phone:       true;
        city:        true;
        country:     true;
        nationalId:  true;
        isVerified:  true;
        isBlocked:   true;
        createdAt:   true;
      };
    };
    program: {
      select: {
        id:          true;
        name:        true;
        programType: true;
      };
    };
    programLevel: {
      select: {
        id:    true;
        level: true;
      };
    };
  };
}>;