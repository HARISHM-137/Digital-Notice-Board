import Link from "next/link";
import { GraduationCap, Shield, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 relative">

      {/* Central Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center gap-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg tracking-tight">
            DIGITAL NOTICE BOARD
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
            Select your portal to continue
          </p>
        </div>

        {/* Main Cards Section - Perfectly Aligned Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <OptionCard
            title="STUDENT"
            href="/dashboard/student"
            icon={<GraduationCap size={64} />}
            color="bg-blue-600"
            hoverColor="group-hover:text-blue-600"
          />
          <OptionCard
            title="ADMIN"
            href="/login"
            icon={<Shield size={64} />}
            color="bg-emerald-500"
            hoverColor="group-hover:text-emerald-600"
          />
          <OptionCard
            title="HOD"
            href="/login"
            icon={<Users size={64} />}
            color="bg-purple-600"
            hoverColor="group-hover:text-purple-600"
          />
        </div>

      </div>
    </div>
  );
}

function OptionCard({ title, href, icon, color, hoverColor }: any) {
  return (
    <Link
      href={href}
      className="group relative h-72 rounded-3xl bg-white shadow-2xl flex flex-col items-center justify-center gap-6 
      transform transition-all duration-300 hover:-translate-y-3 hover:scale-105 active:scale-95 text-center overflow-hidden border-4 border-transparent hover:border-white/50"
    >
      {/* Background Decoration Circle */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${color} opacity-10 group-hover:scale-150 transition-transform duration-500`} />

      {/* Icon with Vibrant Background */}
      <div className={`w-24 h-24 rounded-full ${color} flex items-center justify-center text-white shadow-lg z-10 group-hover:rotate-12 transition-transform duration-300`}>
        {icon}
      </div>

      {/* Title */}
      <h2 className={`text-3xl font-black text-gray-800 ${hoverColor} transition-colors z-10 uppercase tracking-widest`}>
        {title}
      </h2>
    </Link>
  );
}
