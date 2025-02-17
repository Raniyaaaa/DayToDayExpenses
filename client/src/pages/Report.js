import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Report.css";
import { BiDownload } from "react-icons/bi";

function Report() {
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        fetchData();
        fetchReports();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/premium/Expense-report`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const res = await response.json();
            setExpenses(res.expenses);
            setTotal(res.user.totalExpense);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            alert("Failed to fetch expenses");
        }
    };

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/premium/user-reports`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                setReports(response.data.reports);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    const download = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/premium/download-report`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                const a = document.createElement("a");
                a.href = response.data.fileURL;
                a.download = "myexpense.csv";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                fetchReports();
            }
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download report");
        }
    };

    return (
        <div className="report-wrapper">
            <h2 className="report-title">Expense Report</h2>
            <div className="report-table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense, index) => (
                            <tr key={index}>
                                <td>₹{expense.amount}</td>
                                <td>{expense.category}</td>
                                <td>{expense.description}</td>
                                <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <h2 className="report-total">Total Expense: ₹{total}</h2>
            <button onClick={download} className="print-button"><BiDownload/></button>

            <div className="report-history">
                <h2 className="report-title">Previous Reports</h2>
                {reports.length === 0 ? (
                    <p>No reports available.</p>
                ) : (
                    <ul>
                        {reports.map((report) => (
                            <li key={report.id}>
                                <a href={report.fileURL} target="_blank">
                                    {new Date(report.createdAt).toLocaleString()}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}


export default Report;
