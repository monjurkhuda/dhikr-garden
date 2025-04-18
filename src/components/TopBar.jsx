import React from 'react';
import { Link } from 'react-router-dom';
import { Text, HStack, Image } from '@chakra-ui/react'

const TopBar = () => {
    return (
        <HStack
            style={{         
                display: "flex",
                width: "340px",
                paddingTop: "10px",
            }}
        >
            <Link to="/">
                <HStack>
                    <Image src={`./images/logo.png`}
                        alt="logo"
                        width='24px' height='40px'
                    />
                    <Text fontSize={"sm"} fontFamily={"mono"}>Istighfar Garden</Text>
                </HStack>
            </Link>
        </HStack>
    );
};

export default TopBar;
