import { useState, useEffect } from 'react';
import React from 'react';
import { VStack, Box, Text, HStack, Image, Dialog, Button, CloseButton } from '@chakra-ui/react'
import { Toaster, toaster } from "../components/ui/toaster"
import cardsData from "../assets/data/cards.json"
import { GiTwoCoins } from "react-icons/gi";
import TopBar from "../components/TopBar"
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";

import allcards from "../assets/data/allcards.json"

const Cards = () => {
    const [userCards, setUserCards] = useState(JSON.parse(localStorage.getItem("user_cards")) || []);
    const [showCard, setShowCard] = useState(false);
    const [selectedShowCard, setSelectedShowCard] = useState({});
    const [countdown, setCountdown] = useState(3);
    const [wonCard, setWonCard] = useState({});
    const [cardTier, setCardTier] = useState("");
    const [countdownInProgress, setCountdownInProgress] = useState(false)
    const [coins, setCoins] = useState(localStorage.getItem("coins") || 0);

    const todayDate = new Date().toLocaleDateString();
    const user = auth.currentUser;
    const tierArray = ["bronze", "silver", "gold", "sapphire"]

    let bronzeTierLength = 0;
    let silverTierLength = 0;
    let goldTierLength = 0;
    let sapphireTierLength = 0;

    allcards.cards.forEach(card => {
        if (card.tier == "bronze") {
            bronzeTierLength++
        } else if (card.tier == "silver") {
            silverTierLength++
        } else if (card.tier == "gold") {
            goldTierLength++
        } else if (card.tier == "sapphire") {
            sapphireTierLength++
        }
    })

    useEffect(() => {
        if (!localStorage.getItem("user_cards")) {
            let empty_obj = []
            localStorage.setItem("user_cards", JSON.stringify(empty_obj))
        }

        if (localStorage.getItem("last_usercards_fetch") != todayDate) {
            async function fetchData() {
                const userSnap = await getDoc(doc(db, "users", user.uid));

                if (userSnap.exists()) {
                    let cardsRes = userSnap.data().cards
                    localStorage.setItem("user_cards", JSON.stringify(cardsRes))
                    setUserCards(cardsRes)
                }
            }
            fetchData()

            localStorage.setItem("last_usercards_fetch", todayDate)
        }

    }, [])

    useEffect(() => {
        let userCardsObj = JSON.parse(localStorage.getItem("user_cards"));        

        if (Object.keys(wonCard).length > 0) {
            userCardsObj.push(wonCard.id);
            localStorage.setItem('user_cards', JSON.stringify(userCardsObj));
            setUserCards(userCardsObj)
        }

        async function setData() {
            if (Object.keys(wonCard).length > 0) {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    cards: arrayUnion(wonCard.id)
                }
                )
            }
        }
        setData();
    }, [wonCard])

    useEffect(() => {
        let timer;

        if (countdownInProgress && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdownInProgress && countdown === 0) {
            setCountdownInProgress(false);
            setCountdown(3);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [countdown, countdownInProgress]);

    async function buyPack(tier) {
        let coinreq;

        if (tier == "bronze") {
            coinreq = 5_000
        } else if (tier == "silver") {
            coinreq = 20_000
        } else if (tier == "gold") {
            coinreq = 100_000
        } else if (tier == "sapphire") {
            coinreq = 500_000
        }

        if (coins < coinreq) {
            toaster.create({
                description: "Not enough coins",
                type: "error",
                duration: 1000,
            })
            return
        }

        localStorage.setItem("coins", coins - coinreq)
        setCoins(coins - coinreq)
        setCountdownInProgress(true);

        if (tier == "bronze") {
            let silver_probability = 5
            let gold_probability = 2
            let sapphire_probability = 1

            let probab_rand = Math.floor(Math.random() * 1000);
            if (probab_rand < sapphire_probability) {
                tier = "sapphire"
            } else if (probab_rand < gold_probability) {
                tier = "gold"
            } else if (probab_rand < silver_probability) {
                tier = "silver"
            }

        } else if (tier == "silver") {
            let gold_probability = 5
            let sapphire_probability = 1

            let probab_rand = Math.floor(Math.random() * 1000);
            if (probab_rand < sapphire_probability) {
                tier = "sapphire"
            } else if (probab_rand < gold_probability) {
                tier = "gold"
            }

        } else if (tier == "gold") {
            let sapphire_probability = 5

            let probab_rand = Math.floor(Math.random() * 1000);
            if (probab_rand < sapphire_probability) {
                tier = "sapphire"
            }
        }

        setCardTier(tier);
        let rand = 0;

        if (tier == "bronze") {
            rand = Math.floor(Math.random() * bronzeTierLength);
        } else if (tier == "silver") {
            rand = bronzeTierLength + Math.floor(Math.random() * silverTierLength);
        } else if (tier == "gold") {
            rand = bronzeTierLength + silverTierLength + Math.floor(Math.random() * goldTierLength);
        } else if (tier == "sapphire") {
            rand = bronzeTierLength + silverTierLength + goldTierLength + Math.floor(Math.random() * sapphireTierLength);
        }

        let card = allcards.cards[rand];
        setWonCard(card);
    }

    return (
        <VStack maxHeight={"80vh"} overflow="auto">
            <TopBar />
            <Toaster />
            <HStack gap={"20px"} width={"260px"} maxWidth={"260px"} marginTop={4} overflow="auto"  wrap={"wrap"}>

                {userCards && !countdownInProgress && Object.keys(userCards).map(idx =>
                    <Box width='60px' height='60px' marginTop="10px" marginBottom="10px">
                        <Box position={"relative"} width='60px' height='60px'>
                            {allcards.cards[userCards[idx]].tier == "bronze" || allcards.cards[userCards[idx]].tier == "silver" ? <></> :
                                <Image src={`./images/${allcards.cards[userCards[idx]].tier}_badge.png`}
                                    alt={allcards.cards[userCards[idx]].tier}
                                    style={{ position: "absolute", top: '-10px', left: '40px' }}
                                    width='40px' minWidth='40px' height='40px' minHeight='40px'
                                    onClick={() => {
                                        setShowCard(!showCard)
                                        setSelectedShowCard(allcards.cards[userCards[idx]])
                                    }
                                    }
                                />
                            }

                            <Image src={`./images/${allcards.cards[userCards[idx]].image_file}`}
                                alt={allcards.cards[userCards[idx]].image_file}
                                width='60px' minWidth='60px' height='60px' minHeight='60px' borderRadius='20px' backgroundColor={"#e5ce9b"}
                                onClick={() => {
                                    setShowCard(!showCard)
                                    setSelectedShowCard(allcards.cards[userCards[idx]])
                                }
                                }
                            />
                        </Box>
                    </Box>
                )}

            </HStack>

            {showCard && selectedShowCard &&
                <Box style={{ position: 'absolute', top: '20px' }} zIndex={1} onClick={() => setShowCard(!showCard)} backgroundColor={"#e5ce9b"}>
                    <Box display={'flex'} flexDirection={'column'} alignItems={'center'} padding={"20px"}>
                        <Image style={{ position: 'absolute', top: '40px' }} src={`./images/${selectedShowCard.image_file}`} alt={`./images/${selectedShowCard.image_file}`} width={200} />
                        <Image style={{ position: 'relative' }} src={`./images/${selectedShowCard.tier}_CardBase.png`} alt={`${selectedShowCard.tier}_CardBase`} width={260} />
                        <Text style={{ position: 'absolute', top: '242px', fontSize: '16px', color: 'white', fontWeight: '600' }} >{selectedShowCard.title}</Text>
                        <Text style={{ position: 'absolute', top: '286px', fontSize: '10px', color: 'black', maxWidth: '180px' }}>{selectedShowCard.description}</Text>
                    </Box>
                </Box>
            }

            <Box gap='10px' display='flex' flexDirection='column' margin='10px'>
                <HStack gap={"20px"} width={"80vw"} maxWidth={"300px"} marginTop={4} display={"flex"} justifyContent={"flex-start"}>
                    <HStack>
                        <Text>Budget:</Text>
                        <GiTwoCoins />
                        <Text>{coins}</Text>
                    </HStack>

                </HStack>
                <Text>Buy Pack:</Text>


                <HStack wrap={"wrap"} gap={"20px"} >
                    {tierArray.map((tier) => (
                        <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom">
                            <Dialog.Trigger disabled={coins < 5000} asChild>
                                <Button
                                    boxShadow={
                                        tier == "bronze" ? "0px 10px 0px 0px #995c22" : tier == "silver" ?
                                            "0px 10px 0px 0px #8f8b8b" : tier == "gold" ? "0px 10px 0px 0px #c7a800" : "0px 10px 0px 0px #07528f"
                                    }
                                    size="md"
                                    backgroundColor={tier == "bronze" ? "#CE8946" : tier == "silver" ?
                                        "silver" : tier == "gold" ? "gold" : "#0c68b2"}
                                    _hover={{
                                        backgroundColor: 'white',
                                        boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                                        transform: 'translateY(4px)'
                                    }}
                                    _active={{
                                        backgroundColor: 'white',
                                        boxShadow: '0px 8px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                                        transform: 'translateY(4px)'
                                    }}

                                    onClick={() => {
                                        buyPack(tier);
                                    }}>
                                    <Text fontSize={"12px"} color="black"
                                    >{tier == "bronze" ? "Bronze" : tier == "silver" ?
                                        "Silver" : tier == "gold" ? "Gold" : "Sapphire"} {tier == "bronze" ? "5K" : tier == "silver" ?
                                            "20K" : tier == "gold" ? "100K" : "500K"}
                                    </Text>
                                </Button>
                            </Dialog.Trigger>

                            <Dialog.Positioner>
                                <Dialog.Content backgroundColor={"#e5ce9b"}>

                                    <Dialog.CloseTrigger top="-6" insetEnd="-6" asChild>
                                        <CloseButton bg="red" size="xl" />
                                    </Dialog.CloseTrigger>

                                    {countdownInProgress && countdown > 0 ? (
                                        <Box width={"100%"} height={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"} >
                                            <Text fontSize={'200px'}>{countdown}</Text>
                                        </Box>
                                    ) : (
                                        <Dialog.Body>
                                            <Box display="flex" justifyContent={"center"}>
                                                <Image style={{ position: 'absolute', top: '40px' }} src={`./images/${wonCard.image_file}`} alt={`./images/${wonCard.image_file}`} width={200} />
                                                <Image style={{ position: 'absolute', top: '20px' }} src={`./images/${wonCard.tier}_CardBase.png`} alt={`${wonCard.tier}_CardBase`} width={260} />
                                                <Text style={{ position: 'absolute', top: '242px', fontSize: '16px', color: 'white', fontWeight: '600' }} >{wonCard.title}</Text>
                                                <Text style={{ position: 'absolute', top: '286px', fontSize: '10px', color: 'black', maxWidth: '180px' }}>{wonCard.description}</Text>
                                            </Box>
                                        </Dialog.Body>
                                    )}
                                </Dialog.Content>
                            </Dialog.Positioner>
                        </Dialog.Root>))}
                </HStack>
            </Box>
        </VStack>  
    );
};

export default Cards;
