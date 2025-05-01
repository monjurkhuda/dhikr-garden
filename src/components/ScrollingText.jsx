import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import dhikrData from '../assets/data/benefits_of_dhikr.json';

const MotionBox = motion(Box);

export default function ScrollingText() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const controls = useAnimation();

  const [currentText, setCurrentText] = useState('');
  const [keyIndex, setKeyIndex] = useState(0);

  const scrollSpeed = 100;

  const getRandomText = () => {
    const entries = dhikrData.benefits_of_dhikr;
    return entries[Math.floor(Math.random() * entries.length)].text;
  };

  const triggerScroll = async () => {
    const containerWidth = containerRef.current?.offsetWidth || 320;
    const textWidth = textRef.current?.offsetWidth || 500;
    const totalDistance = containerWidth + textWidth;
    const duration = totalDistance / scrollSpeed;
  
    await controls.start({
      x: containerWidth,
      transition: { duration: 0 },
    });
  
    setTimeout(() => {
      controls.start({
        x: -textWidth,
        transition: {
          duration,
          ease: 'linear',
        },
      });
    }, 1000);
  
    setTimeout(() => {
      setCurrentText(getRandomText());
      setKeyIndex(prev => prev + 1);
    }, (duration + 1) * 1000);
  };

  useEffect(() => {
    if (currentText) {
      triggerScroll();
    }
  }, [currentText, keyIndex]);

  useEffect(() => {
    setCurrentText(getRandomText());
  }, []);

  return (
    <Box
      ref={containerRef}
      w="320px"
      h="50px"
      overflow="hidden"
      bg="gray.900"
      color="white"
      display="flex"
      alignItems="center"
      position="relative"
    >
      <MotionBox
        ref={textRef}
        animate={controls}
        position="absolute"
        whiteSpace="nowrap"
        minWidth="max-content"
      >
        <Text fontSize="md">{currentText}</Text>
      </MotionBox>
    </Box>
  );
}
