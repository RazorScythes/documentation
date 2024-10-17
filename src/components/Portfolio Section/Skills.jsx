import React, { useEffect, useState } from "react";
import heroImage from '../../assets/hero-image.jpg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { convertDriveImageLink } from '../Tools'
import CountUp from 'react-countup';

import { photshop_svg } from "../../assets";
import randomColor from "randomcolor";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from "../../style";

const SkillBox = ({ skill_name, percentage, color = "#FFFF00"}) => {
    return (
        <div style={{ backgroundImage: `linear-gradient(to bottom, ${color}, #1F2937)`}} className={`h-32 w-full mr-4  mb-4 rounded-lg  p-1`}>
            <div className="flex h-full w-full rounded-lg flex-col items-center justify-center bg-gray-800 back">
                <h2 className="text-4xl font-semibold text-white mb-1"><CountUp end={percentage} duation={5}/>%</h2>
                <p style={{color: color}} className="text-base tracking-tighter font-semibold text-center">{skill_name}</p>
            </div>
        </div>
    )
}

const Skills = ({ skills }) => {

    const [skillsData, setSkillsData] = useState({
        image: '',
        heading: '',
        description: '',
        skillBox: [],
        project_completed: 0,
        icon1: '',
        icon2: '',
        icon3: ''
    })

    useEffect(() => {
        if(skills){
            setSkillsData({
                ...skillsData,
                image: skills && skills.image && skills.image !== '' ? skills.image : 'https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1869.jpg?w=2000',
                heading: skills && skills.heading && skills.heading !== '' ? skills.heading : 'Insert heading',
                description: skills && skills.description && skills.description !== '' ? skills.description : 'Insert description',
                skillBox: skills && skills.skill.length > 0 ? skills.skill : [],
                project_completed: skills && skills.project_completed ? skills.project_completed : 0,
                icon1: skills && skills.icons && skills.icons[0] ? skills.icons[0] : 'https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1869.jpg?w=2000',
                icon2: skills && skills.icons && skills.icons[1] ? skills.icons[1] : 'https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1869.jpg?w=2000',
                icon3: skills && skills.icons && skills.icons[2] ? skills.icons[2] : 'https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1869.jpg?w=2000',
            })
        }
    }, [skills])

    return (
        <div
            className="relative bg-cover bg-center py-14 mt-20"
            style={{ backgroundColor: "#111827" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="absolute inset-0 "></div>
                    <div className="mx-auto file:lg:px-8 relative px-0">
                        <div className="lg:flex md:flex items-center justify-center">
                            <div className="lg:w-1/2 md:w-1/2 w-full sm:px-4">
                                <div className="text-center mx-auto lg:w-[31.25rem] p-8 bg-[#111221] rounded-lg relative md:mb-0 mb-12">
                                    <LazyLoadImage
                                        className="mx-auto rounded-lg shadow-lg lg:w-[31.25rem] lg:h-[31.25rem] w-full sm:h-[46.875rem] h-full object-cover"
                                        effect="blur"
                                        alt="Hero Image"    
                                        placeholderSrc={convertDriveImageLink(skillsData.image)}                  
                                        src={convertDriveImageLink(skillsData.image)} 
                                    />
                                    <div className="absolute top-4 left-4 ss:p-4 p-2 bg-white rounded-lg">
                                        <img
                                            className="md:w-16 md:h-16 w-10 h-10 bg-white object-cover"
                                            src={convertDriveImageLink(skillsData.icon1)}
                                        />
                                    </div>
                                    <div className="absolute top-4 right-4 ss:p-4 p-2 bg-white rounded-lg">
                                        <img
                                            className="md:w-16 md:h-16 w-10 h-10 bg-white object-cover"
                                            src={convertDriveImageLink(skillsData.icon2)}
                                        />
                                    </div>
                                    <div className="absolute bottom-4 right-4 ss:p-4 p-2 bg-white rounded-lg">
                                        <img
                                            className="md:w-16 md:h-16 w-10 h-10 bg-white object-cover"
                                            src={convertDriveImageLink(skillsData.icon3)}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 bg-white rounded-full font-poppins ss:py-3 py-1 ss:px-8 px-4">
                                        <div className="flex flex-col relative text-left">
                                            <div className="w-20 mb-4 absolute ss:top-[5%] top-[10%] left-[-0.1em]"><FontAwesomeIcon icon={faCircleCheck} className="text-lg ss:w-12 ss:h-12 w-8 h-8 text-[#59C378]"/></div>
                                            <div className="ss:ml-14 ml-10">
                                                <h3 className="lg:text-2xl ss:text-lg text-base font-semibold text-[#202020] uppercase">{skillsData.project_completed} {skillsData.project_completed <= 99 ? <span className="capitalize">Total</span>: "+"}</h3>
                                                <p className="lg:text-sm ss:text-sm text-xs font-semibold leading-relaxed text-[#CD3242] capitalize">Complete Project</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-1/2 md:w-1/2 w-full sm:px-4">
                                <h2 className="text-4xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 tracking-tighter">
                                    {skillsData.heading}
                                </h2>
                                <p className="text-white text-lg md:text-lg leading-relaxed mb-12">
                                    {skillsData.description}
                                </p>
                                <div className="grid md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-5 place-content-start">
                                    {
                                        skillsData.skillBox.length > 0 &&
                                            skillsData.skillBox.map((item, i) => {
                                                return (
                                                    <SkillBox 
                                                        key={i} 
                                                        skill_name={item.skill_name}
                                                        percentage={item.percentage}
                                                        color={item.hex}
                                                    />
                                                )
                                            })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
        </div>
    );
}

export default Skills