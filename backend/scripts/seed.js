const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-attendance', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    const manager = new User({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management'
    });
    await manager.save();
    console.log('Created manager:', manager.email);

    const employees = [
      {
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: 'employee123',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: 'employee123',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Carol Williams',
        email: 'carol@company.com',
        password: 'employee123',
        employeeId: 'EMP003',
        department: 'Marketing'
      },
      {
        name: 'David Brown',
        email: 'david@company.com',
        password: 'employee123',
        employeeId: 'EMP004',
        department: 'Sales'
      },
      {
        name: 'Eva Davis',
        email: 'eva@company.com',
        password: 'employee123',
        employeeId: 'EMP005',
        department: 'HR'
      }
    ];

    const createdEmployees = [];
    for (const emp of employees) {
      const employee = new User(emp);
      await employee.save();
      createdEmployees.push(employee);
      console.log('Created employee:', employee.email);
    }

    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

    
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const employee of createdEmployees) {
   
        if (Math.random() > 0.2) {
          const checkInHour = Math.floor(Math.random() * 3) + 8; 
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          let status = 'present';
          if (checkInHour >= 9) status = 'late';
          if (checkInHour >= 10) status = 'half-day';

          const checkOutHour = Math.floor(Math.random() * 3) + 17; 
          const checkOutMinute = Math.floor(Math.random() * 60);
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

          const totalHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);

          const attendance = new Attendance({
            userId: employee._id,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            status: status,
            totalHours: parseFloat(totalHours)
          });

          await attendance.save();
        }
      }
    }

    console.log('Created sample attendance data');
    console.log('\nSeed data created successfully!');
    console.log('\nManager Login:');
    console.log('Email: manager@company.com');
    console.log('Password: manager123');
    console.log('\nEmployee Login (any):');
    console.log('Email: alice@company.com (or any employee email)');
    console.log('Password: employee123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();


