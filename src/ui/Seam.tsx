/**
 * The seam: a hairline of gold with a short cyan glint, the signature of Isu stonework.
 * `glintAt` picks one of a few fixed positions so a list of slabs never looks stamped.
 */
export function Seam({ glintAt = 0, thick = false }: { glintAt?: number; thick?: boolean }) {
  const positions = [
    [2, 5],
    [4, 3],
    [1, 6],
    [6, 1],
  ] as const
  const [before, after] = positions[glintAt % positions.length]
  return (
    <div className="seam" style={{ height: thick ? 2 : 1 }} aria-hidden="true">
      <div className="seam-gold" style={{ flex: before }} />
      <div className="seam-glint" style={{ width: thick ? 60 : 28 }} />
      <div className="seam-gold" style={{ flex: after }} />
    </div>
  )
}
