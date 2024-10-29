import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';

import styles from "../../style";

const Anime = ({ user, theme }) => {
    return (
        <div className={`relative overflow-hidden ${main.font}  ${theme === 'light' ? light.body : dark.body}`}>
            Anime
        </div>
    )
}

export default Anime