const splitSentence = (str) => {
    const words = str.trim().split(" ");
    const firstWord = words.shift();
    const restOfSentence = words.join(" ");
    return [firstWord, restOfSentence];
}

const TextWithLines = ({ text, color = "#1d4ed8", height = 4, dualColor = true, bold = true}) => {

    const [firstWord, restOfSentence] = splitSentence(text);

    return (
        <div className="relative">
            <div style={{ height: height+"px" }} className="absolute left-0 top-1/2 md:w-[40px]  w-[30px] bg-gray-700 transform-translate-y-1/2"></div>
            {
                dualColor === true ?
                    <div className="uppercase md:ml-12 ml-12">
                        <p style={{fontWeight:bold? 700 : 500}} className="text-2xl md:text-2xl leading-relaxed uppercase"><span style={{color:color}} > {firstWord} </span><span className='text-gray-800'> {restOfSentence} </span></p>
                    </div>
                    :
                    <div className="uppercase md:ml-12 ml-12">
                        <p style={{fontWeight:bold? 700 : 500}} className="text-2xl md:text-2xl font-bold leading-relaxed uppercase"><span style={{color: color}} className='text-gray-800'> {text} </span></p>
                    </div>
            }
        </div>
    );
}

export default TextWithLines