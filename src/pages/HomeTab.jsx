import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { Box, Input, VStack, Text, Button, Flex, Card, CheckboxCard, Stack, HStack } from '@chakra-ui/react'
import { LuChevronDown, LuChevronUp, LuChevronsUp, LuX, LuSave } from "react-icons/lu";
import { BiAddToQueue } from "react-icons/bi";
import { RiFireFill } from "react-icons/ri";
import { BsFillPlayFill } from "react-icons/bs";
import { GiTwoCoins } from "react-icons/gi";
import TopBar from "../components/TopBar";
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import benefitsData from "../assets/data/benefits_of_dhikr.json";
import adhkarData from "../assets/data/adhkar.json"

function HomeTab() {
    const [benefitsCardExpanded, setBenefitsCardExpanded] = useState(true)
    const [loading, setLoading] = useState(true);

    let randomIndex = Math.floor(Math.random() * benefitsData.benefits_of_dhikr.length);
    const todayDate = new Date().toLocaleDateString();
    const user = auth.currentUser;
    const navigate = useNavigate();

    const [coins, setCoins] = useState(Number(localStorage.getItem("coins")) || 0);
    const [streak, setStreak] = useState(Number(localStorage.getItem("streak")) || 0);
    const [dailyAdhkar, setDailyAdhkar] = useState(JSON.parse(localStorage.getItem("daily_adhkar")) || {});
    const [goal, setGoal] = useState(localStorage.getItem("goal") || "");
    const [showGoalEdit, setShowGoalEdit] = useState(false);

    //localStorage.setItem("last_userinfo_fetch", "4/20/2025")

    useEffect(() => {
        if (!localStorage.getItem("daily_adhkar")) {
            let empty_obj = {}
            localStorage.setItem("daily_adhkar", JSON.stringify(empty_obj))
        }

        if (!localStorage.getItem("coins")) {
            localStorage.setItem("coins", 0)
        }

        if (!localStorage.getItem("streak")) {
            localStorage.setItem("streak", 0)
        }

        if (localStorage.getItem("dhikr_last_started") != todayDate) {
            Object.keys(dailyAdhkar).map((key) => dailyAdhkar[key].repeated_today = 0)
            localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkar));
        }

        if (localStorage.getItem("last_userinfo_fetch") != todayDate) {
            async function fetchData() {
                const userSnap = await getDoc(doc(db, "users", user.uid));

                if (userSnap.exists()) {
                    let dhikrLastCompletedRes = userSnap.data().dhikr_last_completed
                    localStorage.setItem("dhikr_last_completed", dhikrLastCompletedRes)
                    const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();

                    let coinsRes = userSnap.data().coins
                    if (coinsRes > Number(localStorage.getItem("coins"))) {
                        localStorage.setItem("coins", coinsRes)
                        setCoins(coinsRes)
                    } else {
                        const userRef = doc(db, "users", user.uid)
                        updateDoc(userRef, {
                            coins: Number(localStorage.getItem("coins")),
                        });
                    }

                    if (dhikrLastCompletedRes != yesterdayDate) {
                        localStorage.setItem("streak", 0)
                        setStreak(0)
                        const userRef = doc(db, "users", user.uid)
                        updateDoc(userRef, {
                            streak: 0,
                        });
                    }
                    else {
                        let streakRes = userSnap.data().streak
                        if (streakRes > Number(localStorage.getItem("streak"))) {
                            localStorage.setItem("streak", streakRes)
                            setStreak(streakRes)
                        } else {
                            const userRef = doc(db, "users", user.uid)
                            updateDoc(userRef, {
                                streak: Number(localStorage.getItem("streak")),
                            });
                        }
                    }
                }
                setLoading(false)
            }
            fetchData();
            localStorage.setItem("last_userinfo_fetch", todayDate)
        }
        randomIndex = Math.floor(Math.random() * benefitsData.benefits_of_dhikr.length);
        setLoading(false)
    }, [])

    const toggleExpand = () => {
        setBenefitsCardExpanded(!benefitsCardExpanded);
    };

    if (loading) { return <Text>Loading...</Text> }

    return (
        <Stack display={"flex"} alignItems={"center"} maxHeight={"80vh"} paddingBottom={"60px"} overflow="auto">
            <TopBar />
            <HStack gap={"20px"} width={"80vw"} maxWidth={"300px"} marginTop={4} display={"flex"} justifyContent={"flex-end"}>
                <HStack gap={"2px"}>
                    <GiTwoCoins />
                    <Text>{coins}</Text>
                </HStack>
                <HStack gap={"2px"}>
                    <RiFireFill />
                    <Text>{streak} days</Text>
                </HStack>
            </HStack>

            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                {showGoalEdit &&
                    <HStack marginBottom={"10px"}>
                        <Input
                            size="xs"
                            maxLength={30}
                            onInput={(e) => {
                                if (e.target.value.length > 30)
                                    e.target.value = e.target.value.slice(0, 30);
                            }}
                            type="text" placeholder="Enter your goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
                        <Button
                            size="xs"
                            onClick={() => {
                                localStorage.setItem("goal", goal)
                                setShowGoalEdit(!showGoalEdit)
                            }}>
                            <LuSave />
                        </Button>
                    </HStack>
                }

                {!showGoalEdit &&
                    <HStack maxWidth={"320px"} marginBottom={"10px"}>
                        <Text onClick={() => { setShowGoalEdit(!showGoalEdit) }} lineClamp={2} fontSize="14px">Goal: {localStorage.getItem("goal") || "Click to set goal"}</Text>
                    </HStack>
                }
            </Box>

            <HStack width={"80vw"} maxWidth={"300px"} justifyContent={"space-between"}>
                <Text fontSize="lg" fontWeight="bold">Daily Istighfar:</Text>
                <HStack>
                    <Button size={"xs"} onClick={() => navigate('/adddhikr')}><><BiAddToQueue />Add</></Button>
                    {/* <Button size={"xs"}
                        colorPalette={"red"}
                        onClick={() => {
                            localStorage.clear()
                            setDailyAdhkar({})
                        }
                        }>Clear</Button> */}
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

export default HomeTab