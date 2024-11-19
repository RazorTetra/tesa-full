// backend/utils/resetAbsen.js
import cron from 'node-cron';
import Absen from '../models/absen.js';
import Attendance from '../models/attendance.js';

const updateAttendanceCounts = async (absen) => {
  try {
    const attendance = await Attendance.findOne({
      siswaId: absen.siswaId,
      tahunAjaran: absen.tahunAjaran,
      semester: absen.semester
    });

    if (!attendance) return;

    const updateField = `total${absen.keterangan}`;
    attendance[updateField] += 1;
    await attendance.save();
  } catch (error) {
    console.error('Error updating attendance:', error);
  }
};

export const resetDailyAbsen = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get yesterday's absen
    const yesterdayAbsen = await Absen.find({
      tanggal: {
        $gte: yesterday,
        $lt: today
      }
    });

    // Update attendance counts
    const updatePromises = yesterdayAbsen.map(absen => 
      updateAttendanceCounts(absen)
    );
    
    await Promise.all(updatePromises);

    console.log(`Reset absen complete. Processed ${yesterdayAbsen.length} records.`);
  } catch (error) {
    console.error('Reset absen error:', error);
  }
};

// Setup cron job untuk reset harian jam 00:00
cron.schedule('0 0 * * *', resetDailyAbsen);

// Setup cron job untuk retry jika gagal (jam 00:05)
cron.schedule('5 0 * * *', async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if any attendance hasn't been updated
  const uncountedAbsen = await Absen.find({
    tanggal: {
      $lt: today
    },
    counted: { $ne: true }
  });

  if (uncountedAbsen.length > 0) {
    console.log(`Found ${uncountedAbsen.length} uncounted absen. Retrying...`);
    await resetDailyAbsen();
  }
});

export default resetDailyAbsen;