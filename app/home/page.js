'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Menu, 
  X, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import styles from '@/public/home.module.css'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

export default function Home() {
  // ============= State Management =============
  const [currentTime, setCurrentTime] = useState(null)
  const [welcomeText, setWelcomeText] = useState('Selamat Datang di')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('guru')

  // ============= Effects =============
  // Clock update effect
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Welcome text animation effect
  useEffect(() => {
    const texts = [
      'Membentuk Generasi Unggul',
      'Berakhlak Mulia',
      'Berprestasi Akademik',
      'dan Non-Akademik'
    ]
    let index = 0
    const textInterval = setInterval(() => {
      index = (index + 1) % texts.length
      setWelcomeText(texts[index])
    }, 3000)
    return () => clearInterval(textInterval)
  }, [])

  // ============= Animation Variants =============
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: { duration: 0.2 }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  // ============= Navigation Data =============
  const navLinks = [
    { href: 'tentang', label: 'Tentang' },
    { href: 'galeri', label: 'Galeri' },
    { href: 'fitur', label: 'Fitur' },
    { href: 'informasi', label: 'Informasi' },
    { href: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
    { href: 'lokasi', label: 'Lokasi' }
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ]

  // ============= Handler Functions =============
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }

  const handleRegister = () => {
    window.location.href = '/login'
  }

  const showLoginAlert = () => {
    Swal.fire({
      title: 'Akses Terbatas',
      text: 'Anda harus login terlebih dahulu',
      icon: 'info',
      confirmButtonText: 'Login Sekarang',
      showCancelButton: true,
      cancelButtonText: 'Tutup'
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogin()
      }
    })
  }

  return (
    <div className={styles.container}>
      {/* ============= Header Section ============= */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image 
            src="/logo-smp-advent.png" 
            alt="SMP ADVENT TOMPASO Logo" 
            width={40} 
            height={40} 
          />
          <h1 className={styles.title}>SMP ADVENT TOMPASO</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className={`${styles.nav} hidden md:flex`}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className={styles.navLink}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            className={`${styles.loginButton} hidden md:flex`}
            onClick={handleLogin}
          >
            Masuk
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed inset-y-0 right-0 w-[50%] h-full bg-black md:hidden z-50"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Tutup menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex flex-col p-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollToSection(link.href)}
                      className="py-2 px-4 hover:bg-white/10 rounded-lg transition-colors text-white text-left"
                    >
                      {link.label}
                    </button>
                  ))}
                  <button 
                    className={`${styles.loginButton} mt-4 mx-4 justify-center`}
                    onClick={handleLogin}
                  >
                    Masuk
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className={styles.main}>
        {/* ============= Hero Section ============= */}
        <motion.section 
          className={`${styles.hero} ${styles.animateOnScroll}`}
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.heroContent}>
            <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-teal-500">
              Selamat Datang di SMP ADVENT TOMPASO
            </motion.h1>
            <motion.h2 
              className={styles.animatedText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {welcomeText}
            </motion.h2>
          </div>
          <div className={styles.heroStats}>
            <button
              className={`${styles.button} ${styles.daftar}`}
              onClick={handleRegister}
            >
              Daftar Sekarang
            </button>
            <button
              className={`${styles.button} ${styles.pelajari}`}
              onClick={() => scrollToSection('tentang')}
            >
              Pelajari lebih lanjut
            </button>
          </div>
        </motion.section>

        {/* ============= About Section ============= */}
        <section id="tentang" className="w-full py-12 md:py-24 lg:py-32">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-teal-500"
          >
            Tentang Kami
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-white md:text-xl text-center max-w-3xl mx-auto mb-8"
          >
            SMP ADVENT TOMPASO adalah lembaga pendidikan yang berkomitmen untuk memberikan pendidikan berkualitas
            dengan nilai-nilai Kristiani. Kami fokus pada pengembangan akademik, karakter, dan keterampilan hidup
            untuk mempersiapkan siswa menghadapi masa depan yang cerah.
          </motion.p>
        </section>

        {/* ============= Gallery Section ============= */}
        <section id="galeri" className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center mb-12 text-sky-400"
            >
              Galeri Sekolah
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative h-64 overflow-hidden rounded-lg shadow-lg"
                >
                  <Image
                    src={`/galeri/galeri-${i}.jpg`}
                    alt={`Gallery Image ${i}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============= Features Section ============= */}
        <section id="fitur" className="w-full py-12 md:py-24 lg:py-32">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-sky-400"
          >
            Fitur Unggulan
          </motion.h2>
          <motion.div 
            className={`${styles.infoSection} ${styles.animateOnScroll}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              {
                title: "Program Unggulan",
                description: "Kurikulum terkini dan program ekstrakurikuler yang beragam"
              },
              {
                title: "Guru Berkualitas",
                description: "Tim pengajar profesional dan berpengalaman"
              },
              {
                title: "Fasilitas Modern",
                description: "Lingkungan belajar yang nyaman dan teknologi terkini"
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className={styles.infoCard}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <h3 className="font-bold text-teal-400 mb-5">{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ============= School Info Section ============= */}
        <section id="informasi" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-sky-400"
            >
              Informasi Sekolah
            </motion.h2>
            
            <motion.div 
              className="grid w-full grid-cols-2 bg-slate-500"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 50 }}
              
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button 
                className={`${activeTab === 'guru' ? 'bg-sky-800 text-white' : 'text-gray-400'} transition-colors w-full py-2`}
                onClick={() => setActiveTab('guru')}
              >
                Guru
              </button>
              <button 
                className={`${activeTab === 'siswa' ? 'bg-sky-800 text-white' : 'text-gray-400'} transition-colors w-full py-2`}
                onClick={() => setActiveTab('siswa')}
              >
                Siswa
              </button>
            </motion.div>
            
            {activeTab === 'guru' && (
              <motion.div 
                className="mt-4 bg-slate-400 bg-opacity-15 p-6"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-blue-500 text-lg font-semibold">Data Guru Berkualitas</h3>
                <p className="text-gray-400">Tim pengajar kami terdiri dari profesional berpengalaman di bidangnya masing-masing.</p>
                <ul className="list-disc pl-5 text-gray-300 mt-2">
                  <li>20+ guru bersertifikasi</li>
                  <li>Rata-rata pengalaman mengajar 10+ tahun</li>
                  <li>Pelatihan dan pengembangan berkelanjutan</li>
                  <button 
                  onClick={showLoginAlert}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Lihat Guru
                </button>
                </ul>
              </motion.div>
            )}
            
            {activeTab === 'siswa' && (
              <motion.div 
                className="mt-4 bg-slate-400 bg-opacity-15 p-6"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-blue-500 text-lg font-semibold">Data Siswa</h3>
                <p className="text-gray-400">Informasi mengenai populasi siswa di SMP ADVENT TOMPASO.</p>
                <ul className="list-disc pl-5 text-gray-300 mt-2">
                  <li>Total siswa: 300+</li>
                  <li>Rasio guru-siswa: 1:15</li>
                  <li>Tingkat kelulusan: 98%</li>
                  <button 
                  onClick={showLoginAlert}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Lihat Siswa
                </button>
                </ul>
              </motion.div>
            )}
          </div>
        </section>

        {/* ============= Extracurricular Section ============= */}
        <section id="ekstrakurikuler" className="w-full py-12 md:py-24 lg:py-32">
          <motion.section 
            className={`${styles.extracurricularSection} ${styles.animateOnScroll}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-sky-400"
            >
              Kegiatan Ekstrakurikuler
            </motion.h2>
            <motion.table 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.extracurricularTable}
            >
              <thead>
                <tr>
                  <th>Hari</th>
                  <th>Kegiatan</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { day: "Senin", activity: "Basket", time: "15:30 - 17:00" },
                  { day: "Selasa", activity: "Pramuka", time: "15:30 - 17:00" },
                  { day: "Rabu", activity: "English Club", time: "15:30 - 17:00" },
                  { day: "Kamis", activity: "Sepak Bola", time: "15:30 - 17:00" },
                  { day: "Jumat", activity: "Paduan Suara", time: "15:30 - 17:00" }
                ].map((schedule, index) => (
                  <motion.tr
                    key={schedule.day}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <td>{schedule.day}</td>
                    <td>{schedule.activity}</td>
                    <td>{schedule.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </motion.section>
        </section>

        {/* ============= Location Section ============= */}
        <motion.section 
          id="lokasi"
          className={`${styles.locationSection} ${styles.animateOnScroll}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.h2         
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-sky-400"
          >
            Lokasi Kami
          </motion.h2>
          <div className={styles.locationInfo}>
            <MapPin className="w-6 h-6" />
            <p>Jl. Raya Tompaso, Minahasa, Sulawesi Utara</p>
          </div>
          <div className={styles.locationImageContainer}>
            <Image
              src="/smp-advent-tompaso.jpg"
              alt="Lokasi SMP ADVENT TOMPASO"
              width={1200}
              height={600}
              className={styles.locationImage}
            />
            <div className={styles.mapOverlay}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.9570133965376!2d124.78980258885497!3d1.1905506000000015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x328747a2acab5921%3A0x18012946cec7c519!2sSekolah%20Lanjutan%20Advent!5e0!3m2!1sid!2sid!4v1730264062053!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </motion.section>
      </main>

      {/* ============= Footer Section ============= */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className="text-xl font-semibold mb-4">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <p>info@smpadventtompaso.sch.id</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <p>(0431) 123456</p>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <p>www.smpadventtompaso.sch.id</p>
              </div>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className="text-xl font-semibold mb-4">Tautan Cepat</h3>
            <div className="space-y-2">
              <Link href="/profil" className="block hover:text-blue-400 transition-colors">
                Profil Sekolah
              </Link>
              <Link href="/fasilitas" className="block hover:text-blue-400 transition-colors">
                Fasilitas
              </Link>
              <Link href="/prestasi" className="block hover:text-blue-400 transition-colors">
                Prestasi
              </Link>
              <Link href="/ppdb" className="block hover:text-blue-400 transition-colors">
                PPDB Online
              </Link>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className="text-xl font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="hover:text-blue-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>© 2024 SMP ADVENT TOMPASO. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}