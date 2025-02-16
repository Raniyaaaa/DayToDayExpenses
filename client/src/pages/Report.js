import React, { useEffect, useState } from "react";
import "./Report.css";

function Report() {
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/premium/download-report`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const res = await response.json();
                setExpenses(res.expenses || []);
                setTotal(res.user?.totalExpense || 0);
            } catch (error) {
                console.error("Error downloading report:", error);
                alert("Failed to download report");
            }
        };

        fetchData();
    }, []);

    
    const handlePrint = () => {
        const printContents = document.getElementById("print-section").innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents; 

        window.location.reload(); 
    };

    return (
        <div>
            <div id="print-section" className="report-wrapper">
                {expenses.length === 0 ? (
                    <h2 className="no-data">No Expenses Found</h2>
                ) : (
                    <div className="report-box">
                        <h2 className="report-title">Expense Report</h2>
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
                        <h2 className="report-total">Total Expense: ₹{total}</h2>
                    </div>
                )}
            </div>

            <button onClick={handlePrint} className="print-button">
                Download Report
            </button>
        </div>
    );
}

export default Report;
