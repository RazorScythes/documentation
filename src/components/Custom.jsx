import React, { useEffect, useState } from 'react'
import Navbar from './Custom/Navbar'
import Footer from './Custom/Footer'
import Hero from './Hero'

import Avatar from './Custom/Avatar'
import Button from './Custom/Button'
import Text from './Custom/Text'
import Alert from './Custom/Alert'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCookie, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const Custom = ({user, path}) => {
    const [show, setShow] = useState(true)
    return (
        <div className='bg-white'>
            <Navbar path={path}/>

            <div className="container mx-auto my-8 flex flex-wrap gap-5">
                <div className='shadow-lg rounded-md border border-solid border-gray-300'>
                    <h3 className='p-4 text-blue-700 text-xl font-bold font-roboto text-center'> Text Component </h3>
                    <hr className=''/>

                    <div className="p-4">
                        <Text 
                            element='h1'
                            color='text-red-800'
                            text='Heading 1'
                        />
                        <Text 
                            element='h2'
                            text='Heading 2'
                        />
                        <Text 
                            element='h3'
                            text='Heading 3'
                            uppercase={true}
                        />
                        <Text 
                            element='h4'
                            text='Heading 4'
                            font="font-poppins"
                        />
                        <Text 
                            element='h5'
                            text='Heading 5'
                            thickness={0}
                        />
                        <Text 
                            element='h6'
                            text='Heading 6'
                            icon={<FontAwesomeIcon icon={faCookie} />}
                        />
                        <Text 
                            element='p'
                            text='paragraph'
                        />
                    </div>
                </div>

                <div className='shadow-lg rounded-md border border-solid border-gray-300'>
                    <h3 className='p-4 text-blue-700 text-xl font-bold font-roboto text-center'> Buttons </h3>
                    <hr className=''/>
                    <div className="p-4 flex flex-col gap-3">
                        <Button
                            onClick={() => alert('Default Button')}
                            text="Default Button"
                        />

                        <Button
                            onClick={() => alert('Customize Button')}
                            text="Customize Color"
                            bgColor="bg-red-600"
                            hoverBgColor="hover:bg-red-700"
                            textColor="text-white"
                        />

                        <Button
                            onClick={() => alert('Button Icon')}
                            text="Button Icon"
                            icon={<FontAwesomeIcon icon={faCookie} />}
                        />

                        <Button
                            text="Disabled"
                            disable={true}
                        />

                        <Button
                            text="Loading"
                            loading={true}
                        />
                    </div>
                </div>
                
                <div className='shadow-lg rounded-md border border-solid border-gray-300'>
                    <h3 className='p-4 text-blue-700 text-xl font-bold font-roboto text-center'> Avatar </h3>
                    <hr className=''/>
                    <div className="p-4 flex flex-col gap-3">
                        <div className='grid grid-cols-2 mx-auto gap-3'>
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                            />
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                rounded={false}
                            />
                        </div>

                        <div className='grid grid-cols-2 mx-auto gap-3'>
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                size={10}
                            />
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                rounded={false}
                                size={10}
                            />
                        </div>

                        <div className='grid grid-cols-2 mx-auto gap-3'>
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                size={12}
                            />
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                rounded={false}
                                size={12}
                            />
                        </div>

                        <div className='grid grid-cols-2 mx-auto gap-3'>
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                size={16}
                            />
                            <Avatar 
                                image={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                pointers={true}
                                rounded={false}
                                size={16}
                            />
                        </div>
                    </div>
                </div>

                <div className='shadow-lg rounded-md border border-solid border-gray-300'>
                    <h3 className='p-4 text-blue-700 text-xl font-bold font-roboto text-center'> Alert </h3>
                    <hr className=''/>
                    <div className="p-4 flex flex-col gap-3 w-96">
                        <Alert 
                            text="This is an alert with icon"
                            show={show}
                            setShow={setShow}
                            icon={<FontAwesomeIcon icon={faExclamationCircle} />}
                            type='info'
                        />
                        <Alert 
                            text="This is an alert with list items"
                            show={show}
                            setShow={setShow}
                            icon={<FontAwesomeIcon icon={faExclamationCircle} />}
                            lists={['List Item 1', 'List Item 2', 'List Item 3']}
                            type='danger'
                        />
                        <Alert 
                            text="This is an info alert"
                            show={show}
                            setShow={setShow}
                            type='info'
                        />
                        <Alert 
                            text="This is an success alert"
                            show={show}
                            setShow={setShow}
                            type='success'
                        />
                        <Alert 
                            text="This is an warning alert"
                            show={show}
                            setShow={setShow}
                            type='warning'
                        />
                        <Alert 
                            text="This is an danger alert"
                            show={show}
                            setShow={setShow}
                            type='danger'
                        />
                        <Alert 
                            text="This is a custom color alert"
                            show={show}
                            setShow={setShow}
                            bgColor='bg-gray-800'
                            textColor='text-white'
                        />
                        <Alert 
                            text="This is a custom color outline alert"
                            show={show}
                            setShow={setShow}
                            outline={true}
                            bgColor='bg-red-600'
                        />
                    </div>
                </div>
            </div>


            <Footer path={path}/>
        </div>
    )
}

export default Custom