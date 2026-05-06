import { z } from 'zod';


export const CreateCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(255),
  code: z.string().min(1, "Course code is required").max(20),
  credits: z.number().int().positive("Credits must be a positive integer"),
  
  programLevelId: z.number().int().positive("Program Level ID is required"),
  programId: z.number().int().positive("Program ID is required"),
  
  description: z.string().optional(),
  syllabus: z.string().optional(),
  
  successPercentage: z.number().min(0).max(100).optional(),
  minFinalSuccessPercentage: z.number().min(0).max(100).optional(),
  
  totalFail: z.boolean().default(false),

  courseType: z.enum(["Mandatory", "Elective", "Project"],
     { error: "Course Type must be one of the following (Mandatory, Elective, Project" }),


  prerequisiteIds: z.array(z.number().int()).optional().default([]),
});

export const CourseParamSchema = z.object({
  id: z.coerce.number({error:"Course parameter is required "}).int().positive(),
});


export const UpdateCourseSchema = CreateCourseSchema.partial().refine(
  (data) => {
    // Logic: If you are trying to update program-specific details (type or programId),
    // you MUST provide the programLevelId so we know which relation to upsert.
    if ((data.courseType || data.programId) && !data.programLevelId) {
      return false;
    }
    return true;
  },
  {
    message: "programLevelId is required when updating program-specific details",
    path: ["programLevelId"],
  }
);
// 4. TYPES
export type CreateCourse = z.infer<typeof CreateCourseSchema>;
export type UpdateCourse = z.infer<typeof UpdateCourseSchema>;
export type CourseParam = z.infer<typeof CourseParamSchema>;