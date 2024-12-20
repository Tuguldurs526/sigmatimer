import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [progress, setProgress] = useState([]);

    useEffect(() => {
        const fetchProgress = async () => {
            const response = await fetch('/api/progress', {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            const data = await response.json();
            setProgress(data);
        };

        fetchProgress();
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            <ul>
                {progress.map((entry) => (
                    <li key={entry._id}>
                        Date: {new Date(entry.date).toLocaleDateString()}, Sessions: {entry.pomodoroSessions}, Work Minutes: {entry.workMinutes}, Rest Minutes: {entry.restMinutes}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
