import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./Report.css"

function ComponentToPrint (props) {
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await fetch(
                    `http://localhost:8000/expenses`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const res = await response.json();
                setExpenses(res.expenses);
                setTotal(res.user.totalExpense);
            } catch (error) {
                console.error("Error downloading report:", error);
                alert("Failed to download report");
            }
        };

        fetchData();
    }, []);
    {
      return (
        <div ref={props.innerRef}>
            <h2 className="mid">Expense Report</h2>
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
      )
    }
  }
  
  function Report(){
    const contentRef = useRef(null);
    const handlePrint = useReactToPrint({ contentRef });
  
    return (
      <div>
        <ComponentToPrint innerRef={contentRef} />
        <button onClick={handlePrint} className="print-button">Download Report</button>
      </div>
    );
  }

 export default Report;