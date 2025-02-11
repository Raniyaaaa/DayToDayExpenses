import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { BiTrash, BiEditAlt, BiSearchAlt } from 'react-icons/bi';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Fuel');
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const token = localStorage.getItem("token");
    let navigate = useNavigate();

    const fetchExpenses =  useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/expenses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setExpenses(data.expenses);
            } else {
                alert(data.error || "Failed to fetch expenses!!!");
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        const method = editingExpense ? "PUT" : "POST";
        const url = editingExpense 
            ? `http://localhost:8000/expenses/${editingExpense}`
            : "http://localhost:8000/expenses";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount, description, category }),
            });
            const data = await response.json();
            
            if (response.ok) {
                alert(editingExpense ? "Expense Updated Successfully!" : "Expense Added Successfully!");
                if (editingExpense) {
                    setExpenses(expenses.map(exp => exp.id === editingExpense ? data.expense : exp));
                } else {
                    setExpenses([...expenses, data.expense]);
                }
                resetForm();
            } else {
                alert(data.error || "Failed to save expense");
            }
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            const response = await fetch(`http://localhost:8000/expenses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                alert("Expense Deleted Successfully!!");
                setExpenses(expenses.filter((expense) => expense.id !== id));
            } else {
                alert("Failed to delete expense!!");
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense.id);
        setAmount(expense.amount);
        setDescription(expense.description);
        setCategory(expense.category || 'Fuel');
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingExpense(null);
        setAmount('');
        setDescription('');
        setCategory('');
        setShowForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/');
    };

    return (
        <>
            <div className='nav'>
               <h2 className='dashboard-title'>EXPENSE TRACKER</h2>
               <div className="header-buttons">
                   <button className="search-button"><BiSearchAlt/></button>
                   <button className="options-button">⋮</button>
               </div>
               <button className='logout-button' onClick={handleLogout}>Logout</button>
           </div>
            <div className='dashboard-container'>
                <div className="expenses-list">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="expense-row">
                            <p className="expense-category">{expense.category}</p>
                            <p className="expense-amount">₹{expense.amount}</p>
                            <p className="expense-description">{expense.description}</p>
                            <button className="edit-button" onClick={() => handleEditExpense(expense)}><BiEditAlt/></button>
                            <button className="delete-button" onClick={() => handleDeleteExpense(expense.id)}><BiTrash /></button>
                        </div>
                    ))}
                </div>
                
                <button className="floating-button" onClick={() => setShowForm(true)}>+</button>
                
                {showForm && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3 className='form-title'>{editingExpense ? "Edit Expense" : "Add Expense"}</h3>
                            <form className='expense-form' onSubmit={handleSubmitExpense}>
                                <input
                                    type='number'
                                    placeholder='Amount'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className='form-input'
                                />
                                <input
                                    type='text'
                                    placeholder='Description'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className='form-input'
                                />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className='form-select'
                                >
                                    <option value="Fuel">Fuel</option>
                                    <option value="Food">Food</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Movie">Movie</option>
                                </select>
                                <button type='submit' className='form-button'>{editingExpense ? "Update Expense" : "Add Expense"}</button>
                            </form>
                            <button className="close-button" onClick={resetForm}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;
