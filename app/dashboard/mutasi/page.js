import Link from "next/link";
import styles from "@/app/ui/dashboard/master/mutasi.module.css"

export default function MutasiPage() {
  return (
    <div className={styles.container}>
      <div className={styles.top}></div>
      <div className={styles.buttonContainer}>
        <Link href="/dashboard/mutasi/masuk">
          <button className={`${styles.mutasiButton} ${styles.masuk}`}>
            Mutasi Masuk
          </button>
        </Link>
        <Link href="/dashboard/mutasi/keluar">
          <button className={`${styles.mutasiButton} ${styles.keluar}`}>
            Mutasi Keluar
          </button>
        </Link>
      </div>
    </div>
  );
}
