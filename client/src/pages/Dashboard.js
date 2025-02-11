import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount ] =useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState('');
    const token = localStorage.getItem("token");
    let navigate = useNavigate();
    
    const fetchExpenses = async () => {
        const response = await fetch('http://localhost:8000/expenses',
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const data = await response.json();
        if(response.ok){
            setExpenses(data.expenses);
        }else {
            alert(data.error || "Failed to fetch the expenses!!!");
        }
    }

    useEffect(() => {
        fetchExpenses();
    },[]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const response = await fetch(
            'http://localhost:8000/expenses',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount, description, category }),
            }
        )
        const  data = await response.json();
        if(response.ok){
            alert("Expense Added Successfully!!")
            setExpenses((prev) => [...prev, data.expense]);
            setAmount("");
            setDescription("");
            setCategory("Fuel");
        } else {
            alert(data.error || "Failed to add expense");
        }
    }

    const handleDeleteExpense = async (id) => {
        const token = localStorage.getItem("token");
        const response = await fetch(
            `http://localhost:8000/expenses/${id}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        if(response.ok){
            alert("Expense Deleted Successfully!!");
            setExpenses((prev) => prev.filter((expense) => expense.id !==id))
        }else {
            alert("Failed to delete expense!!")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/login')
    }
    return(
        <>
            <div className='nav'>
                <div>
                    <button className='logout-button' onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <div className='dashboard-container'>
                <h2 className='dashboard-title'>EXPENSE TRACKER</h2>
                <form className='expense-form' onSubmit={handleAddExpense}>
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
                        <option value='Fuel'>Fuel</option>
                        <option value='Food'>Food</option>
                        <option value='Electricity'>Electricity</option>
                        <option value='Movie'>Movie</option>
                    </select>
                    <button type='submit' className='foem-button'>Add Expense</button>
                </form>

                <div className="expenses-list">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="expense-row">
                            <p className="expense-category">{expense.category}</p>
                            <p className="expense-amount">₹{expense.amount}</p>
                            <p className="expense-description">{expense.description}</p>
                            <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
export default Dashboard;