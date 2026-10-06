/**
 * The diamond: Kerix's checkbox. A 44 px hit area around an 18 px rotated square.
 * Inert until spec 002 gives it behaviour; still a real, labelled button.
 */
export function Diamond({ disabled = false, onClick }: { disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label="Mark done"
      disabled={disabled}
      onClick={onClick}
      className="-mt-2 flex size-11 shrink-0 items-center justify-center disabled:cursor-default"
    >
      <span className="block size-[18px] rotate-45 border-[1.5px] border-gold" aria-hidden="true" />
    </button>
  )
}
