import React, { useEffect, useState } from 'react';
import { Separator, Box, Text, Button, Flex, Card, For, CheckboxCard, Tabs, Checkbox, Stack, HStack, VStack } from '@chakra-ui/react'
import benefitsData from "../assets/data/benefits_of_dhikr.json";
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, deleteField } from "firebase/firestore";
import { useNavigate } from 'react-router-dom'
import adhkarData from "../assets/data/adhkar.json"
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { RiFireFill } from "react-icons/ri";
import { GiTwoCoins } from "react-icons/gi";
import { Toaster, toaster } from "../components/ui/toaster"
import TopBar from "../components/TopBar"

let randomIndex = Math.floor(Math.random() * benefitsData.benefits_of_dhikr.length);
let dailyAdhkarIdArray = []

const DailyDhikr = () => {
    const [benefitsCardExpanded, setBenefitsCardExpanded] = useState(true)
    const [dailyAdhkar, setDailyAdhkar] = useState(JSON.parse(localStorage.getItem("daily_adhkar")) || {});
    const [coins, setCoins] = useState(JSON.parse(localStorage.getItem("coins")) || 0);
    const [userinfo, setUserinfo] = useState();
    const [adhkarinfo, setAdhkarinfo] = useState();
    const [lastRepeated, setLastRepeated] = useState();
    const [lastCompleted, setLastCompleted] = useState();
    const [loading, setLoading] = useState(true);
    const todayDate = new Date().toLocaleDateString();

    const navigate = useNavigate();
    const user = auth.currentUser;

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const adhkarRef = doc(db, "daily_adhkar", user.uid)
                const adhkarSnap = await getDoc(doc(db, "daily_adhkar", user.uid));
                if (adhkarSnap.exists() && adhkarSnap.data().last_repeat_date !== todayDate) {
                    let dailyAdhkarArrayCopy = adhkarSnap.data().daily_adhkar

                    for (let i = 0; i < dailyAdhkarArrayCopy.length; i++) {
                        dailyAdhkarArrayCopy[i].repeated_today = 0
                    }
                    updateDoc(adhkarRef, { daily_adhkar: dailyAdhkarArrayCopy })
                }
            } else {
                let lastRepeatDate = localStorage.getItem("last_repeat_date");
                let dailyAdhkarString = localStorage.getItem("daily_adhkar");
                let dailyAdhkarObj = JSON.parse(dailyAdhkarString);

                if (lastRepeatDate !== todayDate) {
                    Object.keys(dailyAdhkarObj).map((key) => {
                        dailyAdhkarObj[key].repeated_today = 0
                    })
                    localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));
                    setDailyAdhkar(dailyAdhkarObj)
                }
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const userSnap = await getDoc(doc(db, "users", user.uid));
                const adhkarSnap = await getDoc(doc(db, "daily_adhkar", user.uid));
                if (userSnap.exists()) {
                    setUserinfo(userSnap.data())
                }
                if (adhkarSnap.exists()) {
                    setAdhkarinfo(adhkarSnap.data().daily_adhkar)
                    setLastRepeated(adhkarSnap.data().last_repeat_date)
                    setLastCompleted(adhkarSnap.data().last_complete_date)
                }
                setLoading(false)
            } else {
                setLoading(false)
            }
        }
        fetchData();
    }, [coins])

    useEffect(() => {
        if (user) {
            if (userinfo) {
                setCoins(userinfo.coins)
            }
            if (adhkarinfo) {
                setDailyAdhkar(adhkarinfo)
            }
        } else if (!localStorage.getItem("coins")) {
            localStorage.setItem("coins", 0)
        } else {
            let coinsString = localStorage.getItem("coins");
            setCoins(Number(coinsString))
        }
    }, [userinfo, adhkarinfo]);

    dailyAdhkarIdArray = []

    Object.keys(dailyAdhkar).map((key) => {
        let repititions = Number(dailyAdhkar[key].repetition)
        let repeatedToday = Number(dailyAdhkar[key].repeated_today)

        for (let i = 0; i < (repititions - repeatedToday); i++) {
            dailyAdhkarIdArray.push(key)
        }
    })

    const toggleExpand = () => {
        setBenefitsCardExpanded(!benefitsCardExpanded);
    };

    const handleComplete = (key) => {
        if (user) {
            const adhkarRef = doc(db, "daily_adhkar", user.uid);
            const userRef = doc(db, "users", user.uid)
            const leaderboardRef = doc(db, "leaderboard", user.uid)
            let coinIncrement = Number(dailyAdhkar[dailyAdhkarIdArray[0]].transliteration.length);

            console.log(dailyAdhkarIdArray, dailyAdhkarIdArray.length, lastCompleted)

            if (dailyAdhkarIdArray.length < 2) {
                updateDoc(adhkarRef, {
                    last_complete_date: todayDate
                });

                if (lastCompleted !== todayDate) {
                    const userRef = doc(db, "users", user.uid)
                    updateDoc(userRef, {
                        streak: increment(1)
                    });
                }
            }

            updateDoc(adhkarRef, {
                last_repeat_date: todayDate
            });

            setAdhkarinfo(prev => {
                const updatedAdhkar = [...prev];
                const index = updatedAdhkar.findIndex(item => item.id === prev[key].id);
                if (index !== -1) {
                    updatedAdhkar[index] = { ...updatedAdhkar[index], repeated_today: updatedAdhkar[index].repeated_today + 1 };
                }
                return updatedAdhkar;
            })
            adhkarinfo[key].repeated_today += 1
            updateDoc(adhkarRef, { daily_adhkar: adhkarinfo })

            updateDoc(userRef, {
                coins: increment(coinIncrement)
            });

            updateDoc(leaderboardRef, {
                coins: increment(coinIncrement)
            });

            setCoins((prev) => prev + coinIncrement);

        } else {
            localStorage.setItem("last_repeat_date", todayDate);

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
        }

        let rewardCoins = Number(dailyAdhkar[dailyAdhkarIdArray[0]].transliteration.length)

        toaster.create({
            description: `${rewardCoins} coins!`,
            type: "success",
            duration: 300,
        })

    }

    if (loading) { return <Text>Loading...</Text> }

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

                {userinfo && userinfo.streak && <VStack><HStack><RiFireFill /><Text>{userinfo.streak} day streak!</Text></HStack>

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
            <TopBar/>
                <HStack width={"100%"} marginTop={4} display={"flex"} justifyContent={"flex-end"}>
                    <HStack><GiTwoCoins />
                        <Text>{coins}</Text>
                    </HStack>
                </HStack>

                <Card.Root width="320px" maxHeight="300px" overflow="auto" margin={2} padding={2}>
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
                    <Button
                        boxShadow='0px 12px 0px 0px #cfaf06' // 3D shadow
                        fontWeight='bold'

                        _active={{
                            backgroundColor: 'white',
                            boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                            transform: 'translateY(4px)' //Keeps the button visually pressed down on click
                        }}

                        _hover={{ backgroundColor: 'white', boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff' }}

                        backgroundColor="gold" width={"140px"} height={"100px"} onClick={() => handleComplete(dailyAdhkarIdArray[0])}>
                        <VStack>
                            <HStack marginTop={2}><GiTwoCoins /> <Text fontSize={"20px"}>{Number(dailyAdhkar[dailyAdhkarIdArray[0]].transliteration.length)}</Text></HStack>
                        </VStack>
                    </Button>
                </Box>
            </VStack>

        </Box>
    );
};

export default DailyDhikr;
