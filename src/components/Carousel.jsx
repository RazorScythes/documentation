import React, { useState } from 'react';

const Carousel = ({ items }) => {
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((startIndex - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setStartIndex((startIndex + 1) % items.length);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="flex transition-all duration-300 ease-in-out" style={{ transform: `translateX(-${startIndex * 33.33}%)` }}>
        {items.slice(startIndex, startIndex + 3).map((item, index) => (
          <div key={index} className="w-full md:w-1/3 px-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img
                className="object-cover w-full h-48"
                src={item.imageUrl}
                alt={item.title}
              />
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{item.title}</h2>
                <p className="text-gray-700 text-base">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-l-md hover:bg-gray-800 focus:outline-none"
        onClick={handlePrev}
      >
        Previous
      </button>
      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-r-md hover:bg-gray-800 focus:outline-none"
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
};

export default Carousel;
