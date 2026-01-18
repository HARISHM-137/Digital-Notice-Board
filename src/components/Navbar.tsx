"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <Link href="/">Digital Notice Board</Link>
                </h1>
                <div className="flex gap-4 items-center">
                    {session ? (
                        <>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                                <User size={16} className="text-blue-500" />
                                <span className="capitalize">{session.user?.name || session.user?.email}</span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 font-medium"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
