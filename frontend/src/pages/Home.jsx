import React, { useContext, useEffect, useState, useRef } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { BiMenuAltRight } from "react-icons/bi"
import { RxCross1 } from "react-icons/rx"

const getGeminiResponse = async (transcript, serverUrl) => {
  try {
    const response = await axios.post(
      `${serverUrl}/api/user/askToassistant`,
      { command: transcript },
      { withCredentials: true }
    )
    return response.data
  } catch (error) {
    console.error("Gemini API Error:", error)
    return null
  }
}

export const Home = () => {
  const { userData, serverUrl, setUserData, refreshUser } =
    useContext(userDataContext)

  const navigate = useNavigate()

  useEffect(() => {
    if (!userData) {
      navigate("/signin");
    }
  }, [userData, serverUrl, refreshUser]); 

  const [aiResponse, setAiResponse] = useState(null)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showErrorBox, setShowErrorBox] = useState(false)
  const [errorBoxData, setErrorBoxData] = useState({ title: "", body: "" })

  const isRecognitionRef = useRef(false)
  const recognitionRef = useRef(null)

  // Fallback avatar image in case the assistant image fails to load
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"

  useEffect(() => {
    if (userData?.assistantName) {
      const greeting = new SpeechSynthesisUtterance(
        `Hello, I'm ${userData.assistantName}. How can I help you today?`
      )
      greeting.lang = 'en-US'
      window.speechSynthesis.speak(greeting)
    }
  }, [userData?.assistantName])

  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onstart = () => {
      if (recognitionRef.current && isRecognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };

    utterance.onend = () => {
      if (recognitionRef.current && isRecognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log("Recognition already running");
          }
        }, 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = async (data) => {
    const { type, userInput, value } = data
    const query = encodeURIComponent(userInput)

    if (type === "google_search") {
      window.open(`https://www.google.com/search?q=${query}`, "_blank")
    }
    if (
      type === "youtube_search" ||
      type === "youtube_play" ||
      type === "youtube_open"
    ) {
      window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank")
    }
    if (type === "calculator_open") {
      window.open("https://www.google.com/search?q=calculator", "_blank")
    }
    if (type === "instagram_open") {
      window.open("https://www.instagram.com", "_blank")
    }
    if (type === "facebook_open") {
      window.open("https://www.facebook.com", "_blank")
    }
    if (type === "weather_show") {
      window.open(`https://www.google.com/search?q=weather+${query}`, "_blank")
    }

    if (type === "get_battery") {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery()
          const level = Math.round(battery.level * 100)
          const isCharging = battery.charging ? "and it is currently charging." : "and it is not charging."
          const batteryMsg = `Your device battery is at ${level} percent ${isCharging}`
          setAiText(batteryMsg)
          speak(batteryMsg)
        } catch (e) {
          speak("Sorry, I cannot access your battery status right now.")
        }
      } else {
        speak("Battery Status API is not supported on your browser.")
      }
    }

    if (type === "set_timer") {
      const seconds = parseInt(value) || 10
      speak(`Setting a timer for ${seconds} seconds now.`)
      setTimeout(() => {
        const alarmMsg = "Time is up! Your timer has ended."
        setAiText(alarmMsg)
        speak(alarmMsg)
      }, seconds * 1000)
    }
  }

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      })
      setUserData(null)
      navigate("/signup")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/signup")
    }
  }

  const handleClearHistory = async () => {
    try {
      await axios.delete(
        `${serverUrl}/api/user/clearHistory`,
        { withCredentials: true }
      );
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      isRecognitionRef.current = true;
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") {
        return;
      }

      console.log("Speech Error:", event.error);

      if (event.error === "not-allowed") {
        isRecognitionRef.current = false;
      }
    };

    recognition.onend = () => {
      if (
        isRecognitionRef.current &&
        !window.speechSynthesis.speaking
      ) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
          }
        }, 300);
      }
    };

    recognition.onresult = async (e) => {
      const resultItem = e.results[e.results.length - 1]
      if (!resultItem.isFinal) return

      const transcript = resultItem[0].transcript.trim()
      const lowerCommand = transcript.toLowerCase()

      if (lowerCommand.includes("open google")) {
        window.open("https://www.google.com", "_blank")
        speak("Opening Google")
        return
      }

      if (lowerCommand.includes("open youtube")) {
        window.open("https://www.youtube.com", "_blank")
        speak("Opening YouTube")
        return
      }

      if (lowerCommand.includes("open facebook")) {
        window.open("https://www.facebook.com", "_blank")
        speak("Opening Facebook")
        return
      }

      if (lowerCommand.includes("open instagram")) {
        window.open("https://www.instagram.com", "_blank")
        speak("Opening Instagram")
        return
      }

      if (lowerCommand.includes("open calculator")) {
        window.open("https://www.google.com/search?q=calculator", "_blank")
        speak("Opening Calculator")
        return
      }

      setUserText(transcript)
      setAiText("")
      setShowErrorBox(false)

      const data = await getGeminiResponse(transcript, serverUrl)

      if (data && data.response) {
        setAiText(data.response)
        setUserText("")
        speak(data.response)
        handleCommand(data)

        if (refreshUser) {
          refreshUser()
        }
      } else {
        const rateLimitMessage =
          "My AI quota is exhausted. Please ask a basic system command instead."

        setAiText(rateLimitMessage)
        setUserText("")
        speak(rateLimitMessage)

        setErrorBoxData({
          title: "API Quota Exhausted",
          body: `Command: "${transcript}"\nStatus: RESOURCE_EXHAUSTED`
        })

        setShowErrorBox(true)
      }
    }

    try {
      recognition.start()
    } catch (err) {
      console.log("Recognition already started")
    }

    return () => {
      isRecognitionRef.current = false
      window.speechSynthesis.cancel()
      recognition.stop()
    }
  }, [serverUrl, refreshUser])

  return (
    <div className='w-full min-h-screen bg-gradient-to-t from-black to-[#02023d] flex justify-start md:justify-center items-center flex-col gap-[20px] relative overflow-x-hidden pt-10'>
      
      <div className="absolute top-[20px] right-[20px] lg:hidden z-30">
        <BiMenuAltRight
          onClick={() => setIsMenuOpen(true)}
          className="text-white w-[35px] h-[35px] cursor-pointer"
        />
      </div>

      {showErrorBox && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-2xl bg-[#1c1c1e] rounded-xl overflow-hidden shadow-2xl border border-red-500/20 font-mono text-sm">
            <div className="bg-[#ff453a]/20 border-b border-red-500/30 p-4 flex justify-between items-center">
              <span className="text-[#ff453a] font-bold tracking-wide">
                [plugin:assistant:status] {errorBoxData.title}
              </span>
              <RxCross1
                onClick={() => setShowErrorBox(false)}
                className="text-gray-400 hover:text-white cursor-pointer w-4 h-4"
              />
            </div>
            <div className="p-6 text-[#ffb3b3] bg-[#121214] min-h-[150px] whitespace-pre-wrap leading-relaxed">
              {errorBoxData.body}
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xl z-40 lg:hidden flex flex-col p-6">
          <div className="flex justify-end">
            <RxCross1
              onClick={() => setIsMenuOpen(false)}
              className="text-white w-[26px] h-[26px] cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-5 ">
            <button
              onClick={() => {
                handleLogOut()
                setIsMenuOpen(false)
              }}
              className="w-fit min-w-[140px] h-[45px] px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full"
            >
              Log Out
            </button>
            <button
              onClick={() => {
                navigate("/customize")
                setIsMenuOpen(false)
              }}
              className="w-fit min-w-[260px] h-[45px] px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full"
            >
              Customize your Assistant
            </button>
            <div className="w-full h-[5px] bg-white/30 mt-1"></div>
            <h2 className="text-white text-[28px] font-semibold">History</h2>
            <div className="h-[440px] overflow-y-auto pr-1 mt-2">
              {userData?.history?.length > 0 ? (
                userData.history.map((item, index) => (
                  <div
                    key={index}
                    className="text-gray-300 text-sm py-1 px-3 rounded-lg bg-white/5 border border-white/10 mb-2 break-words whitespace-normal"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No history found</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBackNavigation}
        className='absolute hidden lg:block top-[20px] left-[20px] text-white hover:text-blue-500 text-[26px] z-30'
      >
        <FaArrowLeft />
      </button>

      <div className='hidden lg:flex absolute top-[20px] right-[20px] flex-col gap-3 z-20 items-end'>
        <button
          className='w-[200px] h-[60px] bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[18px] rounded-full'
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className='w-[280px] h-[60px] bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[18px] rounded-full'
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>
      </div>

      <div className='flex flex-col items-center justify-center mt-[20px] lg:mt-0 px-4 w-full'>
        <div className='w-[220px] sm:w-[250px] md:w-[280px] lg:w-[320px] flex flex-col justify-center items-center'>
          <div className='w-[80vw] max-w-[300px] aspect-[3/4] overflow-hidden rounded-3xl border-2 border-blue-500/30 flex items-center justify-center bg-black'>
            <img
              key={userData?.assistantImage}
              src={userData?.assistantImage || defaultAvatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              className='w-full h-full object-cover'
              alt='Assistant'
            />
          </div>
          <h1 className='text-white text-[24px] font-semibold mt-1 animate-pulse text-center'>
            I'm {userData?.assistantName || "Assistant"}
          </h1>
          <img
            src={aiText ? aiImg : userImg}
            alt=""
            className='w-[180px] rounded-full mix-blend-screen object-contain'
          />
          <h1 className='text-white text-center bg-black/20 py-2 rounded-xl backdrop-blur-sm min-h-[50px] flex items-center justify-center px-4'>
            {userText ? userText : aiText ? aiText : "How can I help you?"}
          </h1>
        </div>
      </div>
    </div>
  )
}