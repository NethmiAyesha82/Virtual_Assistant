import React, { useContext, useState } from 'react';
import bg from "../assets/authBg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const { serverUrl, setUserData, refreshUser } = useContext(userDataContext);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${serverUrl}/api/auth/signup`,
                { name, email, password }
            );

            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                if (refreshUser) {
                    await refreshUser();
                } else if (setUserData) {
                    setUserData(response.data.user || response.data);
                }
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
            <form onSubmit={handleSignUp} className='w-[95%] [@media(min-width:500px)]:w-[90%] h-auto min-h-[500px] [@media(min-width:500px)]:h-[580px] [@media(min-width:1024px)]:h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur-md shadow-lg shadow-black flex flex-col items-center justify-center gap-[15px] [@media(min-width:500px)]:gap-[20px] px-[15px] [@media(min-width:500px)]:px-[25px] py-[30px] [@media(min-width:500px)]:py-[20px] rounded-lg transition-all duration-300'>
                <h1 className='text-white text-[22px] [@media(min-width:500px)]:text-[26px] [@media(min-width:1024px)]:text-[30px] font-semibold mb-[15px] [@media(min-width:500px)]:mb-[30px] text-center leading-tight'>
                    Register to <span className='text-blue-400'>Virtual Assistant</span>
                </h1>

                <input
                    type="text"
                    placeholder='Enter Your Name'
                    className='w-full outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[8px] [@media(min-width:500px)]:py-[10px] rounded-full text-[15px] [@media(min-width:500px)]:text-[17px] [@media(min-width:1024px)]:text-[18px]'
                    required
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                />

                <input
                    type="email"
                    placeholder='Email'
                    className='w-full outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[8px] [@media(min-width:500px)]:py-[10px] rounded-full text-[15px] [@media(min-width:500px)]:text-[17px] [@media(min-width:1024px)]:text-[18px]'
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />

                <div className='w-full h-[45px] [@media(min-width:500px)]:h-[55px] [@media(min-width:1024px)]:h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[15px] [@media(min-width:500px)]:text-[17px] [@media(min-width:1024px)]:text-[18px] relative'>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder='Password'
                        className='w-full h-full bg-transparent outline-none px-[20px] py-[8px] [@media(min-width:500px)]:py-[10px] rounded-full text-[15px] [@media(min-width:500px)]:text-[17px] [@media(min-width:1024px)]:text-[18px] placeholder-gray-300'
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                    <div className='absolute top-1/2 -translate-y-1/2 right-[20px] cursor-pointer text-white/80 hover:text-white' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <IoEyeOff className='text-[20px] [@media(min-width:500px)]:text-[23px] [@media(min-width:1024px)]:text-[25px]' /> : <IoEye className='text-[20px] [@media(min-width:500px)]:text-[23px] [@media(min-width:1024px)]:text-[25px]' />}
                    </div>
                </div>

                {error && (
                    <p className='text-red-500 text-xs [@media(min-width:500px)]:text-sm bg-black/40 px-4 py-1 rounded-full text-center max-w-full break-words'>
                        *{error}
                    </p>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className='min-w-[120px] [@media(min-width:500px)]:min-w-[140px] [@media(min-width:1024px)]:min-w-[150px] h-[45px] [@media(min-width:500px)]:h-[55px] [@media(min-width:1024px)]:h-[60px] mt-[15px] [@media(min-width:500px)]:mt-[30px] bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-semibold text-[15px] [@media(min-width:500px)]:text-[17px] [@media(min-width:1024px)]:text-[19px] rounded-full transition-all shadow-md'
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className='text-white text-[14px] [@media(min-width:500px)]:text-[16px] [@media(min-width:1024px)]:text-[18px] cursor-pointer mt-2 text-center' onClick={() => navigate("/signin")}>
                    Already have an account? <span className='text-blue-300 hover:underline'>Sign In</span>
                </p>
            </form>
        </div>
    );
}

export default SignUp;