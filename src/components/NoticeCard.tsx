"use client";

import { Trash2, Download, Edit2 } from "lucide-react";
import Link from "next/link";

interface Media {
    fileId: string;
    type: "image" | "video" | "audio";
    filename: string;
    contentType: string;
}

interface Notice {
    _id: string;
    title: string;
    content: string;
    media: Media[];
    updatedAt: string;
    createdBy: {
        username: string;
        role: string;
    };
}

interface NoticeCardProps {
    notice: Notice;
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
    onEdit?: (notice: Notice) => void;
}

export default function NoticeCard({ notice, isAdmin, onDelete, onEdit }: NoticeCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Posted by <span className="font-medium text-blue-600 capitalize">{notice.createdBy?.username || 'Admin'}</span> • {new Date(notice.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(notice)}
                                    className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold border border-transparent hover:border-amber-200"
                                    title="Edit Notice"
                                >
                                    <Edit2 size={16} /> EDIT
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(notice._id)}
                                    className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold border border-transparent hover:border-red-200"
                                    title="Delete Notice"
                                >
                                    <Trash2 size={16} /> DELETE
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mb-6">
                    {notice.content}
                </p>

                {notice.media && notice.media.length > 0 && (
                    <div className="grid gap-4 mt-4">
                        {notice.media.map((item) => (
                            <div key={item.fileId} className="border rounded-lg overflow-hidden bg-gray-50">
                                {item.type === "image" && (
                                    <img
                                        src={`/api/media/${item.fileId}`}
                                        alt={item.filename}
                                        className="w-full h-auto max-h-96 object-contain"
                                    />
                                )}
                                {item.type === "video" && (
                                    <video
                                        src={`/api/media/${item.fileId}`}
                                        controls
                                        className="w-full max-h-96"
                                    />
                                )}
                                {item.type === "audio" && (
                                    <audio
                                        src={`/api/media/${item.fileId}`}
                                        controls
                                        className="w-full p-2"
                                    />
                                )}
                                <div className="p-2 bg-gray-100 flex justify-between items-center text-xs text-gray-600">
                                    <span className="truncate max-w-[200px]">{item.filename}</span>
                                    <a
                                        href={`/api/media/${item.fileId}`}
                                        download={item.filename}
                                        className="flex items-center gap-1 hover:text-blue-600 font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
