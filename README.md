# School-Based Management System

A comprehensive school management platform built with Next.js 15, Clerk Authentication, and Prisma ORM. The system provides role-based access for administrators, teachers, students, and parents with features to manage all aspects of a school's operations.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [User Roles and Functionality](#user-roles-and-functionality)
  - [Administrator Guide](#administrator-guide)
  - [Teacher Guide](#teacher-guide)
  - [Student Guide](#student-guide)
  - [Parent Guide](#parent-guide)
- [Authentication](#authentication)
- [Common Issues](#common-issues)

## Features

- **User Management**: Create and manage accounts for teachers, students, and parents
- **Class Management**: Create classes and assign teachers and students
- **Subjects Management**: Create subjects and assign teachers
- **Exam & Assignment Management**: Create and grade exams and assignments
- **Attendance Tracking**: Record and view student attendance
- **Results Management**: Record and view examination results
- **Events Calendar**: Schedule and announce school events
- **Announcement System**: Create and view school-wide announcements
- **Messaging System**: Communicate between different user roles

## Technology Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Authentication**: Clerk Authentication (v5.7.5)
- **Database ORM**: Prisma (v6.6.0)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel/Netlify compatible

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

1. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the necessary environment variables (see `.env.example` for required variables)

1. Run database migrations:

```bash
npx prisma migrate dev
```

1. Start the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) with your browser to access the application

## User Roles and Functionality

### Administrator Guide

As an administrator, you have full access to all features of the system.

#### Admin Login & Navigation

1. **Login**: Sign in using your administrator credentials at the login page
2. **Dashboard**: Access your dashboard that shows school-wide statistics and recent activities
3. **Navigation**: Use the menu on the left side to access different modules

#### Key Administrative Features

1. **User Management**
   - Create teacher accounts by navigating to Teachers > + button
   - Create student accounts by navigating to Students > + button
   - Create parent accounts by navigating to Parents > + button
   - Edit or view user details by clicking the view icon on any user

2. **Class Management**
   - Create new classes by navigating to Classes > + button
   - Assign teachers as supervisors to classes
   - Add students to classes
   - View class details including assigned subjects

3. **Subject Management**
   - Create new subjects by navigating to Subjects > + button
   - Assign teachers to subjects
   - View subject details and related classes

4. **Exam Management**
   - Create new exams by navigating to Exams > + button
   - Set exam schedules and requirements
   - View exam results after grading

5. **Announcements**
   - Create school-wide announcements
   - View all announcements history

6. **Events Calendar**
   - Create and manage school events
   - Send event notifications to relevant stakeholders

7. **System Settings**
   - Access system configuration through the Settings page
   - Manage global parameters and permissions

### Teacher Guide

As a teacher, you can manage your classes, students, exams, and communicate with parents and students.

#### Teacher Login & Navigation

1. **Login**: Sign in using your teacher credentials at the login page
2. **Dashboard**: Access your dashboard showing your classes, upcoming exams, and schedules

#### Key Teacher Features

1. **Class Management**
   - View classes you supervise or teach subjects in
   - Take attendance for your classes
   - Add class notes and materials

2. **Student Management**
   - View details of students in your classes
   - Monitor student performance across subjects
   - Contact students directly through the messaging system

3. **Exam & Assignment Management**
   - Create exams and assignments for your subjects
   - Grade student submissions
   - Publish results

4. **Parent Communication**
   - View parent contact information
   - Send messages to parents regarding student performance

5. **Announcements & Events**
   - Create announcements for your classes
   - View school-wide announcements
   - Participate in scheduled events

### Student Guide

As a student, you can view your classes, assignments, exams, and results.

#### Student Login & Navigation

1. **Login**: Sign in using your student credentials at the login page
2. **Dashboard**: Access your dashboard showing your classes, upcoming assignments, and recent results

#### Key Student Features

1. **Class & Subject Access**
   - View details of your assigned classes and subjects
   - Access classroom materials and resources

2. **Assignment Management**
   - View assigned homework and projects
   - Submit completed assignments
   - Check feedback and grades

3. **Exam Information**
   - View upcoming exams and schedules
   - Check exam requirements and study materials
   - Access exam results when published

4. **Performance Tracking**
   - Monitor your academic performance across subjects
   - View attendance records

5. **Communication**
   - Send messages to teachers for academic support
   - Access announcements from teachers and administration

### Parent Guide

As a parent, you can monitor your children's academic progress and communicate with teachers.

#### Parent Login & Navigation

1. **Login**: Sign in using your parent credentials at the login page
2. **Dashboard**: Access your dashboard showing your children's academic overview

#### Key Parent Features

1. **Student Performance Monitoring**
   - View your children's academic performance across subjects
   - Monitor attendance records
   - Track assignment completion and grades

2. **Exam & Result Access**
   - View upcoming exam schedules
   - Access published exam results

3. **Teacher Communication**
   - Send messages to your children's teachers
   - Schedule parent-teacher meetings

4. **Announcement & Event Access**
   - View school-wide announcements
   - Keep track of upcoming school events

## Authentication

The system uses Clerk Authentication for secure user management. When accessing the system for the first time:

1. You'll receive credentials from the system administrator
2. Use these credentials to log in at the sign-in page
3. You may be prompted to complete your profile on first login
4. For security reasons, the system enforces a single-session policy, meaning you can only be logged into one account at a time

## Common Issues

### Login Problems

- **Single Session Error**: If you see the message "You're currently in single session mode. You can only be signed into one account at a time," you need to sign out of any existing session before signing in with a different account
- **Access Denied**: If you can't access certain features, it may be due to role-based restrictions

### Data Management

- **Creating Teachers**: When creating teacher accounts, all required fields must be completed including username, name, surname, and blood type
- **Class Creation**: Classes require valid information; supervisor field is optional
- **Form Submissions**: If form submissions fail, check for validation errors highlighted in red

