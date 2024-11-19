# API Documentation

## Absensi API

### 1. Get All Absensi
```
GET /api/absen
```

Query Parameters:
- `today` (boolean): Filter absensi hari ini
- `kelas` (string): Filter berdasarkan kelas
- `tanggal` (date): Filter berdasarkan tanggal spesifik
- `tahunAjaran` (string): Filter berdasarkan tahun ajaran
- `semester` (number): Filter berdasarkan semester

Success Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "123abc",
      "siswaId": {
        "_id": "456def",
        "nama": "John Doe",
        "nisn": "1234567890",
        "kelas": "7A"
      },
      "tanggal": "2024-03-19T00:00:00.000Z",
      "keterangan": "HADIR",
      "mataPelajaran": "MATEMATIKA",
      "semester": 1,
      "tahunAjaran": "2023/2024"
    }
  ]
}
```

### 2. Create Absensi
```
POST /api/absen
```

Request Body:
```json
{
  "siswaId": "456def",
  "tanggal": "2024-03-19",
  "kelas": "7A",
  "keterangan": "HADIR",
  "mataPelajaran": "MATEMATIKA",
  "semester": 1,
  "tahunAjaran": "2023/2024"
}
```

Success Response:
```json
{
  "success": true,
  "data": {
    "_id": "123abc",
    "siswaId": {
      "_id": "456def",
      "nama": "John Doe",
      "nisn": "1234567890",
      "kelas": "7A"
    },
    "tanggal": "2024-03-19T00:00:00.000Z",
    "keterangan": "HADIR",
    "mataPelajaran": "MATEMATIKA",
    "semester": 1,
    "tahunAjaran": "2023/2024"
  }
}
```

## Tahun Ajaran API

### 1. Get All Tahun Ajaran
```
GET /api/tahun-ajaran
```

Success Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "789ghi",
      "tahunAjaran": "2023/2024",
      "semester": 1,
      "isActive": true,
      "tanggalMulai": "2023-07-17T00:00:00.000Z",
      "tanggalSelesai": "2023-12-20T00:00:00.000Z",
      "totalHariEfektif": 120
    }
  ]
}
```

### 2. Create Tahun Ajaran
```
POST /api/tahun-ajaran
```

Request Body:
```json
{
  "tahunAjaran": "2023/2024",
  "semester": 1,
  "isActive": true,
  "tanggalMulai": "2023-07-17",
  "tanggalSelesai": "2023-12-20",
  "totalHariEfektif": 120
}
```

Success Response:
```json
{
  "success": true,
  "data": {
    "_id": "789ghi",
    "tahunAjaran": "2023/2024",
    "semester": 1,
    "isActive": true,
    "tanggalMulai": "2023-07-17T00:00:00.000Z",
    "tanggalSelesai": "2023-12-20T00:00:00.000Z",
    "totalHariEfektif": 120
  }
}
```

### 3. Get Active Tahun Ajaran
```
GET /api/tahun-ajaran/active
```

Success Response:
```json
{
  "success": true,
  "data": {
    "_id": "789ghi",
    "tahunAjaran": "2023/2024",
    "semester": 1,
    "isActive": true,
    "tanggalMulai": "2023-07-17T00:00:00.000Z",
    "tanggalSelesai": "2023-12-20T00:00:00.000Z",
    "totalHariEfektif": 120
  }
}
```

### 4. Activate Tahun Ajaran
```
PUT /api/tahun-ajaran/{id}
```

Request Body:
```json
{
  "isActive": true
}
```

Success Response:
```json
{
  "success": true,
  "data": {
    "_id": "789ghi",
    "tahunAjaran": "2023/2024",
    "semester": 1,
    "isActive": true,
    "tanggalMulai": "2023-07-17T00:00:00.000Z",
    "tanggalSelesai": "2023-12-20T00:00:00.000Z",
    "totalHariEfektif": 120
  },
  "message": "Berhasil mengaktifkan tahun ajaran dan membuat data kehadiran baru untuk 30 siswa"
}
```

### 5. Delete Tahun Ajaran
```
DELETE /api/tahun-ajaran/{id}
```

Success Response:
```json
{
  "success": true,
  "message": "Tahun ajaran berhasil diarsipkan dan dihapus"
}
```

## Attendance API

