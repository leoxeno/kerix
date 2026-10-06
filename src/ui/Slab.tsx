import type { ReactNode } from 'react'
import { Seam } from './Seam'

/** One stone slab in a list. The seam's glint position follows the index. */
export function Slab({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li className="overflow-hidden rounded-[10px] border border-slab-line bg-slab">
      <Seam glintAt={index} />
      <div className="flex items-start gap-3 py-3.5 pr-3.5 pl-2.5">{children}</div>
    </li>
  )
}
