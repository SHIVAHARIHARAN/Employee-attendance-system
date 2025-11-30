const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, managerAuth } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const router = express.Router();

const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = checkOut - checkIn;
  return (diff / (1000 * 60 * 60)).toFixed(2);
};

const determineStatus = (checkInTime) => {
  if (!checkInTime) return 'absent';
  const checkInHour = new Date(checkInTime).getHours();
  if (checkInHour >= 9 && checkInHour < 10) return 'late';
  if (checkInHour >= 10) return 'half-day';
  return 'present';
};

router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const status = determineStatus(checkInTime);

    if (attendance) {
      attendance.checkInTime = checkInTime;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = new Attendance({
        userId: req.user._id,
        date: today,
        checkInTime,
        status
      });
      await attendance.save();
    }

    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/checkout', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.totalHours = calculateHours(attendance.checkInTime, attendance.checkOutTime);
    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }).populate('userId', 'name employeeId');

    res.json({ attendance: attendance || null });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-history', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId');

    res.json({ attendance });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + parseFloat(a.totalHours || 0), 0).toFixed(2)
    };

    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', managerAuth, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) query.userId = user._id;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/employee/:id', managerAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', managerAuth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + parseFloat(a.totalHours || 0), 0).toFixed(2)
    };

    res.json({ summary });
  } catch (error) {
    console.error('Get team summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/today-status', managerAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }).populate('userId', 'name email employeeId department');

    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployeeIds = attendance.map(a => a.userId._id.toString());
    const absentEmployees = allEmployees.filter(
      emp => !presentEmployeeIds.includes(emp._id.toString())
    );

    res.json({
      present: attendance.filter(a => a.status !== 'absent'),
      absent: absentEmployees,
      late: attendance.filter(a => a.status === 'late'),
      total: allEmployees.length
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/export', managerAuth, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) query.userId = user._id;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const csvData = attendance.map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      employeeId: record.userId.employeeId,
      name: record.userId.name,
      department: record.userId.department,
      checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A',
      checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
      status: record.status,
      totalHours: record.totalHours
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');

    const header = 'Date,Employee ID,Name,Department,Check In,Check Out,Status,Total Hours\n';
    const rows = csvData.map(row => 
      `"${row.date}","${row.employeeId}","${row.name}","${row.department}","${row.checkIn}","${row.checkOut}","${row.status}","${row.totalHours}"`
    ).join('\n');

    res.send(header + rows);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


