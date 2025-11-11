// import { z } from "zod";

// /**
//  * Login Schema
//  * - Username: minimal 3 karakter, hanya huruf, angka, titik, dan underscore
//  * - Password: minimal 8 karakter, harus mengandung huruf besar, huruf kecil, angka, dan simbol
//  */
// export const loginSchema = z.object({
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters long" })
//     .max(30, { message: "Username must not exceed 30 characters" })
//     .regex(/^[a-zA-Z0-9._]+$/, {
//       message:
//         "Username can only contain letters, numbers, dots, and underscores",
//     }),

//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long" })
//     .max(72, { message: "Password must not exceed 72 characters" }) // bcrypt limit
//     .regex(/[A-Z]/, {
//       message: "Password must contain at least one uppercase letter",
//     })
//     .regex(/[a-z]/, {
//       message: "Password must contain at least one lowercase letter",
//     })
//     .regex(/[0-9]/, { message: "Password must contain at least one number" })
//     .regex(/[^A-Za-z0-9]/, {
//       message: "Password must contain at least one symbol",
//     }),
// });

import z from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
