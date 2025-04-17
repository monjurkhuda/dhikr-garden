import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Image, Box, Text, Button, Dialog, HStack } from '@chakra-ui/react'

const CardBadge = ({ card }) => {
    const [showCard, setShowCard] = useState(false);

    return (
        <Box>
            <Image src={`./images/${card.image_file}`}
                alt={card.image_file}

                width='60px' minWidth='60px' height='60px' minHeight='60px' borderRadius='20px' border="4px dotted"
                borderColor={card.tier === 4 ? "#80BC8A" : card.tier === 1 ? "brown" : card.tier === 3 ? "gold" : "silver"}
                onClick={() => setShowCard(!showCard)}
            />

            {showCard &&
                <Box position="absolute" zIndex={1} onClick={() => setShowCard(!showCard)} backgroundColor={"#e5ce9b"} padding={"20px"} >
                    <Box width={300} height={400} display={'flex'} flexDirection={'column'} alignItems={'center'} backgroundColor={"#e5ce9b"}>
                        <Image style={{ position: 'absolute', top: '40px'  }} src={`./images/${card.image_file}`} alt={`./images/${card.image_file}`} width={200} />
                        <Image style={{ position: 'absolute' }} src={`./images/${card.tier}_CardBase.png`} alt={`${card.tier}_CardBase`} width={260} />
                        <Text style={{ position: 'relative', top: '224px', fontWeight: 'bold' }} >{card.title}</Text>
                        <Text style={{ position: 'relative', fontSize: '12px', color: 'black', top: '250px', maxWidth: '150px', fontWeight: 'bold' }}>{card.description}</Text>
                    </Box>
                </Box>
            }
        </Box>
    );
};

export default CardBadge;
