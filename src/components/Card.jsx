import React, { useState } from "react";

const Card = ({ image, title, link }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative w-full bg-cover bg-center h-44 m-2 my-4 rounded-md transition duration-500 ease-in-out transform hover:scale-105"
      style={{ backgroundImage: `url(${image})` }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-80 rounded-md transition duration-500 ease-in-out">
          <div className="text-white text-center">
            <h2 className="text-xl font-medium mb-4">{title}</h2>
            <a href={link}>
                <button className="bg-transparent hover:bg-gray-100 hover:text-gray-800 text-gray-100 font-semibold text-sm py-2 px-4 border border-gray-100 rounded transition-colors duration-300 ease-in-out" >
                    View More
                </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card