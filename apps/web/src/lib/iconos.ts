import {
  FileText,
  Banknote,
  Send,
  CreditCard,
  Wallet,
  Receipt,
  ArrowRightLeft,
  HandCoins,
  Users,
  Clock,
  ShoppingCart,
  Package,
  Building2,
  Phone,
  Star,
  Shield,
  Landmark,
  DollarSign,
} from 'lucide-react'

export const ICONOS_DISPONIBLES = {
  FileText,
  Banknote,
  Send,
  CreditCard,
  Wallet,
  Receipt,
  ArrowRightLeft,
  HandCoins,
  Users,
  Clock,
  ShoppingCart,
  Package,
  Building2,
  Phone,
  Star,
  Shield,
  Landmark,
  DollarSign,
} as const

export type IconoKey = keyof typeof ICONOS_DISPONIBLES

export const ICONO_DEFAULT: IconoKey = 'FileText'

export function getIconoComponent(icono: string) {
  return ICONOS_DISPONIBLES[icono as IconoKey] ?? FileText
}