### 1. Get All Attendance
```
GET /api/attendance
```

Query Parameters:
- `semester` (number): Filter berdasarkan semester
- `tahunAjaran` (string): Filter berdasarkan tahun ajaran
- `kelas` (string): Filter berdasarkan kelas
- `siswaId` (string): Filter berdasarkan ID siswa

Success Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "abc123",
      "siswaId": {
        "_id": "456def",
        "nama": "John Doe",
        "nisn": "1234567890",
        "kelas": "7A"
      },
      "semester": 1,
      "tahunAjaran": "2023/2024",
      "totalHadir": 100,
      "totalSakit": 5,
      "totalIzin": 3,
      "totalAlpa": 2,
      "persentaseKehadiran": 90.91
    }
  ]
}
```

### 2. Create/Update Attendance
```
POST /api/attendance
```

Request Body:
```json
{
  "siswaId": "456def",
  "semester": 1,
  "tahunAjaran": "2023/2024",
  "totalHadir": 100,
  "totalSakit": 5,
  "totalIzin": 3,
  "totalAlpa": 2
}
```

Success Response:
```json
{
  "success": true,
  "data": {
    "_id": "abc123",
    "siswaId": {
      "_id": "456def",
      "nama": "John Doe",
      "nisn": "1234567890",
      "kelas": "7A"
    },
    "semester": 1,
    "tahunAjaran": "2023/2024",
    "totalHadir": 100,
    "totalSakit": 5,
    "totalIzin": 3,
    "totalAlpa": 2,
    "persentaseKehadiran": 90.91
  }
}
```

### 3. Get Student Attendance
```
GET /api/attendance/siswa/{id}
```

Query Parameters:
- `semester` (number): Semester yang diinginkan
- `tahunAjaran` (string): Tahun ajaran yang diinginkan

Success Response:
```json
{
  "success": true,
  "data": {
    "attendance": {
      "_id": "abc123",
      "siswaId": {
        "_id": "456def",
        "nama": "John Doe",
        "nisn": "1234567890",
        "kelas": "7A"
      },
      "semester": 1,
      "tahunAjaran": "2023/2024",
      "totalHadir": 100,
      "totalSakit": 5,
      "totalIzin": 3,
      "totalAlpa": 2,
      "persentaseKehadiran": 90.91
    },
    "riwayatAbsensi": [
      {
        "_id": "def456",
        "tanggal": "2024-03-19T00:00:00.000Z",
        "keterangan": "HADIR",
        "mataPelajaran": "MATEMATIKA"
      }
    ]
  }
}
```

### 4. Get Attendance Report
```
GET /api/attendance/rekap
```

Query Parameters:
- `semester` (number): Filter berdasarkan semester
- `tahunAjaran` (string): Filter berdasarkan tahun ajaran
- `kelas` (string): Filter berdasarkan kelas (opsional)

Success Response:
```json
{
  "success": true,
  "data": {
    "periode": {
      "semester": 1,
      "tahunAjaran": "2023/2024"
    },
    "rekapKehadiran": [
      {
        "siswa": {
          "id": "456def",
          "nama": "John Doe",
          "nisn": "1234567890",
          "kelas": "7A"
        },
        "kehadiran": {
          "hadir": 100,
          "sakit": 5,
          "izin": 3,
          "alpa": 2,
          "totalHariEfektif": 110,
          "persentase": "90.91"
        },
        "riwayatAbsensi": [
          {
            "tanggal": "2024-03-19T00:00:00.000Z",
            "keterangan": "HADIR",
            "mataPelajaran": "MATEMATIKA"
          }
        ]
      }
    ],
    "statistikKelas": {
      "7A": {
        "totalSiswa": 30,
        "rataRataKehadiran": "92.50",
        "totalHariEfektif": 110,
        "detailKehadiran": {
          "hadir": 2800,
          "sakit": 150,
          "izin": 90,
          "alpa": 60
        }
      }
    }
  }
}
```

Notes:
- Semua endpoints yang membutuhkan autentikasi mengharuskan token JWT valid dikirimkan di header
- Status codes: 200 (Success), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Format tanggal menggunakan ISO 8601 (YYYY-MM-DD)
- Semua response sukses memiliki properti `success: true`
- Semua response error memiliki properti `success: false` dan `error` message