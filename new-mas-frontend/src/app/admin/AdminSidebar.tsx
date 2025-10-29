"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Image from "next/image";
import { Inter } from "next/font/google";

interface NavItem {
  name: string;
  href: string;
  iconSrc: string;
  hasDropdown?: boolean;
  subItems?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    iconSrc: "/f4065df1dc70dd3ec996405e159423456c45772a.svg",
  },
  {
    name: "Users",
    href: "/admin/users",
    iconSrc: "/24abe8ac687b197f68b69f6ff6bb64ca8a617ce0.svg",
  },
  {
    name: "Connects",
    href: "/admin/connects",
    iconSrc: "/87f8ad3969d9408fb97aefb22b5698f5e0d3a42e.svg",
  },
  {
    name: "Queries",
    href: "/admin/queries",
    iconSrc: "/4cd61d97f2bda24b70260a4faddb71df7716e5bd.svg",
    hasDropdown: true,
    subItems: [
      { name: "General", href: "/admin/queries/general" },
      { name: "Payment", href: "/admin/queries/payment" },
    ],
  },
];
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] })
export const AdminSidebar = () => {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleDropdown = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[242px] min-h-screen bg-[#E8F8FA] flex flex-col">
      {/* Logo Section */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-end">
            <div className="relative w-[15.395px] h-[19px]">
              <Image
                src="/f9bdc36fc903462c714dd636877cc51424a5769a.png"
                alt="MAS Logo"
                width={17.422}
                height={21.501}
                className="absolute -top-2.5 left-0 w-[17.422px] h-[21.501px] object-cover"
              />
            </div>
            <p
              className={`font-['Goldman:Regular',_sans-serif] text-[32px] leading-[32px] tracking-[-7.04px] ${inter.className}`}
            >
              MAS
            </p>
          </div>
          <p
            className={`font-bold text-[24px] leading-[35.5px] tracking-[-0.48px] ${inter.className}`}
          >
            Mr. Mentor
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-0 py-0 space-y-2">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.hasDropdown ? (
              <>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
                    isActive(item.href)
                      ? "bg-white rounded-2xl shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)] mx-0"
                      : "hover:bg-white/50 rounded-2xl mx-0"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center p-[5px] rounded-xl shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)] w-[30px] h-[30px] ${
                        isActive(item.href) ? "bg-[#1A97A4]" : "bg-white"
                      }`}
                    >
                      <Image
                        src={item.iconSrc}
                        alt={item.name}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className={`text-sm font-bold text-black ${inter.className}`}>
                      {item.name}
                    </span>
                  </div>
                  <Image
                    src="/da46d3fc0a79606e8a2b0d3e248e575d91cd548a.svg"
                    alt="dropdown arrow"
                    width={24}
                    height={24}
                    className={`w-6 h-6 transition-transform ${
                      expandedItem === item.name ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedItem === item.name && item.subItems && (
                  <div className="bg-white/30 ml-4 mr-4 rounded-lg mt-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 pl-14 py-2 text-sm transition-colors ${
                          pathname === subItem.href
                            ? "text-[#1A97A4] font-bold"
                            : "text-gray-700 hover:text-gray-900"
                        } ${inter.className}`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${
                  isActive(item.href)
                    ? "bg-white rounded-2xl shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)] mx-0"
                    : "hover:bg-white/50 rounded-2xl mx-0"
                }`}
              >
                <div
                  className={`flex items-center justify-center p-[5px] rounded-xl shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)] w-[30px] h-[30px] ${
                    isActive(item.href) ? "bg-[#1A97A4]" : "bg-white"
                  }`}
                >
                  <Image
                    src={item.iconSrc}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </div>
                <span className={`text-sm font-bold text-black ${inter.className}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
