import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";
import { BiTrash, BiEditAlt } from "react-icons/bi";
import "./Dashboard.css";

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Fuel");
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        return parseInt(localStorage.getItem("NoOfItems"), 10) || 5;
    });
    const [totalPages, setTotalPages] = useState(1);
    const [isPremium, setIsPremium] = useState(() => localStorage.getItem("isPremium") === "true");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // Fetch expenses
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:8000/expenses`, {
                params: { page: currentPage, limit: itemsPerPage },
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses(data.expenses);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, itemsPerPage]);
    

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses, itemsPerPage, currentPage, expenses.length]);     

    // Check user premium status
    useEffect(() => {
        const checkUserPremiumStatus = async () => {
            try {
                const response = await axios.get("http://localhost:8000/user/details", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("User Details API Response:", response.data);
                
                // Only update if isPremium is true
                console.log("Returned Premium state:", response.data.user.isPremium)
                if (response.data.user.isPremium) {
                    setIsPremium(true);
                    localStorage.setItem("isPremium", "true");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        checkUserPremiumStatus();
    }, [token, isPremium]);
    

    // Handle form submission (Add/Edit Expense)
    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        const isEditing = Boolean(editingExpense);
        const url = isEditing 
            ? `http://localhost:8000/expenses/${editingExpense}` 
            : "http://localhost:8000/expenses";
    
        try {
                await axios[isEditing ? "put" : "post"](url, 
                { amount, description, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            resetForm();
            fetchExpenses();
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };
    
    // Handle delete expense
    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await axios.delete(`http://localhost:8000/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses((prev) => prev.filter((expense) => expense.id !== id));
            if (expenses.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchExpenses(); // Refresh expenses after deletion
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    // Reset form
    const resetForm = () => {
        setAmount("");
        setDescription("");
        setCategory("Fuel");
        setShowForm(false);
        setEditingExpense(null);
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("isPremium");
        localStorage.removeItem("NoOfItems")
        navigate("/");
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
      };
    
      const handleItemsPerPageChange = (e) => {
        const selectedItemsPerPage = parseInt(e.target.value, 10);
        setItemsPerPage(selectedItemsPerPage);
        localStorage.setItem("NoOfItems", selectedItemsPerPage); // Save preference
        setCurrentPage(1); 
      };

    const handleReport = async () => {
        navigate("/report")
     };

    // Handle premium payment
    const handlePayment = async () => {
        setLoading(true);
        try {
            const cf = await load({ mode: "sandbox" });
    
            const response = await fetch("http://localhost:8000/payment/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: 1999.0, currency: "INR" }),
            });
    
            const data = await response.json();
            console.log("Create response data:", data);
    
            if (data.paymentSessionId) {
                cf.checkout({
                    paymentSessionId: data.paymentSessionId,
                    redirectTarget: "_modal",
                });
    
                // Poll the payment status
                setTimeout(() => pollPaymentStatus(data.orderId), 5000);
            } else {
                console.error("Failed to create order");
            }
        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Polling function with Exponential Backoff
    const pollPaymentStatus = async (orderId, attempt = 1) => {
        const maxAttempts = 10; // Increase the number of retry attempts
        const delay = Math.min(3000 * attempt, 15000); // Increase frequency but cap at 15 sec
    
        try {
            const response = await fetch("http://localhost:8000/payment/verify", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ order_id: orderId }),
            });
    
            const data = await response.json();
            console.log("Verify Data:", data);
    
            if (data.latestStatus === "PAID") {
                setIsPremium(true);
                localStorage.setItem("isPremium", "true");
                alert("Payment Successful! You are now a premium user.");
                return;
            }
    
            if (data.latestStatus === "FAILED") {
                alert("Payment Failed. Please try again.");
                return;
            }
    
            if (attempt < maxAttempts) {
                setTimeout(() => pollPaymentStatus(orderId, attempt + 1), delay);
            } else {
                alert("Payment status unknown. Please check your payment history.");
            }
        } catch (error) {
            console.error("Error fetching payment status:", error);
            if (attempt < maxAttempts) {
                setTimeout(() => pollPaymentStatus(orderId, attempt + 1), delay);
            }
        }
    };
    

    return (
        <>
            <div className="nav">
                <h2 className="dashboard-title">EXPENSE TRACKER</h2>
                {isPremium ? (
                    <>
                    <h3 className="premium-heading">🎉 You are a Premium User!</h3>
                    <div className="premium-features">
                    <button className="premium-button" onClick={() => navigate("/leaderboard")}>View Leaderboard</button>
                    <br />
                    <button className="premium-button" onClick={handleReport}>
                        Get Report
                    </button>
                    </div>
                    </>   
                ) : (
                    <button className="premium-button" onClick={handlePayment} disabled={loading}>
                        {loading ? "Processing..." : "Go Premium"}
                    </button>
                )}
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            {expenses.length===0?<h2 className="expense-heading">No Expenses Found !!</h2> : (
            <div className="expense-container">
                <div className="expenses-list">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="expense-row">
                            <p className="expense-category">{expense.category}</p>
                            <p className="expense-amount">₹{expense.amount}</p>
                            <p className="expense-description">{expense.description}</p>
                            <button
                                className="edit-button"
                                onClick={() => {
                                    setEditingExpense(expense.id);
                                    setAmount(expense.amount);
                                    setDescription(expense.description);
                                    setCategory(expense.category);
                                    setShowForm(true);
                                }}
                            >
                                <BiEditAlt />
                            </button>
                            <button className="delete-button" onClick={() => handleDeleteExpense(expense.id)}>
                                <BiTrash />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="pagination-container">
                    <div className="items-per-page">
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <div className="pagination-buttons">
                        {(() => {
                            const buttons = [];
                            for (let i = 1; i <= totalPages; i++) {
                            buttons.push(
                            <button
                                key={i}
                                className={`page-button ${currentPage === i ? "active" : ""}`}
                                onClick={() => handlePageChange(i)}
                            >
                            {i}
                            </button>)
                            }
                            return buttons;
                        })()}
                    </div>
                </div>
            </div>
            )}
            <button className="floating-button" onClick={() => setShowForm(true)}>+</button>
                {showForm && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3 className="form-title">{editingExpense ? "Edit Expense" : "Add Expense"}</h3>
                            <form className="expense-form" onSubmit={handleSubmitExpense}>
                                <input className="form-input" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                <input className="form-input" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="Fuel">Fuel</option>
                                    <option value="Food">Food</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Movie">Movie</option>
                                </select>
                                <button className="form-button" type="submit">{editingExpense ? "Update Expense" : "Add Expense"}</button>
                            </form>
                            <button className="close-button" onClick={() => resetForm()}>Close</button>
                        </div>
                    </div>
                )}
        </>
    );
};

export default Dashboard;
