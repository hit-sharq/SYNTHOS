'use server'

import { logAudit } from "@/lib/audit"

export async function logAuditAction(params: {
  action: string
  targetType: string
  targetId?: string
  targetName?: string
  changes?: any
}) {
  await logAudit(params)
}
