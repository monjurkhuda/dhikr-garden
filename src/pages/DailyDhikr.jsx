import React, { useEffect, useState } from 'react';
import { Separator, Box, Text, Button, Flex, Card, For, CheckboxCard, Tabs, Checkbox, Stack, HStack, VStack, Link } from '@chakra-ui/react'
import benefitsData from "../assets/data/benefits_of_dhikr.json";
import { useNavigate } from 'react-router-dom'
import adhkarData from "../assets/data/adhkar.json"
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { RiFireFill, RiHeartPulseFill } from "react-icons/ri";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { GiTwoCoins } from "react-icons/gi";
import { Toaster, toaster } from "../components/ui/toaster"
import TopBar from "../components/TopBar"
import ScrollingText from "../components/ScrollingText"
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, deleteField } from "firebase/firestore";
import { useSound } from 'use-sound';
import coinSound from "../assets/audio/knock.mp3"

let randomIndex = Math.floor(Math.random() * benefitsData.benefits_of_dhikr.length);
let dailyAdhkarIdArray = []

const DailyDhikr = () => {
    const [dailyAdhkar, setDailyAdhkar] = useState(JSON.parse(localStorage.getItem("daily_adhkar")) || {});
    const [coins, setCoins] = useState(JSON.parse(localStorage.getItem("coins")) || 0);
    const [streak, setStreak] = useState(JSON.parse(localStorage.getItem("streak")) || 0);       
    const todayDate = new Date().toLocaleDateString();

    const navigate = useNavigate();
    const user = auth.currentUser;

    const [isSoundOn, setIsSoundOn] = useState(true);
    const [play, { stop }] = useSound(coinSound);      

    dailyAdhkarIdArray = []

    Object.keys(dailyAdhkar).map((key) => {
        let repititions = Number(dailyAdhkar[key].repetition)
        let repeatedToday = Number(dailyAdhkar[key].repeated_today)

        for (let i = 0; i < (repititions - repeatedToday); i++) {
            dailyAdhkarIdArray.push(key)
        }
    })

    const handlePlay = () => {
        if (isSoundOn) {
            play();
        }
    };

    const toggleSound = () => {
        setIsSoundOn(!isSoundOn);
        if (isSoundOn) {
            stop();
        }
    };

    const handleComplete = (key) => {
        handlePlay();
        localStorage.setItem("dhikr_last_started", todayDate)          

        let dailyAdhkarString = localStorage.getItem("daily_adhkar");
        let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
        dailyAdhkarObj[dailyAdhkarIdArray[0]].repeated_today = dailyAdhkarObj[dailyAdhkarIdArray[0]].repeated_today + 1
        localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));
        setDailyAdhkar(dailyAdhkarObj)

        let coinIncrement = Number(dailyAdhkar[dailyAdhkarIdArray[0]].transliteration.length);
        let coins = Number(localStorage.getItem("coins"));
        let totalCoins = coins + coinIncrement;
        localStorage.setItem("coins", JSON.stringify(totalCoins));
        setCoins((prev) => prev + coinIncrement);

        let rewardCoins = Number(dailyAdhkar[dailyAdhkarIdArray[0]].transliteration.length)

        if (dailyAdhkarIdArray.length < 2 && localStorage.getItem("dhikr_last_completed") !== todayDate) {
            localStorage.setItem("streak", streak + 1);
            setStreak(streak + 1)

            if (user) {
                const userRef = doc(db, "users", user.uid)
                updateDoc(userRef, {
                    streak: increment(1),
                    coins: Number(localStorage.getItem("coins")),
                    dhikr_last_completed: todayDate,
                });
                const leaderboardRef = doc(db, "leaderboard", user.uid)
                updateDoc(leaderboardRef, {
                    coins: Number(localStorage.getItem("coins")),
                });
            }
            localStorage.setItem("dhikr_last_completed", todayDate);
        }

        toaster.create({
            description: `${rewardCoins} coins!`,
            type: "success",
            duration: 300,
        })
    }

    if (dailyAdhkarIdArray.length < 1) {
        return (
            <VStack width="100%" display="flex" justifyContent="flex" alignItems="center" flexDirection="column" padding={10}>
                <Text>
                    MashAllah!
                </Text>
                <Text>
                    Dhikr for the day completed.
                </Text>
                <Text>
                    You have {coins} coins.
                </Text>

                {user && <VStack><HStack><RiFireFill /><Text>You're on a {streak} day streak!</Text></HStack>
                    <Box border="1px gray solid" padding="10px">
                        <Text fontSize={"xs"} textAlign={"center"}>"The most beloved of deeds to Allah are those that are most consistent, even if it is small.”</Text>
                    </Box>
                </VStack>}

                <Button onClick={() => navigate('/')}>Go Home</Button>
            </VStack>
        )
    }

    return (
        <Box display={"flex"} justifyContent={"center"} width={"100%"} overflowY={"scroll"} maxHeight={"70vh"} paddingBottom={"60px"}>
            <Toaster />
            <VStack>
                <TopBar />

                <ScrollingText />

                <HStack width={"100%"} marginTop={4} display={"flex"} justifyContent={"flex-end"}>
                    <HStack><GiTwoCoins />
                        <Text>{coins}</Text>
                    </HStack>
                </HStack>

                <Card.Root width="320px" maxHeight="200px" overflow="auto" margin={2} padding={2}>
                    <Box flexDirection="column" justifyContent="space-between" alignItems="center" p={2}>

                        <Text fontSize="md" fontWeight="bold">
                            {dailyAdhkar[dailyAdhkarIdArray[0]].transliteration}
                        </Text>

                        <Separator variant="dashed" size="md" margin={4} />

                        <Text fontSize="md" fontWeight="bold">
                            {dailyAdhkar[dailyAdhkarIdArray[0]].arabic}
                        </Text>

                        <Separator variant="dashed" size="md" margin={4} />

                        <Text fontSize="md" fontWeight="bold">
                            {dailyAdhkar[dailyAdhkarIdArray[0]].translation}
                        </Text>

                        <Separator variant="dashed" size="md" margin={4} />

                        <Text fontSize="md" fontWeight="bold">
                            {dailyAdhkar[dailyAdhkarIdArray[0]].benefits}
                        </Text>

                    </Box>
                </Card.Root>

                <Box width={"80%"} display="flex" justifyContent={"flex-end"} position={"absolute"} bottom={"100px"} zindex={4}>

                    <VStack>
                        <HStack width="100%" display="flex" alignItems="flex-end" justifyContent="space-between">

                            <HStack >
                                <RiHeartPulseFill size="20px" />
                                <Text fontSize={"16px"}>{dailyAdhkarIdArray.length} left</Text>
                            </HStack>

                            <Link onClick={toggleSound}>
                                {isSoundOn ? <FaVolumeUp size="24px" /> : <FaVolumeMute size="24px" />}
                            </Link>
                        </HStack>


                        <Button
                            boxShadow='0px 12px 0px 0px #cfaf06'
                            fontWeight='bold'

                            _active={{
                                backgroundColor: 'white',
                                boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                                transform: 'translateY(4px)'
                            }}

                            _hover={{ backgroundColor: 'white', boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff' }}

                            backgroundColor="gold" width={"140px"} height={"100px"}

                            onClick={() => handleComplete(dailyAdhkarIdArray[0])}>

                            <VStack>
                                <Text fontSize={"54px"}>+</Text>
                                <HStack marginTop={2}>
                                    <GiTwoCoins />
                                    <Text fontSize={"20px"}>{Number(dailyAdhkar[dailyAdhkarIdArray[0]].transliteration.length)}</Text>
                                </HStack>
                            </VStack>
                        </Button>
                    </VStack>
                </Box>
            </VStack>

        </Box>
    );
};

export default DailyDhikr;
