import React from "react";

const sidebarItems = [
    {
        key: "personal",
        label: "Personal Details",
        icon: (
            <span className="mr-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                </svg>
            </span>
        ),
    },
    { key: "fundraisers", label: "Fundraisers", icon: <span className="mr-3">☆</span> },
];

export default function Sidebar({ section, setSection }) {
    return (
        <aside className="w-64 bg-white border-r flex flex-col py-8 px-4 min-h-screen">
            <nav className="flex-1">
                <ul className="space-y-2">
                    {sidebarItems.map((item) => (
                        <li key={item.key}>
                            <button
                                onClick={() => setSection(item.key)}
                                className={`w-full text-left flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition ${section === item.key ? "bg-gray-100 font-semibold" : ""
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        </li>
                    ))}
                    <li className="pt-4" onClick={() => {
                        localStorage.removeItem('canvasser');
                        window.location.href = '/fundraiser';
                    }}>
                        <a className="flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition">
                            <span className="mr-3">↩</span> Logout
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
} 