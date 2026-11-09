import { z } from 'zod';

export const SignalTypeSchema = z.enum(['BUY', 'SELL', 'NO_TRADE']);
export type SignalType = z.infer<typeof SignalTypeSchema>;

export const TimeframeSchema = z.enum(['M1', 'M5', 'M15', 'M30', 'H1']);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const AnalysisResultSchema = z.object({
  signal: SignalTypeSchema,
  pair: z.string().min(1).max(20).nullable(),
  timeframe: TimeframeSchema.nullable(),
  entry: z.number().positive().nullable(),
  sl: z.number().positive().nullable(),
  tp1: z.number().positive().nullable(),
  tp2: z.number().positive().nullable(),
  confidence: z.number().int().min(0).max(100),
  reason: z.string().min(1).max(500),
  warnings: z.array(z.string().max(200)).default([]),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const AnalyzeSuccessResponseSchema = z.object({
  ok: z.literal(true),
  result: AnalysisResultSchema,
});

export type AnalyzeSuccessResponse = z.infer<typeof AnalyzeSuccessResponseSchema>;

export const AnalyzeErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.enum([
    'IMAGE_UNREADABLE',
    'INVALID_FILE',
    'RATE_LIMITED',
    'AI_ERROR',
    'VALIDATION_FAILED',
    'INTERNAL_ERROR',
  ]),
  message: z.string().max(500),
});

export type AnalyzeErrorResponse = z.infer<typeof AnalyzeErrorResponseSchema>;

export const AnalyzeResponseSchema = z.discriminatedUnion('ok', [
  AnalyzeSuccessResponseSchema,
  AnalyzeErrorResponseSchema,
]);

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;