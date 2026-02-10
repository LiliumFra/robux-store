import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roblox_username: z.string().min(3, 'Usuario de Roblox muy corto'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const orderSchema = z.object({
  robux_amount: z.number().min(100, 'El mínimo es 100 Robux'),
  roblox_username: z.string().min(3, 'Usuario de Roblox requerido'),
  place_id: z.number().min(1, 'Place ID requerido'),
  crypto_currency: z.string().optional(),
  payment_method: z.enum(['crypto', 'mercadopago']).default('crypto'),
});
