import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { Box, VStack, Text, Button, Flex, Card, CheckboxCard, Stack, HStack } from '@chakra-ui/react'
import { LuChevronDown, LuChevronUp, LuChevronsUp, LuX } from "react-icons/lu";
import { BiAddToQueue } from "react-icons/bi";
import { GiTwoCoins } from "react-icons/gi";
import { BsFillPlayFill } from "react-icons/bs";
import { RiFireFill } from "react-icons/ri";
import TopBar from "../components/TopBar"
import benefitsData from "../assets/data/benefits_of_dhikr.json";

function HomePublic() {
    const [benefitsCardExpanded, setBenefitsCardExpanded] = useState(true)
    const [dailyAdhkar, setDailyAdhkar] = useState(JSON.parse(localStorage.getItem("daily_adhkar")) || {});
    const [coins, setCoins] = useState(localStorage.getItem("coins") || 0);
    const [streak, setStreak] = useState(localStorage.getItem("streak") || 0);

    const navigate = useNavigate();
    let randomIndex = Math.floor(Math.random() * benefitsData.benefits_of_dhikr.length);

    useEffect(() => {
        if (!localStorage.getItem("daily_adhkar")) {
            let empty_obj = {}
            localStorage.setItem("daily_adhkar", JSON.stringify(empty_obj))
        } else {
            let dailyAdhkarString = localStorage.getItem("daily_adhkar");
            let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
            setDailyAdhkar(dailyAdhkarObj)
        }        
        randomIndex = Math.floor(Math.random() * benefitsData.benefits_of_dhikr.length);
    }, [])

    useEffect(() => {
        localStorage.setItem("coins", coins)
    }, [coins])

    const toggleExpand = () => {
        setBenefitsCardExpanded(!benefitsCardExpanded);
    };

    return (
        <Stack display={"flex"} alignItems={"center"} maxHeight={"80vh"} paddingBottom={"60px"} overflow="auto">
            <TopBar />
            <HStack gap={"20px"} width={"80vw"} maxWidth={"300px"} marginTop={4} display={"flex"} justifyContent={"flex-end"}>
                <HStack gap={"2px"}>
                    <GiTwoCoins />
                    <Text>{coins}</Text>
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
                    <Button onClick={() => navigate('/adddhikr')}><BiAddToQueue /> Add Istighfar</Button>
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
                                            let dailyAdhkarString = localStorage.getItem("daily_adhkar");
                                            let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
                                            dailyAdhkarObj[key].repetition = dailyAdhkarObj[key].repetition + 10
                                            localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));
                                            setDailyAdhkar(dailyAdhkarObj)
                                        }}
                                    >
                                        <LuChevronsUp /> 10
                                    </Button>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            let dailyAdhkarString = localStorage.getItem("daily_adhkar");
                                            let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
                                            dailyAdhkarObj[key].repetition = dailyAdhkarObj[key].repetition + 1
                                            localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));
                                            setDailyAdhkar(dailyAdhkarObj)
                                        }}
                                    >
                                        <LuChevronUp />
                                    </Button>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            let dailyAdhkarString = localStorage.getItem("daily_adhkar");
                                            let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
                                            dailyAdhkarObj[key].repetition = dailyAdhkarObj[key].repetition - 1
                                            localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));
                                            setDailyAdhkar(dailyAdhkarObj)
                                        }}
                                    >
                                        <LuChevronDown />
                                    </Button>

                                    <Button
                                        size={"xs"}
                                        onClick={() => {
                                            let dailyAdhkarString = localStorage.getItem("daily_adhkar");
                                            let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
                                            delete dailyAdhkarObj[key]
                                            localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));
                                            setDailyAdhkar(dailyAdhkarObj)
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
                        backgroundColor='#FFD700'  
                        color='black'
                        boxShadow='0px 12px 0px 0px #cfaf06' 
                        fontWeight='bold'
                        _active={{
                            backgroundColor: 'white',
                            boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                            transform: 'translateY(4px)' 
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

export default HomePublic