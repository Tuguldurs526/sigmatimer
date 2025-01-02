# **SIGMA Timer**

SIGMA Timer is a productivity web application based on the Pomodoro Technique. It helps users manage their time effectively by dividing work sessions into intervals, separated by short and long breaks. Users can track their sessions, view their progress, and compete with others on a global leaderboard.

## **Features**

- **Pomodoro Timer**: A customizable timer for work and rest sessions.
- **User Progress Tracking**: Tracks Pomodoro sessions, focus time, and rest time for each user.
- **Global Leaderboard**: Displays a leaderboard where users can compare their progress with others.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Beautiful UI**: Includes animated waves and a user-friendly interface.

---

## **Technologies Used**

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Version Control**: Git and GitHub

---

## **How to Run the Project Locally**

### **Prerequisites**
1. **Node.js** installed on your system.
2. **MongoDB** (local or MongoDB Atlas for remote database).
3. **Git** installed for version control.

---

### **Steps to Run**

1. **Clone the Repository**
git clone https://github.com/Tuguldurs526/sigmatimer.git cd sigmatimer

2. **Install Dependencies**
npm install
cd backend  then npm install
cd frontend then npm install --global yarn

4. **Set Up the Environment**
Create a `.env` file in the root directory and add the following:
# Application Port
PORT=5000
# MongoDB URI (Local Database)
DB_URI=mongodb://127.0.0.1:27017/sigma-timer
USE_MEMORY_DB=true


4. **Run the Backend Server**
npm run server or npm start (in the backend directory)


5. **Run the Frontend Application**
Open a new terminal and run:
yarn install

6. **Access the Application**
Open your browser and navigate to:
http://localhost:3000

## **License**

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
