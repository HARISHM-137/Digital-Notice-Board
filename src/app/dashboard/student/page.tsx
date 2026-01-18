"use client";

import { useState, useEffect } from "react";
import NoticeCard from "@/components/NoticeCard";

export default function StudentDashboard() {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        fetch("/api/notices")
            .then((res) => res.json())
            .then((data) => setNotices(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Notice Board</h1>

                <div className="grid gap-6">
                    {notices.map((notice: any) => (
                        <NoticeCard key={notice._id} notice={notice} />
                    ))}
                    {notices.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-lg">No notices published yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
