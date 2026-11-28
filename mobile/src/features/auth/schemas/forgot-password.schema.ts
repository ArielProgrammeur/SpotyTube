
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Veuillez saisir votre adresse email.')
    .pipe(
      z.email({
        error: 'Veuillez saisir une adresse email valide.',
      }),
    )
    .transform((value) => value.toLowerCase()),
});

export type ForgotPasswordFormValues = z.infer<
  typeof forgotPasswordSchema
>;
