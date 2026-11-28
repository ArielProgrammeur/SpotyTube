import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Veuillez saisir votre adresse email.')
    .pipe(
        z.email({
            error: 'Veuillez saisir une adresse email valide.'}),)
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, 'Veuillez saisir votre mot de passe.')
    .max(128, 'Le mot de passe est trop long.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;