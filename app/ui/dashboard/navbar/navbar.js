"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdPeople,
  MdSchool,
  MdAssignment,
  MdOutlineLibraryBooks,
  MdMenu,
  MdClose,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md"
import styles from "./navbar.module.css"

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard />,
  },
  {
    title: "Manajemen",
    icon: <MdSupervisedUserCircle />,
    subItems: [
      { title: "Users", path: "/dashboard/users", icon: <MdPeople /> },
      { title: "Siswa", path: "/dashboard/siswa", icon: <MdSchool /> },
      { title: "Guru", path: "/dashboard/guru", icon: <MdPeople /> },
      { title: "Mutasi Siswa", path: "/dashboard/mutasi", icon: <MdAssignment /> },
    ],
  },
  {
    title: "Absen",
    path: "/dashboard/absen",
    icon: <MdOutlineLibraryBooks />,
  },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getCurrentPageTitle = () => {
    for (const item of menuItems) {
      if (item.path === pathname) return item.title
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.path === pathname)
        if (subItem) return subItem.title
      }
    }
    return "Dashboard"
  }

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index)
  }

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.hidden : ''}`}>
      <div className={styles.left}>
        <Link href="/dashboard" className={styles.logoLink}>
          <img
            src="/logo-smp-advent.png"
            alt="School Logo"
            width={40}
            height={40}
            className={styles.logo}
          />
          <span className={styles.schoolName}>SMP ADVENT TOMPASO</span>
        </Link>
      </div>

      <button 
        className={styles.menuButton}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <MdClose /> : <MdMenu />}
      </button>

      <div className={`${styles.center} ${isMenuOpen ? styles.menuOpen : ''}`}>
        {menuItems.map((item, index) => (
          <div key={item.title} className={styles.menuItemWrapper}>
            {item.subItems ? (
              <>
                <button 
                  className={styles.menuItem} 
                  onClick={() => toggleDropdown(index)}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuText}>{item.title}</span>
                  {openDropdown === index ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                {openDropdown === index && (
                  <div className={styles.dropdown}>
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className={`${styles.menuItem} ${styles.subMenuItem} ${
                          pathname === subItem.path ? styles.active : ""
                        }`}
                      >
                        <span className={styles.menuIcon}>{subItem.icon}</span>
                        <span className={styles.menuText}>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.path}
                className={`${styles.menuItem} ${
                  pathname === item.path ? styles.active : ""
                }`}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuText}>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className={styles.right}>
        <h1 className={styles.pageTitle}>{getCurrentPageTitle()}</h1>
      </div>
    </nav>
  )
}