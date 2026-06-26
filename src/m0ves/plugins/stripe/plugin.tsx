import { buildConfig } from 'payload'
import { stripePlugin } from '@payloadcms/plugin-stripe'

export const StripePlugin = stripePlugin({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
})
