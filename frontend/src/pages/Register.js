import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await registerUser(formData);
            toast.success('Registration successful! Verified on Algorand blockchain.');

            // Show blockchain TX hash
            if (response.txId) {
                toast.info(
                    <div>
                        Blockchain Verified! <br />
                        <a href={response.explorerUrl || `https://testnet.algoexplorer.io/tx/${response.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'underline', color: '#fff' }}>
                            View on AlgoExplorer
                        </a>
                    </div>
                    , { autoClose: 8000 });
            }

            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">SafeTourX</h1>
                    <p className="text-gray-400">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            'Register & Verify on Blockchain'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
