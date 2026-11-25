function StepFiveRole({ roles, selectedRole, onRoleSelect }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">Which best describes your role?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">This helps us surface the right tools and tips.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {roles.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRoleSelect(item)}
            className={`rounded-md border px-5 py-3 text-sm font-semibold transition ${
              selectedRole === item
                ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StepFiveRole
