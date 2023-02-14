import { z } from "zod";

export const imageLineCrossingSchema = z.object({
  x1: z.number().min(0).max(1),
  y1: z.number().min(0).max(1),
  x2: z.number().min(0).max(1),
  y2: z.number().min(0).max(1),
});

export type ImageLineCrossingFormType = z.infer<typeof imageLineCrossingSchema>;
