# KGC ERP System

KGC ERP is a comprehensive, highly modular, and lightweight React-based Educational ERP (Enterprise Resource Planning) System. It is designed to manage the entire life-cycle of a modern educational institution.

![Nexus ERP](/absolute/path/to/screenshot/if/you/have/one.png) <!-- Update with an actual screenshot path if desired -->

## 🚀 Features & Modules

The system is broken down into 11 interconnected modules, dynamically loaded via React `lazy` to guarantee blazing-fast performance.

1. **Dashboard:** High-level metrics, enrollment trends, and recent institutional activities.
2. **Student Information System (SIS):** Split-view tracking of student profiles, verifications, and historical semester GPA tracking.
3. **Faculty & Staff:** Management of active instructors, roles, and leave statuses.
4. **Academics Setup:** Course creation, department alignment, and subject allocations.
5. **Timetable & Attendance:** Master class scheduling and automated student attendance tracking (with visual deficit warnings).
6. **Exams Management:** Scheduling descriptive/objective exams and tracking published results.
7. **Fees Collection:** Tracking paid and pending tuition/hostel revenues.
8. **Finance & Petty Cash:** Dedicated wallet for physical cash and categorized ledger for project expenses.
9. **Payroll & HRMS:** Tracking faculty allowances/deductions and approving staff leave requests.
10. **Library OPAC:** Online catalog with real-time circulation tracking (Issued, Available, Reserved).
11. **Hostel Management:** Real-time room occupancy and block allocations.
12. **Communication & Documents:** E-Notice boards, internal staff tasks, and digital certificate/ID repositories.

## 🛠️ Technology Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM (with Lazy Loading / Suspense)
- **Styling:** CSS Modules & Vanilla CSS Variables (Dark-mode ready structure)
- **Icons:** Lucide React

## 💻 Getting Started (Local Development)

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🌍 VPS Deployment (Ubuntu / Nginx)

This project includes a `deploy.sh` script and an `nginx.conf` template for easy deployment to an Ubuntu VPS.

1. **Clone the repo onto your VPS.**
2. **Make the script executable:** `chmod +x deploy.sh`
3. **Run the deployment script:** `sudo ./deploy.sh`

*(Ensure you have edited `nginx.conf` to match your actual domain name before running the script).*
