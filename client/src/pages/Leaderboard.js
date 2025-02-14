import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Leaderboard.css";
import { BiTrophy } from "react-icons/bi";

const LeaderBoard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://localhost:8000/premium/leaderboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(response);
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };
        fetchLeaderboard();
    }, [token]);

    return (
        <div className="modal">
            <div className="modal-content">
                <h3 className="form-title"><BiTrophy/> Expense Leaderboard</h3>
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Total Expense</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user, index) => (
                            <tr key={user.id} className={`rank-${index + 1}`}>
                                <td>{index + 1}</td>
                                <td>{user.username}</td>
                                <td>₹{user.totalExpense || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="close-button" onClick={() => navigate("/dashboard")}>Close</button>
            </div>
        </div>
    );
};

export default LeaderBoard;
