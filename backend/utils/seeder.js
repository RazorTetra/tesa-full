// backend/utils/seeder.js
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "../config/database.js";

// Load env vars
dotenv.config();

// Import all models
import User from "../models/user.js";
import Guru from "../models/guru.js";
import Siswa from "../models/siswa.js";
import SiswaMutasiMasuk from "../models/siswaMutasiMasuk.js";
import SiswaMutasiKeluar from "../models/siswaMutasiKeluar.js";
import Absen from "../models/absen.js";

const validateData = async (data, model) => {
  const errors = [];
  for (const item of data) {
    const doc = new model(item);
    try {
      await doc.validate();
    } catch (error) {
      errors.push(`Validation error for ${model.modelName}: ${error.message}`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Validation errors found:\n${errors.join("\n")}`);
  }
};

const generateSampleData = async () => {
  const baseData = {
    guruData: [
      {
        nama: "Ronny F.R. Tulungen, S.Pd., M.Pd",
        nip: "197105151998021006",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Jan S. Ferdinandus, S.Kom",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Drs. Ch. Najoan, M.Pd",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Yoshiko Suzuki, S.Pd",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Vendly Donny Poluan, SE",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Ferry Nixon Lasut, S.Pd.",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Jois Munaiseche, S.Pd",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Riana Dayoh, S.Kom",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Maya Lontaan, S.Pd.",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Meilan R. Momuat, S.Pd",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Daud J. Tedjo, SE",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Dra. Debby Gladys Rangingisan",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Sonny Tamunu, S.Pd.",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Junamay Marcia Paula Raranta, A.Ms",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Jeslin Mulyadi, S.Psi",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Kesty Y. Tulangow, S.pd",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
      {
        nama: "Andris Drik, M.Min",
        nip: "-",
        nomorTlp: "-",
        agama: "Kristen",
        alamat: "-",
      },
    ],
    siswaData: [
      {
        nama: "Abner Peter Sembel",
        nisn: "0019277308",
        kelas: "VIII B",
        alamat: "KARUMENGA",
        status: "Siswa",
      },
      {
        nama: "ADVINSIA MIKHA MAINDOKA",
        nisn: "0108634703",
        kelas: "IX A",
        alamat: "TOMPASO 2",
        status: "Siswa",
      },
      {
        nama: "AILEEN YUKI DAMOPOLI",
        nisn: "0118260868",
        kelas: "VIII A",
        alamat: "TONDANO AIRMADIDI",
        status: "Siswa",
      },
      {
        nama: "AKIKO GREENLY REGIZELT WALADOW",
        nisn: "0126529747",
        kelas: "VII C",
        alamat: "TORAGET",
        status: "Siswa",
      },
      {
        nama: "Alfano Mirrel Manorek",
        nisn: "3148129751",
        kelas: "VIII B",
        alamat: "Kampus SLA Tompaso",
        status: "Siswa",
      },
      {
        nama: "ALLENTINE GISELLE NGALA",
        nisn: "0118183724",
        kelas: "VII B",
        alamat: "PASSO",
        status: "Siswa",
      },
      {
        nama: "Amirykal Princess Brithney Paendong",
        nisn: "0122572981",
        kelas: "VII B",
        alamat: "Kolongan Atas",
        status: "Siswa",
      },
      {
        nama: "ANUGRAH STEDY MOMOMUAT",
        nisn: "0109133918",
        kelas: "IX A",
        alamat: "PINABETENGAN",
        status: "Siswa",
      },
      {
        nama: "APRILIA WENAS",
        nisn: "0109997274",
        kelas: "IX A",
        alamat: "TOMPASO 2",
        status: "Siswa",
      },
      {
        nama: "ARION AZAREL PANTOUW",
        nisn: "0119648817",
        kelas: "IX B",
        alamat: "KARUMENGA",
        status: "Siswa",
      },
      {
        nama: "Ashley Claudya Senaen",
        nisn: "0124876771",
        kelas: "VII A",
        alamat: "Jaga III",
        status: "Siswa",
      },
      {
        nama: "AZYFHA ARSYA RANTUNG",
        nisn: "0105353699",
        kelas: "IX B",
        alamat: "KAWANGKOAN",
        status: "Siswa",
      },
      {
        nama: "B. J. RENDALL SELOWIJOYO",
        nisn: "0108291712",
        kelas: "IX B",
        alamat: "KAWANGKOAN",
        status: "Siswa",
      },
      {
        nama: "BABBYAXELIA KERENHAPUKH PANGAU",
        nisn: "0128751265",
        kelas: "VII B",
        alamat: "PAREPEI",
        status: "Siswa",
      },
      {
        nama: "Belva Dennella Aquene Suoth",
        nisn: "0115593138",
        kelas: "IX A",
        alamat: "Pondang",
        status: "Siswa",
      },
      {
        nama: "Casey Annabelle Maleke",
        nisn: "0123422142",
        kelas: "VIII A",
        alamat: "Kakas",
        status: "Siswa",
      },
      {
        nama: "Celsi Aitago",
        nisn: "0103739476",
        kelas: "VIII B",
        alamat: "DELTA",
        status: "Siswa",
      },
      // {
      //   nama: "Abner Peter Sembel",
      //   nisn: "0019277308",
      //   kelas: "VIII B",
      //   alamat: "KARUMENGA",
      //   status: "Siswa",
      // },
      {
        nama: "CEYLA ALENA MICHELE WARBUNG",
        nisn: "0109857529",
        kelas: "IX B",
        alamat: "JAGA II",
        status: "Siswa",
      },
      {
        nama: "Cheryl Jizli Wuysan",
        nisn: "3105996344",
        kelas: "IX A",
        alamat: "Lanut",
        status: "Siswa",
      },
      {
        nama: "CHRISTA JENIFFER LOING",
        nisn: "0104672073",
        kelas: "VII A",
        alamat: "JLN KANAAN DUSUN I",
        status: "Siswa",
      },
      {
        nama: "CHRISTIAN ADITHYA AXEL",
        nisn: "0109794475",
        kelas: "VII B",
        alamat: "JL. MIANGAS NO. 5O",
        status: "Siswa",
      },
      {
        nama: "CHRISTIAN JUNIOR SERAN",
        nisn: "3120993897",
        kelas: "VII B",
        alamat: "TONSEWER",
        status: "Siswa",
      },
      {
        nama: "Christiany Angelie Pontoh",
        nisn: "0118832972",
        kelas: "VIII A",
        alamat: "Jalan Paslaten",
        status: "Siswa",
      },
      {
        nama: "CINTA PEARLY PAPUTUNGAN",
        nisn: "0112750217",
        kelas: "VIII B",
        alamat: "JAGA 3",
        status: "Siswa",
      },
      {
        nama: "Clark Shane Isaac Manamuri",
        nisn: "0121489690",
        kelas: "VII B",
        alamat: "Kilo III",
        status: "Siswa",
      },
      {
        nama: "Dale Tangian Ferdy	",
        nisn: "0114168504	",
        kelas: "VII A	",
        alamat: "Jln. Raya Bintuni - KM 4",
        status: "Siswa",
      },
      {
        nama: "Daren Wenas",
        nisn: "	0116034275	",
        kelas: "VII A	",
        alamat: "watutumou",
        status: "Siswa",
      },
      {
        nama: "DEVALDI D. ALUNGGUNUSA	",
        nisn: "0101879205		",
        kelas: "VII A	",
        alamat: "PALDUA",
        status: "Siswa",
      },

      {
        nama: "Devit Richardo Wuysan	",
        nisn: "0093379258	",
        kelas: "IX B	",
        alamat: "Lanut",
        status: "Siswa",
      },
      {
        nama: "Edward Joachim Kalalo	",
        nisn: "0119927034	",
        kelas: "VIII A	",
        alamat: "Matani 3",
        status: "Siswa",
      },
      {
        nama: "EFRAIM RAFAEL FRANSISCO KONDENGIS	",
        nisn: "0117873725	",
        kelas: "VIII A	",
        alamat: "TOMPASO",
        status: "Siswa",
      },
      {
        nama: "ELIZABETH ELVINA SAKKA",
        nisn: "0127965531",
        kelas: "VII B",
        alamat: "-",
        status: "Siswa",
      },
      {
        nama: "Elizabeth Salombe",
        nisn: "3120284179",
        kelas: "VII C",
        alamat: "Kawangkoan",
        status: "Siswa",
      },
      {
        nama: "Elshadai Naomi Bujung",
        nisn: "0129446516",
        kelas: "VII B",
        alamat: "Lingkungan II",
        status: "Siswa",
      },
      {
        nama: "ENZY JIEUN NELWAN",
        nisn: "0109197768",
        kelas: "IX B",
        alamat: "TOMPASO",
        status: "Siswa",
      },
      {
        nama: "EUNIKE JELINA KANDOU",
        nisn: "0121652883",
        kelas: "VII C",
        alamat: "WALEWANGKO",
        status: "Siswa",
      },
      {
        nama: "EVELYN ALEXANDREA KANTOHE",
        nisn: "0121247312",
        kelas: "VII C",
        alamat: "JAGA II",
        status: "Siswa",
      },
      {
        nama: "Evfraim Gydeon Lempoy",
        nisn: "0107010101",
        kelas: "IX A",
        alamat: "poopo",
        status: "Siswa",
      },
      {
        nama: "Excel Deo Lumintang",
        nisn: "0125285965",
        kelas: "VII A",
        alamat: "Jalan Raya Ratahan",
        status: "Siswa",
      },
      {
        nama: "EZEQUIEL THEODORE LONTAAN",
        nisn: "0127517664",
        kelas: "VII A",
        alamat: "TOUNELET",
        status: "Siswa",
      },
      {
        nama: "FELOXIA CH SERAN",
        nisn: "0106838503",
        kelas: "VIII A",
        alamat: "TONSEWER",
        status: "Siswa",
      },
      {
        nama: "Ferni Aitago",
        nisn: "0097459818",
        kelas: "VII B",
        alamat: "DELTA",
        status: "Siswa",
      },
      {
        nama: "FHILEINA C. M. TENDEAN",
        nisn: "0115462897",
        kelas: "VIII B",
        alamat: "DESA",
        status: "Siswa",
      },
      {
        nama: "FJ. CRUISER MIGUEL KEMBAU",
        nisn: "0116939752",
        kelas: "VII B",
        alamat: "LINGKUNGAN V TALIKURAN",
        status: "Siswa",
      },
      {
        nama: "FLORENZY AMORA LUCIANA KAWONAL",
        nisn: "0126371178",
        kelas: "VII C",
        alamat: "JAGA IX",
        status: "Siswa",
      },
      {
        nama: "FLOWERNCHYA G. KOROMPIS",
        nisn: "0127608476",
        kelas: "VII C",
        alamat: "KAKAS BARAT",
        status: "Siswa",
      },
      {
        nama: "FRANS ADITYA TAMBUN",
        nisn: "0103093519",
        kelas: "VIII B",
        alamat: "JL. KEMANG",
        status: "Siswa",
      },
      {
        nama: "Frans Mika Alexi Pratama Karangan",
        nisn: "0121261775",
        kelas: "VII A",
        alamat: "Jln 14 Februari",
        status: "Siswa",
      },
      {
        nama: "FRICILIA LENCI KAYOI ALOW",
        nisn: "3100658195",
        kelas: "IX B",
        alamat: "JL. SANGGAR BHAKTI",
        status: "Siswa",
      },
      {
        nama: "Fristly Mirsa Tabita Tampi",
        nisn: "3126066607",
        kelas: "VII B",
        alamat: "Talaitad Utara",
        status: "Siswa",
      },
      {
        nama: "Gabriel Hanry Rompas",
        nisn: "0123580996",
        kelas: "VII B",
        alamat: "Lingkungan IV",
        status: "Siswa",
      },
      {
        nama: "GEOVANIX ALFACERO ONELEE ROMPAS",
        nisn: "0118402470",
        kelas: "VIII B",
        alamat: "SENDANGAN SELATAN LINGKUNGAN IV",
        status: "Siswa",
      },
      {
        nama: "Giftriela Esther Munaiseche",
        nisn: "3128582973",
        kelas: "VIII A",
        alamat: "Tombatu",
        status: "Siswa",
      },
      {
        nama: "GISELA RAKIAN",
        nisn: "0116260113",
        kelas: "IX A",
        alamat: "PANASEN",
        status: "Siswa",
      },
      {
        nama: "GIVEEN FLLANDY REMBET",
        nisn: "0123940034",
        kelas: "VII A",
        alamat: "TALIKURAN UTARA LINGKUNGAN V",
        status: "Siswa",
      },
      {
        nama: "GLORIA JOANNA TOMPUNU",
        nisn: "0114279385",
        kelas: "VIII A",
        alamat: "JAGA 2",
        status: "Siswa",
      },
      {
        nama: "GLORIA KIYOSHI LEGI",
        nisn: "0124521133",
        kelas: "VII B",
        alamat: "Jaga 4 - Desa Lobu Satu",
        status: "Siswa",
      },
      {
        nama: "GRILNA APRILIA ROMPIS",
        nisn: "0121756555",
        kelas: "VII A",
        alamat: "TOMBASIAN ATAS",
        status: "Siswa",
      },
      {
        nama: "Haigchel Given Lordy Lumain",
        nisn: "3129832133",
        kelas: "VII A",
        alamat: "Tompaso",
        status: "Siswa",
      },
      {
        nama: "Happy Seventday Monalu",
        nisn: "0129008367",
        kelas: "VII B",
        alamat: "Desa Winorangian Satu",
        status: "Siswa",
      },
      {
        nama: "HIROSI TANAUMA",
        nisn: "0108018555",
        kelas: "IX B",
        alamat: "TOWUNTU TIMUR",
        status: "Siswa",
      },
      {
        nama: "Imelda Rosiana Naomi Antouw",
        nisn: "0113993835",
        kelas: "VII C",
        alamat: "Koyawas Jaga 1",
        status: "Siswa",
      },
      {
        nama: "INTAN KARUNIA KOSEGERAN",
        nisn: "0122796909",
        kelas: "VII B",
        alamat: "Lobu Kec. Touluaan",
        status: "Siswa",
      },
      {
        nama: "Irwin Frans Miojo Jr",
        nisn: "3119552901",
        kelas: "VIII B",
        alamat: "Kawangkoan",
        status: "Siswa",
      },
      {
        nama: "ISHERA NAOMIKA KAIRUPAN",
        nisn: "0127424149",
        kelas: "VII B",
        alamat: "WALEURE",
        status: "Siswa",
      },
      {
        nama: "JACOB JERICO DAMARYANAN",
        nisn: "3109565151",
        kelas: "IX A",
        alamat: "JAGA I",
        status: "Siswa",
      },
      {
        nama: "JANED CHELSEA SAMBUAGA",
        nisn: "0118890422",
        kelas: "IX A",
        alamat: "KARUMENGA",
        status: "Siswa",
      },
      {
        nama: "JAVIER BENEDITH JONATHAN KASEGER",
        nisn: "0107576569",
        kelas: "IX A",
        alamat: "-",
        status: "Siswa",
      },
      {
        nama: "Jayden Jibrael Kaligis",
        nisn: "3119588804",
        kelas: "VIII B",
        alamat: "Langowan",
        status: "Siswa",
      },
      {
        nama: "Jelomy Prayli Rompis",
        nisn: "3109237168",
        kelas: "IX A",
        alamat: "Desa Wusa",
        status: "Siswa",
      },
      {
        nama: "JEREMY JEKSEN RORI",
        nisn: "0126511747",
        kelas: "VII A",
        alamat: "TONSEWER SELATAN",
        status: "Siswa",
      },
      {
        nama: "JESSICA POLUAN",
        nisn: "0119612649",
        kelas: "VIII A",
        alamat: "Liba",
        status: "Siswa",
      },
      {
        nama: "Jovandre Taguriri",
        nisn: "0117916819",
        kelas: "VIII B",
        alamat: "Salurang",
        status: "Siswa",
      },
      {
        nama: "JULIAN WARANEY JOSEPH MANOPPO",
        nisn: "0118419179",
        kelas: "VII B",
        alamat: "LINGKUNGAN 7",
        status: "Siswa",
      },
      {
        nama: "JULIETA JOY LUMAWIR",
        nisn: "0107796604",
        kelas: "IX A",
        alamat: "Jalan Desa Elusan Kecamatan Amurang Barat",
        status: "Siswa",
      },
      {
        nama: "JULIO MANONGKO",
        nisn: "0127629762",
        kelas: "VII A",
        alamat: "TONSEWER",
        status: "Siswa",
      },
      {
        nama: "JUNIOR JONATAN TENDEAN",
        nisn: "0109018217",
        kelas: "IX B",
        alamat: "TOMPASO",
        status: "Siswa",
      },
      {
        nama: "Justin Anggara Putra",
        nisn: "0111997122",
        kelas: "VIII B",
        alamat: "Airmadidi",
        status: "Siswa",
      },
      {
        nama: "KATARINA FLORENSIA FATAGUR",
        nisn: "0104856265",
        kelas: "VIII A",
        alamat: "TRANS IRIAN",
        status: "Siswa",
      },
      {
        nama: "KEANE LEONARD RATURANDANG",
        nisn: "0118262133",
        kelas: "VIII B",
        alamat: "AMONGENA 1",
        status: "Siswa",
      },
      {
        nama: "KENNETH IMANUEL KOMALING",
        nisn: "0119059141",
        kelas: "IX B",
        alamat: "TOMPASO DUA",
        status: "Siswa",
      },
      {
        nama: "Kenneth Wimffrey Runtuwarouw",
        nisn: "0117416994",
        kelas: "VIII B",
        alamat: "JL. Mawar No.42 Lingk. 2",
        status: "Siswa",
      },
      {
        nama: "KEZIA KANIA POLUAN",
        nisn: "3107094560",
        kelas: "IX B",
        alamat: "JALAN DESA LIBA",
        status: "Siswa",
      },
      {
        nama: "Kimberly Hillery Jessie Lumintang",
        nisn: "0127291461",
        kelas: "VII A",
        alamat: "Tounelet",
        status: "Siswa",
      },
      {
        nama: "KIMBERLY SUJIN SERAN",
        nisn: "0105910555",
        kelas: "IX B",
        alamat: "TONSEWER",
        status: "Siswa",
      },
      {
        nama: "KIMI SEBASTIAN PANGEMANAN",
        nisn: "3115939153",
        kelas: "VIII A",
        alamat: "TOMPASO",
        status: "Siswa",
      },
      {
        nama: "KINGLIE ADHI SATYA RUMESER",
        nisn: "0122594259",
        kelas: "VII A",
        alamat: "KAWANGKOAN",
        status: "Siswa",
      },
      {
        nama: "KIREY LOVELY ANGELICA KROMO",
        nisn: "3127348719",
        kelas: "VII B",
        alamat: "TOMPASO II",
        status: "Siswa",
      },
      {
        nama: "Kluivert Gilbert Pandoh",
        nisn: "3122716245",
        kelas: "VII B",
        alamat: "Leilem",
        status: "Siswa",
      },
      {
        nama: "Laquiesha Aurora Pangalila",
        nisn: "0102032987",
        kelas: "IX A",
        alamat: "Lingkungan 1",
        status: "Siswa",
      },
      {
        nama: "LEAH QUIMBERLY KAWUWUNG",
        nisn: "0123421843",
        kelas: "VII A",
        alamat: "LORONG",
        status: "Siswa",
      },
      {
        nama: "LEASTIZYA OKTAVAIN MASSIE",
        nisn: "3102427405",
        kelas: "IX B",
        alamat: "jaga 2 kamanga 2",
        status: "Siswa",
      },
      {
        nama: "Lionelle Marchia Liogu",
        nisn: "0112135954",
        kelas: "VIII A",
        alamat: "Rerewokan - Tondano",
        status: "Siswa",
      },
      {
        nama: "LOVELY OLIVIA PANGAYOW",
        nisn: "0103639009",
        kelas: "IX B",
        alamat: "DESA RINONDOR",
        status: "Siswa",
      },
      {
        nama: "Manasye Justice'sia En Worotitjan",
        nisn: "0101137734",
        kelas: "IX B",
        alamat: "Bongkudai Baru",
        status: "Siswa",
      },
      {
        nama: "Marcheaven jizrel Rendi Onibala",
        nisn: "3121187944",
        kelas: "VII B",
        alamat: "Jln Siswa",
        status: "Siswa",
      },
      {
        nama: "MARFHIL GAMALIEL MAHUPALE",
        nisn: "0106555945",
        kelas: "IX B",
        alamat: "TOMPASO",
        status: "Siswa",
      },
      {
        nama: "MARJUANA VIOLETA BATE",
        nisn: "0103845676",
        kelas: "VIII A",
        alamat: "JALUR 1",
        status: "Siswa",
      },
      {
        nama: "MARK WINLY SAHENSOLAR",
        nisn: "0127712521",
        kelas: "VII C",
        alamat: "JAGA II",
        status: "Siswa",
      },
      {
        nama: "MARKFIN M OROH",
        nisn: "0116043265",
        kelas: "VIII B",
        alamat: "-",
        status: "Siswa",
      },
      {
        nama: "MEKAYLA JOSSLYN PANGAYOW",
        nisn: "0112269241",
        kelas: "VIII B",
        alamat: "TANAH MERAH",
        status: "Siswa",
      },
      {
        nama: "MELODI NOFINE SUMUAL",
        nisn: "0116536046",
        kelas: "VII C",
        alamat: "kakas",
        status: "Siswa",
      },
      {
        nama: "MICHELE BLESSING ABIGAIEL SUAWA",
        nisn: "0128463996",
        kelas: "VII C",
        alamat: "AMONGENA 2",
        status: "Siswa",
      },
      {
        nama: "MICOLA ALEXANDRO MAMESAH",
        nisn: "0103381096",
        kelas: "IX A",
        alamat: "JAGA 4",
        status: "Siswa",
      },
      {
        nama: "MIKAYLA VIRGIN VELOVE WANGKE",
        nisn: "0107124824",
        kelas: "IX A",
        alamat: "Jaga III",
        status: "Siswa",
      },
      {
        nama: "MIKHAYLA LETIZIA TAMBUWUN",
        nisn: "0116374777",
        kelas: "VII C",
        alamat: "MANEMBO",
        status: "Siswa",
      },
      {
        nama: "MIRACLE RIFKY KAMBEY",
        nisn: "0118068836",
        kelas: "VIII B",
        alamat: "WOLAANG",
        status: "Siswa",
      },
      {
        nama: "Misael Miracle Dio Lembong",
        nisn: "3127857585",
        kelas: "VIII A",
        alamat: "Jaga II",
        status: "Siswa",
      },
      {
        nama: "Mochamad Alif Abdurrazaq",
        nisn: "0104843064",
        kelas: "IX B",
        alamat: "Tomohon tanawangko",
        status: "Siswa",
      },
      {
        nama: "MONICA PUTRI KOERIF TAULU",
        nisn: "3121691019",
        kelas: "VIII A",
        alamat: "TOMPASO DUA JAGA II",
        status: "Siswa",
      },
      {
        nama: "Nadine Nacita Wahyogo",
        nisn: "0124642815",
        kelas: "VII A",
        alamat: "Lingkungan IV Perkamil",
        status: "Siswa",
      },
      {
        nama: "NATHAN D. A. SENDUK",
        nisn: "3125902432",
        kelas: "VII A",
        alamat: "Jaga III",
        status: "Siswa",
      },
      {
        nama: "Nathaniel Eugenio Fyro Tangkilisan",
        nisn: "0117296932",
        kelas: "VIII B",
        alamat: "Jln. Kawangkoan - Tonsewer",
        status: "Siswa",
      },
      {
        nama: "NI NYOMAN AURELIANANDA",
        nisn: "0116881952",
        kelas: "IX B",
        alamat: "KAWANGKOAN",
        status: "Siswa",
      },
      {
        nama: "Nikita Syalomita Kawonal",
        nisn: "0096850672",
        kelas: "IX A",
        alamat: "Modayag",
        status: "Siswa",
      },
      {
        nama: "OTNIEL MATTHEW LUMINTANG",
        nisn: "0119534081",
        kelas: "VIII B",
        alamat: "JALAN RAYA RATAHAN",
        status: "Siswa",
      },
      {
        nama: "PAMELA QUEENSARAI SUOTH",
        nisn: "0097243508",
        kelas: "IX B",
        alamat: "TEMPANG",
        status: "Siswa",
      },
      {
        nama: "PAMELA RAKIAN",
        nisn: "0121445040",
        kelas: "VII A",
        alamat: "PANASEN",
        status: "Siswa",
      },
      {
        nama: "PRAYER GOODBLESS IMANUEL ONIBALA",
        nisn: "0105572201",
        kelas: "IX B",
        alamat: "LINGKUNGAN I",
        status: "Siswa",
      },
      {
        nama: "PRAYSI MAMESAH",
        nisn: "0115951604",
        kelas: "VIII B",
        alamat: "-",
        status: "Siswa",
      },
      {
        nama: "Praysie Daphnie Malingkas",
        nisn: "0109199223",
        kelas: "IX B",
        alamat: "Komp. Perumahan Dockarim No. 12 B",
        status: "Siswa",
      },
      {
        nama: "PRICILIA AVIOR SALUNGWENI",
        nisn: "0124605723",
        kelas: "VII C",
        alamat: "WINEBETAN",
        status: "Siswa",
      },
      {
        nama: "PRINCE MILANO IMANUEL SUMIGAR",
        nisn: "0129635319",
        kelas: "VII C",
        alamat: "MARINTEK",
        status: "Siswa",
      },
      {
        nama: "Princess lovely Sitanggang",
        nisn: "3114621368",
        kelas: "VII A",
        alamat: "kampung lama",
        status: "Siswa",
      },
      {
        nama: "PUTRI KENDEK",
        nisn: "0108963267",
        kelas: "IX A",
        alamat: "AMONGENA 3",
        status: "Siswa",
      },
      {
        nama: "Queen Mirakhe Clensy Mamuaya",
        nisn: "0115926521",
        kelas: "VIII B",
        alamat: "Malalayang",
        status: "Siswa",
      },
      {
        nama: "QUEEN SLAT",
        nisn: "0112296583",
        kelas: "VIII A",
        alamat: "BASAAN",
        status: "Siswa",
      },
      {
        nama: "QUEENZHA VIRGIE NARA",
        nisn: "0113258393",
        kelas: "IX B",
        alamat: "TOMPASO",
        status: "Siswa",
      },
      {
        nama: "QYREEN JOELINE ONIBALA",
        nisn: "0116947994",
        kelas: "IX A",
        alamat: "KAMANGA II",
        status: "Siswa",
      },
      {
        nama: "Rafael Nataniel Sendewana",
        nisn: "0112469852",
        kelas: "VIII B",
        alamat: "Desa Poleganyara",
        status: "Siswa",
      },
      {
        nama: "Raphael Jayden Gabriel Tangian",
        nisn: "0103217300",
        kelas: "IX B",
        alamat: "Tamansari Bunaken",
        status: "Siswa",
      },
      {
        nama: "RASYA EKA PUTRA WIYONO",
        nisn: "0102887201",
        kelas: "IX A",
        alamat: "JAGA VI",
        status: "Siswa",
      },
      {
        nama: "RAVELIA VANESA PUTRI SAMBUAGA",
        nisn: "0122535030",
        kelas: "VII B",
        alamat: "JAGA 2 WINORANGIAN",
        status: "Siswa",
      },
      {
        nama: "RENATA DEANDRA LUMENTA",
        nisn: "0109974434",
        kelas: "IX A",
        alamat: "JAGA I",
        status: "Siswa",
      },
      {
        nama: "REVALIO VEBIAN PUTRA SAMBUAGA",
        nisn: "0128738791",
        kelas: "VII B",
        alamat: "JAGA 2 WINORANGIAN",
        status: "Siswa",
      },
      {
        nama: "REZQY RADITHYA HAMJA",
        nisn: "0095556215",
        kelas: "IX B",
        alamat: "Jalan Raya Tanjung Niara",
        status: "Siswa",
      },
      {
        nama: "Rolando Aguero Tebo",
        nisn: "0114862022",
        kelas: "VII A",
        alamat: "Yordan",
        status: "Siswa",
      },
      {
        nama: "ROXANNE LISETTE GRACIA LOMBOGIA",
        nisn: "0111648107",
        kelas: "VIII B",
        alamat: "Jl. Taman Siswa 23",
        status: "Siswa",
      },
      {
        nama: "SABATICHA BLESSING MUNAISECHE",
        nisn: "0117937064",
        kelas: "IX B",
        alamat: "JALAN AKD DESA BUMBUNGON",
        status: "Siswa",
      },
      {
        nama: "SABBATHEO LONTAAN",
        nisn: "3104298655",
        kelas: "VIII A",
        alamat: "JAGA I",
        status: "Siswa",
      },
      {
        nama: "SABBATHIAN GIOVANNO KUMENDONG WATUNA",
        nisn: "3136544401",
        kelas: "VII A",
        alamat: "kombi",
        status: "Siswa",
      },
      {
        nama: "SAMUDRA JUAN TUMAMBO",
        nisn: "0122994300",
        kelas: "VII A",
        alamat: "JAGA IV",
        status: "Siswa",
      },
      {
        nama: "Sarah Zephaniah Eyveline Languyu",
        nisn: "0129778692",
        kelas: "VII B",
        alamat: "Jaga I",
        status: "Siswa",
      },
      {
        nama: "SERAPHIM CALLYSTA WORAN",
        nisn: "0128157661",
        kelas: "VII B",
        alamat: "JAGA 4 - DESA RANOKETANG ATAS SATU",
        status: "Siswa",
      },
      {
        nama: "SHALOMITA IMANUELLA KALANGI",
        nisn: "0113853285",
        kelas: "VIII A",
        alamat: "Jln.Kalimantan",
        status: "Siswa",
      },
      {
        nama: "SHINE VINCENH KUMAJAS",
        nisn: "0121371746",
        kelas: "VII A",
        alamat: "WINANGUN",
        status: "Siswa",
      },
      {
        nama: "Stefani Hardiyana Anita Waramori",
        nisn: "0106848072",
        kelas: "VIII B",
        alamat: "Hamadi Gunung",
        status: "Siswa",
      },
      {
        nama: "STEVANO SAMUEL ONSU",
        nisn: "0114562020",
        kelas: "VII A",
        alamat: "TOMPASO 2",
        status: "Siswa",
      },
      {
        nama: "SUSAN WETAPO",
        nisn: "0118785101",
        kelas: "VII B",
        alamat: "HITIGIMA-AIR GARAM",
        status: "Siswa",
      },
      {
        nama: "TESALONIKA DEBORA ANUGRAH PUTRI RURU",
        nisn: "0111050618",
        kelas: "VII A",
        alamat: "JAGA II",
        status: "Siswa",
      },
      {
        nama: "Thea Janelle Lopez",
        nisn: "0103611060",
        kelas: "IX B",
        alamat: "Tiban I Blok D No 24",
        status: "Siswa",
      },
      {
        nama: "TIMBERLINA KALIGIS",
        nisn: "0129531899",
        kelas: "VIII A",
        alamat: "DESA",
        status: "Siswa",
      },
      {
        nama: "TIMOTHY VALENCIO SUPIT",
        nisn: "0102540443",
        kelas: "IX A",
        alamat: "JAGA 1",
        status: "Siswa",
      },
      {
        nama: "Tomblin",
        nisn: "0108228459",
        kelas: "VIII A",
        alamat: "Jl. Nyiur Indah",
        status: "Siswa",
      },
      {
        nama: "TRAVIS PASTRANA OPING",
        nisn: "0109473635",
        kelas: "IX A",
        alamat: "Jaga",
        status: "Siswa",
      },
      {
        nama: "TRIFENA ROSELY MIOJO",
        nisn: "0122453462",
        kelas: "VII B",
        alamat: "KAWANGKOAN",
        status: "Siswa",
      },
      {
        nama: "TYANNA QUEENITA LAMBAGU",
        nisn: "0104597753",
        kelas: "IX A",
        alamat: "DESA AKEDIRI",
        status: "Siswa",
      },
      {
        nama: "Valentine Dayfine Pangalila",
        nisn: "0107699204",
        kelas: "IX A",
        alamat: "jl. Cendrawasi SP II",
        status: "Siswa",
      },
      {
        nama: "VALERIA CANDYS JECONIA SUOTH",
        nisn: "0119674921",
        kelas: "VIII B",
        alamat: "KAKASKASEN",
        status: "Siswa",
      },
      {
        nama: "Vanesha Wihelmina Sunny Leung",
        nisn: "0102143795",
        kelas: "IX B",
        alamat: "Jl. Otista Sasak Tinggi",
        status: "Siswa",
      },
      {
        nama: "VERNON STEPHENSON WILLIAM LIOGU",
        nisn: "0118962431",
        kelas: "VIII B",
        alamat: "TOMPASO 2",
        status: "Siswa",
      },
      {
        nama: "VINCENCIUS HARDY SINGAL",
        nisn: "0108641990",
        kelas: "IX B",
        alamat: "PINABETENGAN",
        status: "Siswa",
      },
      {
        nama: "VIRGIANIE DYNIE WAKULU",
        nisn: "0128173177",
        kelas: "VIII B",
        alamat: "JAGA III",
        status: "Siswa",
      },
      {
        nama: "WILLIAM ALFARO SOPUTAN",
        nisn: "3111530151",
        kelas: "VII A",
        alamat: "JL. WANEA",
        status: "Siswa",
      },
      {
        nama: "YOSHUA LORENSO LENDONGAN",
        nisn: "3115648362",
        kelas: "VII B",
        alamat: "JL. Kawangkoan - Langowan",
        status: "Siswa",
      },
    ],
    siswaMutasiMasukData: [
      {
        nama: "Deni Firmansyah",
        nisn: "0054367291",
        kelas: "XI-A",
        alamat: "Jl. Mutasi No. 1",
        tanggalMasuk: new Date("2024-01-15"),
        nomorSurat: "MSK/2024/001",
        asalSekolah: "SMA Negeri 2",
        alasan: "Pindah domisili orangtua",
      },
    ],
    siswaMutasiKeluarData: [
      {
        nama: "Rina Wati",
        nisn: "0054367292",
        kelas: "XI-B",
        alamat: "Jl. Keluar No. 1",
        tanggalKeluar: new Date("2024-02-01"),
        nomorSurat: "KLR/2024/001",
        tujuanSekolah: "SMA Negeri 3",
        alasan: "Mengikuti orangtua pindah tugas",
      },
    ],
  };
  
  
  // Admin user dengan password yang sudah di-hash
  const adminUser = {
    nama: "Admin User",
    username: "PENGGUNA",
    email: "admin@example.com",
    password: 'password123', 
    phone: "08123456789",
    pengguna: "admin"
  };

  const siswaWithUsers = await Promise.all(baseData.siswaData.map(async (siswa) => {
    const username = `siswa${siswa.nisn}`;
    const hashedPassword = siswa.nisn.toString();
    
    return {
      user: {
        nama: siswa.nama,
        username,
        email: `${username}@smpadventtompaso.com`,
        password: hashedPassword,
        phone: "000000000000",
        pengguna: "user",
        image: "/noavatar.png"
      },
      siswa: {
        nama: siswa.nama,
        nisn: siswa.nisn,
        kelas: siswa.kelas,
        alamat: siswa.alamat,
        status: siswa.status,
        image: "/noavatar.png"
      }
    };
  }));

  // Validate semua data sebelum insert
  await validateData([adminUser], User);
  await validateData(siswaWithUsers.map(item => item.user), User);
  await validateData(siswaWithUsers.map(item => item.siswa), Siswa);
  await validateData(baseData.guruData, Guru);
  await validateData(baseData.siswaMutasiMasukData, SiswaMutasiMasuk);
  await validateData(baseData.siswaMutasiKeluarData, SiswaMutasiKeluar);


  return {
    adminUser,
    siswaWithUsers,
    guruData: baseData.guruData,
    siswaMutasiMasukData: baseData.siswaMutasiMasukData,
    siswaMutasiKeluarData: baseData.siswaMutasiKeluarData
  };
};


const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to database...');

    // Get sample data
    const sampleData = await generateSampleData();

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Guru.deleteMany({}),
      Siswa.deleteMany({}),
      SiswaMutasiMasuk.deleteMany({}),
      SiswaMutasiKeluar.deleteMany({}),
      Absen.deleteMany({})
    ]);

    console.log('Existing data cleared');

    // Create admin user first
    console.log('Creating admin user...');
    await User.create(sampleData.adminUser);

    // Create guru data
    console.log('Creating guru data...');
    await Guru.insertMany(sampleData.guruData);

    // Insert siswa and their corresponding users
    console.log('Creating siswa and their users...');
    for (const data of sampleData.siswaWithUsers) {
      // Create user first
      const user = await User.create(data.user);
      
      // Create siswa with reference to user
      const siswaData = {
        ...data.siswa,
        userId: user._id
      };
      await Siswa.create(siswaData);
    }

    // Insert mutasi data
    console.log('Creating mutasi data...');
    await Promise.all([
      SiswaMutasiMasuk.insertMany(sampleData.siswaMutasiMasukData),
      SiswaMutasiKeluar.insertMany(sampleData.siswaMutasiKeluarData)
    ]);

    // Get some siswa for absen data
    const someSiswa = await Siswa.find().limit(2);

    // Create absen data
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}/${currentYear + 1}`;

    console.log('Creating absen data...');
    const absenData = [
      {
        siswaId: someSiswa[0]._id,
        tanggal: new Date(),
        kelas: someSiswa[0].kelas,
        keterangan: 'HADIR',
        mataPelajaran: 'MATEMATIKA',
        semester: 1,
        tahunAjaran: academicYear
      },
      {
        siswaId: someSiswa[1]._id,
        tanggal: new Date(),
        kelas: someSiswa[1].kelas,
        keterangan: 'IZIN',
        mataPelajaran: 'BAHASA INDONESIA',
        semester: 1,
        tahunAjaran: academicYear
      }
    ];

    await validateData(absenData, Absen);
    await Absen.insertMany(absenData);

    // Log some sample credentials
    console.log('\nAdmin Credentials:');
    console.log('Username:', sampleData.adminUser.username);
    console.log('Password: password123'); // Show unhashed password for login

    console.log('\nSample Student Credentials:');
    sampleData.siswaWithUsers.slice(0, 3).forEach(item => {
      console.log(`
      Nama: ${item.user.nama}
      Username: ${item.user.username}
      Password: ${item.siswa.nisn}
      Email: ${item.user.email}
      `);
    });

    console.log('✅ Database seeded successfully!');
    console.log(`
    Seeded data summary:
    - Admin User: 1
    - Student Users: ${sampleData.siswaWithUsers.length}
    - Guru: ${sampleData.guruData.length}
    - Siswa: ${sampleData.siswaWithUsers.length}
    - Mutasi Masuk: ${sampleData.siswaMutasiMasukData.length}
    - Mutasi Keluar: ${sampleData.siswaMutasiKeluarData.length}
    - Absensi: ${absenData.length}
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
