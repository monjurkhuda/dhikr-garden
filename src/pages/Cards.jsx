import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { VStack, Box, Text, HStack, Image, Dialog, Button } from '@chakra-ui/react'
import { Toaster } from "../components/ui/toaster"
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import cardsData from "../assets/data/cards.json"
import { GiTwoCoins } from "react-icons/gi";
import TopBar from "../components/TopBar"


const Cards = () => {
    const [loading, setLoading] = useState(true);
    const [userinfo, setUserinfo] = useState({});
    const [userCards, setUserCards] = useState({});
    const [showCard, setShowCard] = useState(false);
    const [selectedShowCard, setSelectedShowCard] = useState({});
    const [coins, setCoins] = useState(0);
    const [inadequateCoins, setInadequateCoins] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [wonCard, setWonCard] = useState({});
    const [cardTier, setCardTier] = useState("");
    const [countdownInProgress, setCountdownInProgress] = useState(false)

    const user = auth.currentUser

    const tierArray = ["bronze", "silver", "gold", "sapphire"]

    useEffect(() => {
        async function fetchData() {
            const docSnap = await getDoc(doc(db, "users", user.uid));

            if (docSnap.exists()) {
                setUserinfo(docSnap.data())
            } else {
                console.log("No such document!");
            }
        }
        fetchData();
    }, [wonCard])

    useEffect(() => {
        if (userinfo) {
            setCoins(userinfo.coins)
            setUserCards(userinfo.cards)
        }
        setLoading(false)
    }, [userinfo, wonCard])

    useEffect(() => {
        async function setData() {
            if (Object.keys(wonCard).length > 0) {
                const userRef = doc(db, "users", user.uid);

                await updateDoc(userRef, {
                    [`cards.${cardTier}`]: arrayUnion(wonCard)
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



    // useEffect(() => {
    //     async function fetchData() {
    //         const docSnap = await getDoc(doc(db, "users", user.uid));

    //         if (docSnap.exists()) {
    //             setUserinfo(docSnap.data())
    //         } else {
    //             console.log("No such document!");
    //         }
    //         setLoading(false)
    //     }
    //     fetchData();
    // }, [])

    // useEffect(() => {
    //     async function fetchData() {
    //         const docSnap = await getDoc(doc(db, "users", user.uid));

    //         if (docSnap.exists()) {
    //             setUserinfo(docSnap.data())
    //         } else {
    //             console.log("No such document!");
    //         }
    //         setLoading(false)
    //     }
    //     fetchData();

    // }, [countdownInProgress])

    // useEffect(() => {
    //     if (userinfo.coins) {
    //         setCoins(userinfo.coins)
    //     }
    // }, [userinfo])

    // useEffect(() => {
    //     let timer;

    //     if (countdownInProgress && countdown > 0) {
    //         timer = setTimeout(() => {
    //             setCountdown(countdown - 1);
    //         }, 1000);
    //     } else if (countdownInProgress && countdown === 0) {
    //         setCountdownInProgress(false);
    //         setCountdown(3);
    //     }

    //     return () => {
    //         if (timer) {
    //             clearTimeout(timer);
    //         }
    //     };
    // }, [countdown, countdownInProgress]);

    // useEffect(() => {
    //     async function setData() {
    //         if (Object.keys(wonCard).length > 0) {
    //             const userRef = doc(db, "users", user.uid);

    //             await updateDoc(userRef, {
    //                 [`cards.${cardTier}`]: arrayUnion(wonCard)
    //             }
    //             )
    //         }
    //     }
    //     setData();
    // }, [wonCard])



    async function buyPack(tier) {

        console.log(tier)

        let coinreq;

        if (tier == "bronze") {
            coinreq = 1_000
        } else if (tier == "silver") {
            coinreq = 5_000
        } else if (tier == "gold") {
            coinreq = 20_000
        } else if (tier == "sapphire") {
            coinreq = 100_000
        }

        if (userinfo.coins < coinreq) {
            setInadequateCoins(true)
            return
        }

        await updateDoc(doc(db, "users", user.uid), {
            coins: increment(-coinreq)
        });

        setCoins(userinfo.coins - coinreq)
        setCountdownInProgress(true);

        if (tier == "bronze") {
            let silver_probability = 10
            let gold_probability = 5
            let sapphire_probability = 1

            let probab_rand = Math.floor(Math.random() * 100);
            console.log(probab_rand)
            if (probab_rand < sapphire_probability) {
                tier = "sapphire"
            } else if (probab_rand < gold_probability) {
                tier = "gold"
            } else if (probab_rand < silver_probability) {
                tier = "silver"
            }

        } else if (tier == "silver") {
            let gold_probability = 10
            let sapphire_probability = 5

            let probab_rand = Math.floor(Math.random() * 100);
            if (probab_rand < sapphire_probability) {
                tier = "sapphire"
            } else if (probab_rand < gold_probability) {
                tier = "gold"
            }

        } else if (tier == "gold") {
            let sapphire_probability = 10

            let probab_rand = Math.floor(Math.random() * 100);
            if (probab_rand < sapphire_probability) {
                tier = "sapphire"
            }
        }

        setCardTier(tier);
        let rand = Math.floor(Math.random() * cardsData[tier].length);
        let card = cardsData[tier][rand];
        setWonCard(card);
    }

    if (loading) { return <Text>Loading...</Text> }

    console.log(wonCard)

    return (
        <VStack>
            <TopBar/>
            <HStack maxWidth={"340px"} maxHeight={"60vh"} overflow="auto" wrap={"wrap"}>
                {userCards && !countdownInProgress && Object.keys(userCards).map(tier =>
                    userCards[tier].map(card =>
                        <Box width='60px' height='60px' margin="6px">
                            <Box position={"relative"} width='60px' height='60px'>
                                {tier == "bronze" || tier == "silver" ? <></> :
                                    <Image src={`./images/${card.tier}_badge.png`}
                                        alt={card.tier}
                                        style={{ position: "absolute", top: '-10px', left: '40px' }}
                                        width='40px' minWidth='40px' height='40px' minHeight='40px'
                                        onClick={() => {
                                            setShowCard(!showCard)
                                            setSelectedShowCard(card)
                                        }
                                        }
                                    />
                                }

                                <Image src={`./images/${card.image_file}`}
                                    alt={card.image_file}
                                    width='60px' minWidth='60px' height='60px' minHeight='60px' borderRadius='20px' backgroundColor={"#e5ce9b"}
                                    onClick={() => {
                                        setShowCard(!showCard)
                                        setSelectedShowCard(card)
                                    }
                                    }
                                />
                            </Box>
                        </Box>
                    )
                )}
            </HStack>

            {showCard && selectedShowCard &&
                <Box style={{ position: 'absolute', top: '20px' }} zIndex={1} onClick={() => setShowCard(!showCard)} backgroundColor={"#e5ce9b"}>
                    <Box display={'flex'} flexDirection={'column'} alignItems={'center'} padding={"20px"}>
                        <Image style={{ position: 'absolute', top: '40px' }} src={`./images/${selectedShowCard.image_file}`} alt={`./images/${selectedShowCard.image_file}`} width={200} />
                        <Image style={{ position: 'relative' }} src={`./images/${selectedShowCard.tier}_CardBase.png`} alt={`${selectedShowCard.tier}_CardBase`} width={260} />
                        <Text style={{ position: 'absolute', top: '238px', fontSize: '18px', color: 'white', fontWeight: '600', letterSpacing: '1px' }} >{selectedShowCard.title}</Text>
                        <Text style={{ position: 'absolute', top: '286px', fontSize: '12px', color: 'black', maxWidth: '180px', fontWeight: 'bold' }}>{selectedShowCard.description}</Text>
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
            

            <HStack wrap={"wrap"} gap={"20px"}>
                {tierArray.map((tier) => (
                    <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom">
                        <Dialog.Trigger asChild>
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
                                    "Silver" : tier == "gold" ? "Gold" : "Sapphire"} {tier == "bronze" ? "1K" : tier == "silver" ?
                                        "5K" : tier == "gold" ? "20K" : "100K"}
                                </Text>
                            </Button>
                        </Dialog.Trigger>

                        <Dialog.Positioner>
                            <Dialog.Content backgroundColor={"#e5ce9b"}>
                                {inadequateCoins ? (
                                    <Text fontSize="24px">You don't have enough coins</Text>
                                ) : countdownInProgress && countdown > 0 ? (
                                    <Box width={"100%"} height={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"} >
                                        <Text fontSize={'200px'}>{countdown}</Text>
                                    </Box>
                                ) : (
                                    <Dialog.Body>
                                        <Box onClick={() => setShowCard(!showCard)} display="flex" justifyContent={"center"}>
                                            <Image style={{ position: 'absolute', top: '40px' }} src={`./images/${wonCard.image_file}`} alt={`./images/${wonCard.image_file}`} width={200} />
                                            <Image style={{ position: 'absolute', top: '20px' }} src={`./images/${wonCard.tier}_CardBase.png`} alt={`${wonCard.tier}_CardBase`} width={260} />
                                            <Text style={{ position: 'absolute', top: '238px', fontSize: '18px', color: 'white', fontWeight: '600', letterSpacing: '1px' }} >{wonCard.title}</Text>
                                            <Text style={{ position: 'absolute', top: '286px', fontSize: '12px', color: 'black', maxWidth: '180px', fontWeight: 'bold' }}>{wonCard.description}</Text>
                                        </Box>
                                    </Dialog.Body>
                                )}
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Dialog.Root>))}
            </HStack>
            </Box>

        </VStack>

        


        // <VStack width={"100vw"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
        //     <Toaster />

        //     <HStack maxWidth={"320px"} wrap={"wrap"}>
        //         {Object.keys(userinfo.cards).map(tier =>
        //             userinfo.cards[tier].map(card =>
        //                 <Box>
        //                     <Image src={`./images/${card.image_file}`}
        //                         alt={card.image_file}

        //                         width='60px' minWidth='60px' height='60px' minHeight='60px' borderRadius='20px' border="4px dotted"
        //                         borderColor={card.tier === 4 ? "#80BC8A" : card.tier === 1 ? "brown" : card.tier === 3 ? "gold" : "silver"}
        //                         onClick={() => {
        //                             setShowCard(!showCard)
        //                             setSelectedShowCard(card)
        //                         }
        //                         }
        //                     />
        //                 </Box>
        //             )
        //         )}
        //     </HStack>

        //     {showCard && selectedShowCard &&
        //         <Box style={{ position: 'absolute', top: '20px' }} zIndex={1} onClick={() => setShowCard(!showCard)} backgroundColor={"#e5ce9b"}>
        //             <Box display={'flex'} flexDirection={'column'} alignItems={'center'} padding={"20px"}>
        //                 <Image style={{ position: 'absolute', top: '40px' }} src={`./images/${selectedShowCard.image_file}`} alt={`./images/${selectedShowCard.image_file}`} width={200} />
        //                 <Image style={{ position: 'relative' }} src={`./images/${selectedShowCard.tier}_CardBase.png`} alt={`${selectedShowCard.tier}_CardBase`} width={260} />
        //                 <Text style={{ position: 'absolute', top: '238px', fontSize: '18px', color: 'white', fontWeight: '600', letterSpacing: '1px' }} >{selectedShowCard.title}</Text>
        //                 <Text style={{ position: 'absolute', top: '286px', fontSize: '12px', color: 'black', maxWidth: '180px', fontWeight: 'bold' }}>{selectedShowCard.description}</Text>

        //             </Box>
        //         </Box>
        //     }

        //     <Box gap='10px' display='flex' flexDirection='column' margin='10px'>
        //         <HStack gap={"20px"} width={"80vw"} maxWidth={"300px"} marginTop={4} display={"flex"} justifyContent={"flex-start"}>
        //             <HStack>
        //                 <Text>Budget:</Text>
        //                 <GiTwoCoins />
        //                 <Text>{coins}</Text>
        //             </HStack>
        //         </HStack>

        //         <Text>Buy Card Packs:</Text>
        //         <HStack wrap={"wrap"} gap={"20px"}>
        //             {tierArray.map((tier) => (
        //                 <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom">
        //                     <Dialog.Trigger asChild>
        //                         <Button
        //                             boxShadow={"0px 10px 0px 0px #2b2b2b"}
        //                             size="md"
        //                             backgroundColor={"#383737"}
        //                             _hover={{
        //                                 backgroundColor: "#3d092e",
        //                                 boxShadow: "0px 20px 0px 0px #300524",
        //                             }}
        //                             onClick={() => {
        //                                 buyPack(tier);
        //                             }}>
        //                             <Text fontSize={"12px"} color={tier === "sapphire" ? "#80BC8A" : tier === "bronze" ? "brown" : tier === "gold" ? "gold" : "silver"}
        //                             >{tier} {tier == "bronze" ? "1K" : tier == "silver" ?
        //                                 "5K" : tier == "gold" ? "20K" : "100K"}
        //                             </Text>
        //                         </Button>
        //                     </Dialog.Trigger>

        //                     <Dialog.Positioner>
        //                         <Dialog.Content backgroundColor={"#e5ce9b"}>
        //                             {inadequateCoins ? (
        //                                 <Text fontSize="24px">You don't have enough coins</Text>
        //                             ) : countdownInProgress && countdown > 0 ? (
        //                                 <Box width={"100%"} height={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"} >
        //                                     <Text fontSize={'200px'}>{countdown}</Text>
        //                                 </Box>
        //                             ) : (
        //                                 <Dialog.Body>
        //                                     <Box onClick={() => setShowCard(!showCard)} display="flex" justifyContent={"center"}>
        //                                         <Image style={{ position: 'absolute', top: '40px' }} src={`./images/${wonCard.image_file}`} alt={`./images/${wonCard.image_file}`} width={200} />
        //                                         <Image style={{ position: 'absolute', top: '20px' }} src={`./images/${wonCard.tier}_CardBase.png`} alt={`${wonCard.tier}_CardBase`} width={260} />
        //                                         <Text style={{ position: 'absolute', top: '238px', fontSize: '18px', color: 'white', fontWeight: '600', letterSpacing: '1px' }} >{selectedShowCard.title}</Text>
        //                                         <Text style={{ position: 'absolute', top: '286px', fontSize: '12px', color: 'black', maxWidth: '180px', fontWeight: 'bold' }}>{selectedShowCard.description}</Text>
        //                                     </Box>
        //                                 </Dialog.Body>
        //                             )}
        //                         </Dialog.Content>
        //                     </Dialog.Positioner>
        //                 </Dialog.Root>
        //             ))}
        //         </HStack>
        //     </Box>
        // </VStack >
    );
};

export default Cards;
