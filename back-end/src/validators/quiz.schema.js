import { z } from 'zod';

const allowedValues = new Set([0, 25, 50, 75, 100]);

export const submitQuizSchema = z.object({
  quizVersion: z.number().int().positive(),
  responses: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        answerValue: z
          .number()
          .refine((v) => allowedValues.has(v), {
            message: 'answerValue must be one of 0, 25, 50, 75, 100',
          }),
      })
    )
    .min(1),
});
