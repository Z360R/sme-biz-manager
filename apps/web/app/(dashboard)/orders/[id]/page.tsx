'use client'

import { OrderDetail } from '@/components/orders/OrderDetail'
import { useParams } from 'next/navigation'

export default function OrderDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  return <OrderDetail orderId={id} />
}
