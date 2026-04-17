import { SlotType } from '@prisma/client';
import { z } from 'zod/v4';

const MAX_CREDITS_PER_REQUEST = 30;
/** NOTE: valid schedule (i will use it latter)
{
  "scheduleSlots": [
    {
      "id": 101,
      "start_time": "2026-04-20T10:00:00.000Z",
      "end_time": "2026-04-20T12:00:00.000Z",
      "type": "LECTURE",
      "course": {
        "id": 1,
        "code": "MATH201",
        "name": "Linear Algebra",
        "credits": 3
      },
      "teacher": {
        "id": 5,
        "name": "Dr. Ahmed Hassan"
      },
      "classroom": {
        "id": 12,
        "label": "B-201",
        "capacity": 40
      }
    },
    {
      "id": 102,
      "start_time": "2026-04-21T08:00:00.000Z",
      "end_time": "2026-04-21T10:00:00.000Z",
      "type": "SECTION",
      "course": {
        "id": 1,
        "code": "MATH201",
        "name": "Linear Algebra",
        "credits": 3
      },
      "teacher": {
        "id": 8,
        "name": "Eng. Mona Ali"
      },
      "classroom": {
        "id": 15,
        "label": "C-105",
        "capacity": 30
      }
    }
  ]
}
*/
export const EnrollInScheduleSchema = z.object({
  scheduleSlots: z.array(
    z.object({
      id: z.number().int().positive({
        message: "Invalid slot ID",
      }),

      start_time: z.iso.datetime({
        message: "start_time must be a valid ISO datetime",
      }),

      end_time: z.iso.datetime({
        message: "end_time must be a valid ISO datetime",
      }),

      type: z.enum(SlotType, {
        message: "Invalid slot type (Lecture, Lab, Section...)",
      }),

      course: z.object({
        id: z.number().int().positive({
          message: "Invalid course ID",
        }),
        code: z.string().min(2, {
          message: "Course code is too short",
        }),
        name: z.string().min(3, {
          message: "Course name is too short",
        }),
        credits: z.number().int().positive({
          message: "Course credits must be positive",
        }).max(4, {
          message: "Course credits cannot exceed 4",
        }),
      }),

      teacher: z.object({
        id: z.number().int().positive({
          message: "Invalid teacher ID",
        }),
        name: z.string().min(3, {
          message: "Teacher name is too short",
        }),
      }),

      classroom: z.object({
        id: z.number().int().positive({
          message: "Invalid classroom ID",
        }),
        label: z.string().min(1, {
          message: "Classroom label is required",
        }),
        capacity: z.number().int().positive({
          message: "Classroom capacity must be positive",
        }),
      }),
    })
  )
    .min(1, {
      message: "You must select at least one schedule slot to enroll",
    })
    .max(50, {
      message: "Too many slots selected — please reduce your selection",
    })

    .refine(
      (slots) => {
        const ids = slots.map((s) => s.id);
        return new Set(ids).size === ids.length;
      },
      {
        message: "You selected the same slot more than once",
      }
    )

    .refine(
      (slots) =>
        slots.every(
          (s) => new Date(s.start_time) < new Date(s.end_time)
        ),
      {
        message: "Some slots have invalid time ranges (start must be before end)",
      }
    )

    .refine((slots) => {
      const totalCredits = slots.reduce(
        (sum, s) => sum + s.course.credits,
        0
      );
      return totalCredits <= MAX_CREDITS_PER_REQUEST;
    }, {
      message: `Total selected credits exceed allowed limit (${MAX_CREDITS_PER_REQUEST})`,
    }),
});

export type EnrollInScheduleRequestDto = z.infer<typeof EnrollInScheduleSchema>;