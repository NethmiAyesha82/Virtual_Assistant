import React, { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/card'
import image1 from '../assets/image1.png'
import image2 from '../assets/image2.png'
import image3 from '../assets/image3.jpg'
import image4 from '../assets/image4.png'
import image5 from '../assets/image5.jpg'
import image6 from '../assets/image6.png'
import { RiImageAddLine } from "react-icons/ri"
import { userDataContext } from '../context/UserContext'
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {
  const context = useContext(userDataContext)
  const navigate = useNavigate()
  const inputImage = useRef()

  if (!context) return null

  const {
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage
  } = context

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBackendImage(file)
      setFrontendImage(URL.createObjectURL(file))
    }
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-4 [@media(min-width:500px)]:p-6 [@media(min-width:800px)]:p-8 relative overflow-x-hidden'>
      
      <MdKeyboardBackspace 
        className='absolute top-4 left-4 [@media(min-width:500px)]:top-6 [@media(min-width:500px)]:left-6 [@media(min-width:800px)]:top-[30px] [@media(min-width:800px)]:left-[30px] text-white w-5 h-5 [@media(min-width:500px)]:w-6 [@media(min-width:500px)]:h-6 [@media(min-width:1024px)]:w-[28px] [@media(min-width:1024px)]:h-[28px] cursor-pointer z-10' 
        onClick={() => navigate("/home")} 
      />

      <h1 className='text-white text-xl [@media(min-width:500px)]:text-2xl [@media(min-width:800px)]:text-[30px] text-center mt-[60px] [@media(min-width:800px)]:mt-0 mb-6 [@media(min-width:800px)]:mb-[30px] font-medium tracking-wide'>
        Select Your <span className='text-blue-200'>Assistant Image</span>
      </h1>

      <div className='w-full max-w-[400px] [@media(min-width:500px)]:max-w-[500px] [@media(min-width:800px)]:max-w-[750px] [@media(min-width:1024px)]:max-w-[900px] xl:max-w-[1200px] flex justify-center items-center flex-wrap gap-3 [@media(min-width:500px)]:gap-4 [@media(min-width:800px)]:gap-[20px] px-2'>
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />

        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950 hover:border-4 hover:border-white ${selectedImage === "input" ? "border-4 border-white shadow-2xl shadow-blue-950" : ""}`}
          onClick={() => {
            inputImage.current.click()
            setSelectedImage("input")
          }}
        >
          {!frontendImage ? (
            <RiImageAddLine className='text-white w-5 h-5 lg:w-6 lg:h-6' />
          ) : (
            <img src={frontendImage} className='h-full w-full object-cover' alt="preview" />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {selectedImage && (
        <button
          className='min-w-[110px] [@media(min-width:500px)]:min-w-[130px] [@media(min-width:800px)]:min-w-[150px] h-[45px] [@media(min-width:800px)]:h-[60px] mt-6 [@media(min-width:800px)]:mt-[30px] bg-blue-500 hover:bg-blue-600 text-white font-semibold cursor-pointer text-sm [@media(min-width:800px)]:text-[19px] rounded-full transition-all shadow-md'
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  )
}

export default Customize