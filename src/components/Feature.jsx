import React from "react";
import { blogs, game, application, video } from "../assets/index";

// const Content = ({ image, title, description }) => {
//     return (
//         <div className={`w-full px-4 py-5 lg:mb-8 sm:mb-6 mb-2 relative font-poppins bg-gray-800 mx-2 border-b-4 border-[#CD3242] border-solid rounded-md`}>
//             <div className="flex flex-col items-start">
//                 <div className="w-12 mb-4 absolute inset-y-3"><img src={image} alt="feature image" className="w-[70px] h-[70px] object-contain"/></div>
//                 <div className="ml-16">
//                     <h3 className="lg:text-lg md:text-base font-normal text-white capitalize">{title}</h3>
//                     <p className="lg:text-lg md:text-base font-semibold leading-relaxed text-[#CD3242] capitalize">{description}</p>
//                 </div>
//             </div>
//         </div>
//     );
// }

const Contentv2 = ({ image, title, description }) => {
    return (
        <div className={`w-full px-4 pb-5 pt-2 lg:mb-8 sm:mb-6 mb-2 relative font-poppins bg-[#FAF9F4] mx-2 border-b-4 rounded-tr-3xl border-[#FB2736] border-solid rounded-md`}>
            <div className="flex flex-col items-start">
                <div className="w-12 mb-1"><img src={image} alt="feature image" className="w-[140px] h-[70px] object-contain"/></div>
                <div className="">
                    <h3 className="lg:text-lg md:text-base font-normal text-[#0F0C45] capitalize">{title}</h3>
                    <p className="lg:text-lg md:text-base font-semibold leading-relaxed text-[#0F0C45] capitalize">{description}</p>
                </div>
            </div>
        </div>
    );
}

const Feature = () => {
  return (
        <section className={`container grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mx-auto sm:mb-10 mb-6 py-12 pb-8 relative top-[-80px]`}>
            <Contentv2
                image={game}
                title="Games"
                description="Strategic & Secrets"
            />
            <Contentv2
                image={blogs}
                title="Blogs"
                description="Personalized & Guides"
            />
            <Contentv2
                image={video}
                title="Videos"
                description="Rarely Seen on Internet"
            />
            <Contentv2
                image={application}
                title="Applications"
                description="Easy to Download"
            />
        </section>
  );
}

export default Feature