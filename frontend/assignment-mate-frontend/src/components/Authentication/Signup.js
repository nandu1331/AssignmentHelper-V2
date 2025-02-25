import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios'; // Assuming you have axios configured
import { Link } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); 

        try {
            const response = await axios.post('/api/quiz/signup/', { 
                username, 
                email,
                password 
            });

            if (response.status === 201) {
                // Optionally, you can log the user in automatically here.
                // For now, let's redirect to the login page.
                navigate('/login'); 
            } else {
                setError('Something went wrong. Please try again later.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create account.");
        }
    };

    return (
        <div className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10 w-1/3">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Signup</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-white font-medium mb-2" htmlFor="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-4"> 
                    <label className="block text-white font-medium mb-2" htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-white font-medium mb-2" htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition duration-300">Signup</button>
            </form>
            <p className="text-center text-gray-300 mt-6">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Login </Link> here
            </p>
        </div>
    );
};

export default Signup;
