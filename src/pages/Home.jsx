import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Box, VStack, Text, Button, Flex, Card, CheckboxCard, Stack, HStack } from '@chakra-ui/react'
import { LuChevronDown, LuChevronUp, LuChevronsUp, LuX } from "react-icons/lu";
import { BiAddToQueue } from "react-icons/bi";
import { LuSquareSplitHorizontal } from "react-icons/lu";
import { FiSun } from "react-icons/fi";
import { RiMoonClearLine, RiFireFill } from "react-icons/ri";
import { BsArrowsCollapseVertical, BsFillPlayFill } from "react-icons/bs";
import { GiTwoCoins } from "react-icons/gi";
import TopBar from "../components/TopBar";

import benefitsData from "../assets/data/benefits_of_dhikr.json";
import adhkarData from "../assets/data/adhkar.json"

let randomIndex = Math.floor(Math.random() * adhkarData.adhkar.length);

function Home() {
    const [benefitsCardExpanded, setBenefitsCardExpanded] = useState(true)
    const [morningEveningSplit, setMorningEveningSplit] = useState(false)
    const [dailyAdhkar, setDailyAdhkar] = useState([]);
    const [coins, setCoins] = useState(0);
    const [streak, setStreak] = useState(0);
    const [userinfo, setUserinfo] = useState();
    const [adhkarinfo, setAdhkarinfo] = useState();
    const [loading, setLoading] = useState(true);

    const user = auth.currentUser;
    const navigate = useNavigate();
    const userRef = doc(db, "users", user.uid)

    useEffect(() => {
        async function fetchData() {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            const adhkarSnap = await getDoc(doc(db, "daily_adhkar", user.uid));
            if (userSnap.exists()) {
                setUserinfo(userSnap.data())
            }
            if (adhkarSnap.exists()) {
                setAdhkarinfo(adhkarSnap.data().daily_adhkar)
            }
            setLoading(false)
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (userinfo) {
            setCoins(userinfo.coins)
            setStreak(userinfo.streak)
        }
        if (adhkarinfo) {
            setDailyAdhkar(adhkarinfo)
        }
    }, [userinfo, adhkarinfo])

    const toggleExpand = () => {
        setBenefitsCardExpanded(!benefitsCardExpanded);
    };    

    if (loading) { return <Text>Loading...</Text> }

    return (
        <Stack display={"flex"} alignItems={"center"} maxHeight={"80vh"} paddingBottom={"60px"} overflow="auto">
            <TopBar />
            <HStack gap={"20px"} width={"80vw"} maxWidth={"300px"} display={"flex"} justifyContent={"flex-end"}>
                <HStack><GiTwoCoins />
                    <Text>{coins}</Text>
                </HStack>
                <HStack><RiFireFill /><Text>{streak} days</Text>
                </HStack>
            </HStack>

            <HStack width={"80vw"} maxWidth={"300px"} justifyContent={"space-between"}>
                <Text fontSize="lg" fontWeight="bold">Daily Istighfar:</Text>
                <HStack>
                    <Button size={"xs"} onClick={() => navigate('/adddhikr')}><><BiAddToQueue />Add</></Button>

                    <Button size={"xs"}
                    colorPalette={"red"}
                    onClick={() => {
                        localStorage.clear()
                        setDailyAdhkar({})
                    }
                    }>Clear</Button>
                </HStack>
            </HStack>

            {Object.keys(dailyAdhkar).length < 1 &&
                <Stack>
                    <Text>Please add Istighfar to recite everyday</Text>
                    <Button onClick={() => navigate('/adddhikr')}><BiAddToQueue/>Add Istighfar</Button>
                </Stack>}

            {Object.keys(dailyAdhkar).length > 0 && Object.keys(dailyAdhkar).map((key) => (
                <CheckboxCard.Root checked={dailyAdhkar[key].repeated_today >= dailyAdhkar[key].repetition} readOnly width="320px" height="100px" size="md" key={(key)}>
                    <CheckboxCard.HiddenInput />
                    <CheckboxCard.Control>
                        <CheckboxCard.Content>

                            <VStack width={"100%"}>
                                <HStack width={"100%"} display={"flex"} justifyContent={"space-between"}>
                                    <Text lineClamp={2}>{dailyAdhkar[key].transliteration}</Text>
                                    <CheckboxCard.Indicator />
                                </HStack>

                                <HStack width={"100%"} display={"flex"} justifyContent={"flex-end"}>
                                    <Text fontSize={"16px"} fontWeight={"700"}>{dailyAdhkar[key].repetition}x</Text>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            const adhkarRef = doc(db, "daily_adhkar", user.uid)
                                            setAdhkarinfo(prev => {
                                                const updatedAdhkar = [...prev];
                                                const index = updatedAdhkar.findIndex(item => item.id === prev[key].id);
                                                if (index !== -1) {
                                                    updatedAdhkar[index] = { ...updatedAdhkar[index], repetition: updatedAdhkar[index].repetition + 10 };
                                                }
                                                return updatedAdhkar;
                                            })
                                            adhkarinfo[key].repetition += 10
                                            updateDoc(adhkarRef, { daily_adhkar: adhkarinfo })
                                        }}
                                    >
                                        <LuChevronsUp /> 10
                                    </Button>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            const adhkarRef = doc(db, "daily_adhkar", user.uid)
                                            setAdhkarinfo(prev => {
                                                const updatedAdhkar = [...prev];
                                                const index = updatedAdhkar.findIndex(item => item.id === prev[key].id);
                                                if (index !== -1) {
                                                    updatedAdhkar[index] = { ...updatedAdhkar[index], repetition: updatedAdhkar[index].repetition + 1 };
                                                }
                                                return updatedAdhkar;
                                            })
                                            adhkarinfo[key].repetition += 1
                                            updateDoc(adhkarRef, { daily_adhkar: adhkarinfo })
                                        }}
                                    >
                                        <LuChevronUp />
                                    </Button>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            const adhkarRef = doc(db, "daily_adhkar", user.uid)
                                            setAdhkarinfo(prev => {
                                                const updatedAdhkar = [...prev];
                                                const index = updatedAdhkar.findIndex(item => item.id === prev[key].id);
                                                if (index !== -1 && updatedAdhkar[index].repetition > 1) {
                                                    updatedAdhkar[index] = { ...updatedAdhkar[index], repetition: updatedAdhkar[index].repetition - 1 };
                                                }
                                                return updatedAdhkar;
                                            })
                                            if (adhkarinfo[key].repetition > 1) {
                                                adhkarinfo[key].repetition -= 1
                                                updateDoc(adhkarRef, { daily_adhkar: adhkarinfo })
                                            }
                                        }}
                                    >
                                        <LuChevronDown />
                                    </Button>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            const adhkarRef = doc(db, "daily_adhkar", user.uid)
                                            setAdhkarinfo(prev => {
                                                const updatedAdhkar = [...prev];
                                                const index = updatedAdhkar.findIndex(item => item.id === prev[key].id);
                                                if (index !== -1) {
                                                    updatedAdhkar.splice(index, 1);
                                                }
                                                return updatedAdhkar;
                                            })

                                            const index = adhkarinfo.indexOf(adhkarinfo[key]);
                                            if (index > -1) {
                                                adhkarinfo.splice(index, 1);
                                            }
                                            updateDoc(adhkarRef, { daily_adhkar: adhkarinfo })
                                        }}
                                    ><LuX />
                                    </Button>

                                </HStack>
                            </VStack>
                        </CheckboxCard.Content>
                    </CheckboxCard.Control>
                </CheckboxCard.Root>
            ))}            

            {Object.keys(dailyAdhkar).length < 1 &&
                <Card.Root width="320px" maxHeight="300px" overflow="auto" margin={4}>
                    <Flex justifyContent="space-between" alignItems="center" p={2}>
                        <Text fontSize="md" fontWeight="bold">
                            Benefits
                        </Text>
                        <Button variant="ghost" onClick={toggleExpand} aria-label="Toggle expand">
                            {benefitsCardExpanded ? <LuChevronUp size="20px" /> : <LuChevronDown size="20px" />}
                        </Button>
                    </Flex>

                    {benefitsCardExpanded && (
                        <div p={4}>
                            <Text textAlign="justify" textStyle="sm" fontWeight="medium" letterSpacing="wide" paddingRight={4} paddingLeft={4} paddingBottom={4}>
                                {benefitsData.benefits_of_dhikr[randomIndex].text}
                            </Text>
                        </div>
                    )}
                </Card.Root>
            }

            {Object.keys(dailyAdhkar).length > 0 &&
                <Box position={"absolute"} bottom={"100px"} zindex={4}>
                    <Button
                        size={"xl"}
                        onClick={() => navigate('/dailydhikr')}
                        backgroundColor='#FFD700' // Initial gold color
                        color='black'
                        boxShadow='0px 12px 0px 0px #cfaf06' // 3D shadow
                        fontWeight='bold'
                        _active={{
                            backgroundColor: 'white',
                            boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                            transform: 'translateY(4px)' //Keeps the button visually pressed down on click
                        }}
                        _hover={{ backgroundColor: 'white', boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff' }}
                    >

                        Start <BsFillPlayFill size={"40px"} />
                    </Button>
                </Box>
            }

        </Stack>
    )
}

export default Home