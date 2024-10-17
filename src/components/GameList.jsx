import { Card, TextWithLines } from './index'
import { game_list } from '../constants';
import { MotionAnimate } from 'react-motion-animate';

import styles from "../style";

const GameList = () => {
    return (
        <div>
            <div className='container mx-auto flex-wrap'>
                <TextWithLines text="Played Games" />
            </div>
            <section className={`container mx-auto grid md:grid-cols-4 ss:grid-cols-2 grid-cols-1 gap-5 place-content-start  sm:mb-20 mb-6 py-4`}>
                {
                    game_list.map((game, index) => {
                        return (
                            <MotionAnimate variant={{
                                hidden: { 
                                    opacity: 0,
                                    transform: 'scale(0)'
                                },
                                show: {
                                    opacity: 1,
                                    transform: 'scale(1)',
                                    transition: {
                                        duration: 0.4,
                                    }
                                }
                            }}>
                                <Card
                                    key={index}
                                    image={game.image}
                                    title={game.title}
                                    link={game.link}
                                />
                            </MotionAnimate>
                        )
                    })
                }
            </section>
        </div>
    );
}

export default GameList