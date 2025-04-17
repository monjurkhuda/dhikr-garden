import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Text, HStack } from '@chakra-ui/react'
import { BiSolidTrophy } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { RiAccountPinCircleFill } from "react-icons/ri";
import { TbPlayCardStarFilled } from "react-icons/tb";

const NavBar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const linkStyle = (path) => {
    return {
      backgroundColor: activeLink === path ? 'gray' : 'transparent',
      padding: '8px', // Added padding for better visual appearance
      borderRadius: '4px', // Added border radius for rounded corners
    };
  };

  return (
    <HStack
      style={{
        position: "absolute",
        bottom: "0px",
        height: "80px",
        display: "flex",
        width: "100vw",
        justifyContent: "space-around",
        backgroundColor: "black",
        borderTop: "white 2px dashed"
      }}
    >
      <HStack style={linkStyle('/')}>
        <FaHome color="white" />
        <Text color="white"><Link to="/">Home</Link></Text>
      </HStack>

      <HStack style={linkStyle('/rank')}>
        <BiSolidTrophy color="white" />
        <Text color="white"><Link to="/rank">Rank</Link></Text>
      </HStack>

      <HStack style={linkStyle('/cards')}>
        <TbPlayCardStarFilled color="white" />
        <Text color="white"><Link to="/cards">Cards</Link></Text>
      </HStack>

      <HStack style={linkStyle('/account')}>
        <RiAccountPinCircleFill color="white" />
        <Text color="white"><Link to="/account">Account</Link></Text>
      </HStack>
    </HStack>
  );
};

export default NavBar;
