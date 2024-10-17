import React, { useState } from "react";
import toramBG from '../assets/toram_online.jpg'
import { Card } from './index'

const cards = [
    {
        image:{toramBG},
        title:"Toram Online",
        buttonText:"View More"
    },
    {
        image:{toramBG},
        title:"Toram Online",
        buttonText:"View More"
    },
    {
      image:{toramBG},
      title:"Toram Online",
      buttonText:"View More"
    },
    {
      image:{toramBG},
      title:"Toram Online",
      buttonText:"View More"
    },
];

const Slider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const handlePrevClick = () => {
      setCurrentIndex(currentIndex === 0 ? cards.length - 1 : currentIndex - 1);
    };
  
    const handleNextClick = () => {
      setCurrentIndex(currentIndex === cards.length - 1 ? 0 : currentIndex + 1);
    };
  
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 flex">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`w-full h-full flex-shrink-0 transition-all duration-500 ease-in-out transform ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Card {...card} />
            </div>
          ))}
        </div>
        <button
          className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white bg-opacity-70 px-4 py-2 rounded-full"
          onClick={handlePrevClick}
        >
          &#8249;
        </button>
        <button
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white bg-opacity-70 px-4 py-2 rounded-full"
          onClick={handleNextClick}
        >
          &#8250;
        </button>
      </div>
    );
}

export default Slider
