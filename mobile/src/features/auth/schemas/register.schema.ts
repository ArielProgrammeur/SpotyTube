import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
      .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères.")
      .regex(
        /^\w+$/,
        "Utilisez uniquement des lettres, des chiffres et des underscores.",
      ),

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
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .max(128, 'Le mot de passe est trop long.'),

    confirmPassword: z
      .string()
      .min(1, 'Veuillez confirmer votre mot de passe.'),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Les deux mots de passe ne correspondent pas.',
      path: ['confirmPassword'],
    },
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;