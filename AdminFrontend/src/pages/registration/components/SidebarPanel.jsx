import { motion } from 'motion/react'

function SidebarPanel({ heading }) {
  return (
    <aside className="hidden min-h-screen w-[320px] shrink-0 bg-[#f3f4f6] px-7 py-8 lg:flex lg:flex-col">
      <img
        src="/logo/WorkMatrix1_logo_design-removebg-preview.png"
        alt="WorkMatrix1"
        className="h-10 w-48 object-contain"
      />

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.img
          src="/logo/sub-logo.png"
          alt="WorkMatrix1"
          className="mb-7 h-40 w-40 object-contain cursor-grab active:cursor-grabbing"
          drag
          dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
          dragElastic={0.2}
          whileDrag={{ scale: 1.1 }}
          whileHover={{ scale: 1.05 }}
        />
        <p className="max-w-55 text-[1.5rem] leading-[1.15] text-[#101828]">{heading}</p>
      </div>

      <p className="text-base font-semibold text-[#111827]">Manage Cookies</p>
    </aside>
  )
}

export default SidebarPanel
