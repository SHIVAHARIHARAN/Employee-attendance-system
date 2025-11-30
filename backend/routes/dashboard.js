const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, managerAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/employee', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const present = monthAttendance.filter(a => a.status === 'present').length;
    const absent = monthAttendance.filter(a => a.status === 'absent').length;
    const late = monthAttendance.filter(a => a.status === 'late').length;
    const totalHours = monthAttendance.reduce((sum, a) => sum + parseFloat(a.totalHours || 0), 0).toFixed(2);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(7);

    res.json({
      todayStatus: todayAttendance ? (todayAttendance.checkInTime ? 'Checked In' : 'Not Checked In') : 'Not Checked In',
      todayAttendance,
      monthStats: {
        present,
        absent,
        late,
        totalHours
      },
      recentAttendance
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/manager', managerAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEmployees = await User.countDocuments({ role: 'employee' });

    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }).populate('userId', 'name employeeId department');

    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployeeIds = todayAttendance.map(a => a.userId._id.toString());
    const absentEmployees = allEmployees.filter(
      emp => !presentEmployeeIds.includes(emp._id.toString())
    );

    const presentCount = todayAttendance.filter(a => a.status !== 'absent').length;
    const absentCount = absentEmployees.length;
    const lateArrivals = todayAttendance.filter(a => a.status === 'late');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo }
    }).populate('userId', 'department');

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttendance = weeklyAttendance.filter(a => {
        const attDate = new Date(a.date);
        attDate.setHours(0, 0, 0, 0);
        return attDate.getTime() === date.getTime();
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter(a => a.status === 'present' || a.status === 'late').length
      });
    }

    const departmentStats = {};
    weeklyAttendance.forEach(att => {
      const dept = att.userId.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, total: 0 };
      }
      departmentStats[dept].total++;
      if (att.status === 'present' || att.status === 'late') {
        departmentStats[dept].present++;
      }
    });

    const departmentWise = Object.keys(departmentStats).map(dept => ({
      department: dept,
      present: departmentStats[dept].present,
      total: departmentStats[dept].total,
      percentage: ((departmentStats[dept].present / departmentStats[dept].total) * 100).toFixed(1)
    }));

    res.json({
      totalEmployees,
      todayAttendance: {
        present: presentCount,
        absent: absentCount
      },
      lateArrivals: lateArrivals.map(a => ({
        name: a.userId.name,
        employeeId: a.userId.employeeId,
        department: a.userId.department,
        checkInTime: a.checkInTime
      })),
      weeklyTrend,
      departmentWise,
      absentEmployees: absentEmployees.map(emp => ({
        id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department
      }))
    });
  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


