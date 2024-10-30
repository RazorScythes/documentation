import { text } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router-dom";

const styles = {
    boxWidth            : "xl:max-w-[1350px] w-full",
    boxWidthEx          : "xl:max-w-[1350px] w-full",
    heading2            : "font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full",
    paragraph           : "font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px]",

    flexCenter          : "flex justify-center items-center",
    flexStart           : "flex justify-center items-start",
    flexLeft            : "flex  items-start",

    paddingX            : "sm:px-16 px-6",
    paddingY            : "sm:py-16 py-6",
    padding             : "sm:px-16 px-6 sm:py-12 py-4",

    marginX             : "sm:mx-16 mx-6",
    marginY             : "sm:my-16 my-6",
    marginX2            : "sm:mx-16"
};

export const main = {
    font                : "font-poppins",
    font_secondary      : "font-roboto",
    container           : "container mx-auto",
    background          : "bg-white"
}

export const dark = {
    body                : "bg-[#1C1C1C]",
    color               : "text-white",
    background          : "bg-[#0e0e0e]",
    semibackground      : "bg-[#1C1C1C]",
    focusbackground     : "bg-[#2B2B2B]",
    border              : "border-[#0e0e0e]",
    semiborder          : "border-[#1C1C1C]",
    heading             : "text-white",
    text                : "text-gray-400",
    link                : "hover:text-blue-400 transition-all",
    icon                : "text-white hover:text-blue-600 transition-all",
    button              : "bg-white hover:bg-blue-600 border border-white hover:border-blue-600 text-[#0e0e0e] hover:text-white font-medium py-1.5 px-4 transition-colors duration-300 ease-in-out",
    button_transparent  : "text-white hover:text-blue-400 font-medium hover:underline transition-all",
    button_secondary    : "bg-blue-600 hover:bg-blue-700 transition-all",
    input               : "bg-[#1C1C1C] border border-solid border-[#1C1C1C] text-gray-300 leading-tight focus:outline-none focus:bg-[#2B2B2B] transition-all outline-none",
    input_icon          : "text-gray-300"
}

export const light = {
    body                : "bg-white",
    color               : "text-[#0e0e0e]",
    background          : "bg-[#F6F8FA]",
    semibackground      : "bg-[#1C1C1C]",
    focusbackground     : "bg-[#2B2B2B]",
    border              : "border-[#e0e6eb]",
    semiborder          : "border-[#1C1C1C]",
    heading             : "text-blue-700",
    text                : "text-[#1C1C1C]",
    link                : "hover:text-blue-700 transition-all",
    icon                : "text-[#0e0e0e] hover:text-blue-700 transition-all",
    button              : "bg-blue-600 hover:bg-white border border-blue-600 hover:border-[#0e0e0e] text-white hover:text-[#0e0e0e] font-medium py-1.5 px-4 transition-colors duration-300 ease-in-out",
    button_transparent  : "text-[#0e0e0e] hover:text-blue-700 font-medium hover:underline",
    button_secondary    : "bg-blue-600 hover:bg-blue-700 transition-all text-white",
    input               : "bg-[#F6F8FA] border border-solid border-[#D1D9E0] text-[#59636E] leading-tight focus:outline-none focus:bg-[#e0e6eb] transition-all outline-none",
    input_icon          : "text-[#59636E]"
}

export const layout = {
    section             : `flex md:flex-row flex-col ${styles.paddingY}`,
    sectionReverse      : `flex md:flex-row flex-col-reverse ${styles.paddingY}`,

    sectionImgReverse   : `flex-1 flex ${styles.flexCenter} md:mr-10 mr-0 md:mt-0 mt-10 relative`,
    sectionImg          : `flex-1 flex ${styles.flexCenter} md:ml-10 ml-0 md:mt-0 mt-10 relative`,

    sectionInfo         : `flex-1 ${styles.flexStart} flex-col`,
};

export default styles;
