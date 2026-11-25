function FooterNav({ canProceed, nextText = 'Next', showBack = true, onBack, onNext, className = '' }) {
  return (
    <div className={`mt-12 border-t border-[#d4d9e3] pt-6 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-2 py-2 text-lg font-semibold text-[#283247] transition hover:bg-[#f1f4f8]"
        >
          {showBack ? '< Back' : ''}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`rounded-lg px-6 py-2.5 text-base font-bold text-white transition ${
            canProceed ? 'bg-[#101828] hover:bg-black' : 'cursor-not-allowed bg-[#d5dae4] text-[#6b7688]'
          }`}
        >
          {nextText}
        </button>
      </div>
    </div>
  )
}

export default FooterNav
