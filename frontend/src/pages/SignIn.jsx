import React, { useContext, useState } from 'react';
import bg from "../assets/authBg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios";

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const { serverUrl, refreshUser } = useContext(userDataContext);
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); 

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError(""); 
        setLoading(true);

        try {
            const response = await axios.post(`${serverUrl}/api/auth/signin`, 
                { email, password }, 
                { withCredentials: true }
            );
            
            if (response.data) {
                await refreshUser();
                navigate("/customize"); 
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || "An unexpected error occurred";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full h-screen bg-gray-900 bg-cover bg-center flex justify-center items-center p-4' style={{ backgroundImage: `url(${bg})` }}>
            <form onSubmit={handleSignIn} className='w-[95%] [@media(min-width:500px)]:w-[90%] h-auto min-h-[500px] [@media(min-width:500px)]:h-[580px] [@media(min-width:1024px)]:h-[600px] max-w-[450px] [@media(min-width:1280px)]:max-w-[500px] bg-[#00000062] backdrop-blur-md shadow-lg shadow-black flex flex-col items-center justify-center gap-[15px] [@media(min-width:500px)]:gap-[20px] px-[15px] [@media(min-width:500px)]:px-[25px] py-[30px] rounded-lg transition-all duration-300'>
                <h1 className='text-white text-2xl [@media(min-width:500px)]:text-[28px] [@media(min-width:1024px)]:text-[30px] font-semibold mb-[15px] [@media(min-width:500px)]:mb-[30px] text-center leading-tight'>
                    Sign In to <span className='text-blue-400'>Virtual Assistant</span>
                </h1>
                    
                <input 
                    type="email" 
                    placeholder='Email' 
                    className='w-full outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[15px] [@media(min-width:500px)]:px-[20px] py-[8px] [@media(min-width:500px)]:py-[10px] rounded-full text-base [@media(min-width:500px)]:text-[18px]' 
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email}
                />
                
                <div className='w-full h-[50px] [@media(min-width:500px)]:h-[60px] border-2 border-white bg-transparent text-white rounded-full text-base [@media(min-width:500px)]:text-[18px] relative'>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder='Password' 
                        className='w-full h-full bg-transparent outline-none px-[15px] [@media(min-width:500px)]:px-[20px] py-[8px] [@media(min-width:500px)]:py-[10px] rounded-full text-base [@media(min-width:500px)]:text-[18px] placeholder-gray-300' 
                        required 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password}
                    />
                    <div className='absolute top-1/2 -translate-y-1/2 right-[15px] [@media(min-width:500px)]:right-[20px] cursor-pointer flex items-center' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <IoEyeOff className='text-[20px] [@media(min-width:500px)]:text-[25px]' /> : <IoEye className='text-[20px] [@media(min-width:500px)]:text-[25px]' />}
                    </div>
                </div>

                {error && (
                    <p className='text-red-500 text-xs [@media(min-width:500px)]:text-sm bg-black/40 px-4 py-1 rounded-full [@media(min-width:500px)]:text-[17px] text-center max-w-full break-words'>
                        *{error}
                    </p>
                )}

                <button 
                    type="submit" 
                    className='min-w-[120px] [@media(min-width:500px)]:min-w-[150px] h-[50px] [@media(min-width:500px)]:h-[60px] mt-[15px] [@media(min-width:500px)]:mt-[30px] bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-semibold text-base [@media(min-width:500px)]:text-[19px] rounded-full transition-all cursor-pointer shadow-md' 
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Sign In"}
                </button>

                <p className='text-white text-sm [@media(min-width:500px)]:text-base [@media(min-width:1024px)]:text-[18px] cursor-pointer text-center mt-2' onClick={() => navigate("/signup")}>
                    Want to create a new account? <span className='text-blue-400 font-medium'>Sign Up</span>
                </p>
            </form>
        </div>
    );
}

export default SignIn;