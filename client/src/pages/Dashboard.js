import React, { useEffect, useState, useCallback } from 'react';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { load } from "@cashfreepayments/cashfree-js";
import { BiTrash, BiEditAlt } from 'react-icons/bi';
import './Dashboard.css';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Fuel');
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const fetchExpenses = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/expenses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    
    useEffect(() => {
        console.log("Token:", token)
        const checkUserPremiumStatus = async () => {
            try {
                const response = await axios.get("http://localhost:8000/user/details", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Response data:",response.data)
                setIsPremium(response.data.isPremium);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        checkUserPremiumStatus();
    }, [token]);

    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        const method = editingExpense ? "put" : "post";
        const url = editingExpense 
            ? `http://localhost:8000/expenses/${editingExpense}`
            : "http://localhost:8000/expenses";
        try {
            const response = await axios[method](url, { amount, description, category }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses((prev) =>
                editingExpense ? prev.map(exp => exp.id === editingExpense ? response.data.expense : exp) : [...prev, response.data.expense]
            );
            resetForm();
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await axios.delete(`http://localhost:8000/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses(prev => prev.filter(expense => expense.id !== id));
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const resetForm = () => {
        setAmount('');
        setDescription('');
        setCategory('Fuel'); 
        setShowForm(false); 
        setEditingExpense(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/');
    };

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
                body: JSON.stringify({ amount: 1999.00, currency: "INR" }),
            });

            const data = await response.json();
            console.log("Create response data:", data)
            if (data.paymentSessionId) {
                cf.checkout({
                    paymentSessionId: data.paymentSessionId,
                    redirectTarget: "_modal",
                });

                // ✅ Wait for payment result
                setTimeout(() => verifyPayment(data.orderId, data.paymentSessionId), 5000);
            } else {
                console.error("Failed to create order");
            }
        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (order_id , paymentSessionId) => {
        try {
            const response = await fetch("http://localhost:8000/payment/verify", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ order_id, paymentSessionId, status: "SUCCESS" }), // Assume success
            });

            const data = await response.json();

            console.log("Verify Data:", data);
            if (data.message) {
                setIsPremium(true);
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
        }
    };
    

    return (
        <>
            <div className='nav'>
                <h2 className='dashboard-title'>EXPENSE TRACKER</h2>
                {isPremium ? (
                    <h3>🎉 You are a Premium User!</h3>
                    ) : (
                    <button onClick={handlePayment} disabled={loading}>
                        {loading ? "Processing..." : "Go Premium"}
                    </button>
                )}
                <button className='logout-button' onClick={handleLogout}>Logout</button>
            </div>
            <div className='dashboard-container'>
                <div className='expenses-list'>
                    {expenses.map((expense) => (
                        <div key={expense.id} className='expense-row'>
                            <p className='expense-category'>{expense.category}</p>
                            <p className='expense-amount'>₹{expense.amount}</p>
                            <p className='expense-description'>{expense.description}</p>
                            <button className='edit-button' onClick={() => {
                                setEditingExpense(expense.id);
                                setAmount(expense.amount);
                                setDescription(expense.description);
                                setCategory(expense.category);
                                setShowForm(true);
                            }}>
                                <BiEditAlt />
                            </button>
                            <button className='delete-button' onClick={() => handleDeleteExpense(expense.id)}><BiTrash /></button>
                        </div>
                    ))}
                </div>
                <button className='floating-button' onClick={() => setShowForm(true)}>+</button>
                {showForm && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <h3 className='form-title'>{editingExpense ? "Edit Expense" : "Add Expense"}</h3>
                            <form className='expense-form' onSubmit={handleSubmitExpense}>
                                <input className="form-input" type='number' placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                <input className="form-input" type='text' placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} required />
                                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value='Fuel'>Fuel</option>
                                    <option value='Food'>Food</option>
                                    <option value='Electricity'>Electricity</option>
                                    <option value='Movie'>Movie</option>
                                </select>
                                <button className="form-button" type='submit'>{editingExpense ? "Update Expense" : "Add Expense"}</button>
                            </form>
                            <button className='close-button' onClick={() => resetForm()}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;
