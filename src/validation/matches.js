import { z } from 'zod';

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// ISO 8601 date or date-time, e.g. 2026-10-19 or 2026-10-19T18:30:00Z
const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const isValidIsoDate = (value) => z.iso.datetime();

const nonNegativeInt = z.coerce.number().int().nonnegative();

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().trim().min(1),
    awayTeam: z.string().trim().min(1),
    startTime: z.string().refine(isValidIsoDate, { message: 'startTime must be a valid ISO date string' }),
    endTime: z.string().refine(isValidIsoDate, { message: 'endTime must be a valid ISO date string' }),
    homeScore: nonNegativeInt.optional(),
    awayScore: nonNegativeInt.optional(),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);

    // Invalid dates are already reported by the field refinements
    if (Number.isNaN(start) || Number.isNaN(end)) return;

    if (end <= start) {
      ctx.addIssue({
        code: 'custom',
        message: 'endTime must be after startTime',
        path: ['endTime'],
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: nonNegativeInt,
  awayScore: nonNegativeInt,
});
