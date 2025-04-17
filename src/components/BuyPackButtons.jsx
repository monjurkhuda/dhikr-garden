
import { useState, useEffect, useRef } from 'react';
import { Image, Box, Text, Button, Dialog, HStack, VStack } from '@chakra-ui/react'
import { Toaster, toaster } from "./ui/toaster"
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import cardsData from "../assets/data/cards.json"
import CardBadge from './CardBadge';
import { GiTwoCoins } from "react-icons/gi";

const BuyPackButtons = () => {
    const user = auth.currentUser

    const [coins, setCoins] = useState(0);
    const [inadequateCoins, setInadequateCoins] = useState(false);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [userinfo, setUserinfo] = useState({});
    const [wonCard, setWonCard] = useState({});
    const [cardTier, setCardTier] = useState("");
    const [countdownInProgress, setCountdownInProgress] = useState(false)

    const tierArray = ["bronze", "silver", "gold", "sapphire"]

    useEffect(() => {
        async function fetchData() {
            const docSnap = await getDoc(doc(db, "users", user.uid));

            if (docSnap.exists()) {
                setUserinfo(docSnap.data())
            } else {
                console.log("No such document!");
            }
            setLoading(false)
        }
        fetchData();

    }, [countdownInProgress])

    useEffect(() => {
        if (userinfo.coins) {
            setCoins(userinfo.coins)
        }
    }, [userinfo])

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

    async function buyPack(tier) {
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
            toaster.create({
                description: "Not enough coins",
                type: "error",
                duration: 1000,
            })
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

    return (
        <>

<HStack gap={"20px"} width={"80vw"} maxWidth={"300px"} marginTop={4} display={"flex"} justifyContent={"flex-start"}>
               
                <HStack>
                <Text>Budget:</Text>
                    <GiTwoCoins />
                    <Text>{coins}</Text>
                </HStack>
            </HStack>

            <Text>Buy Card Packs:</Text>
            <HStack wrap={"wrap"} gap={"20px"}>
                {tierArray.map((tier) => (
                    <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom">
                        <Dialog.Trigger asChild>
                            <Button
                                boxShadow={"0px 10px 0px 0px #2b2b2b"}
                                size="md"
                                backgroundColor={"#383737"}
                                _hover={{
                                    backgroundColor: "#3d092e",
                                    boxShadow: "0px 20px 0px 0px #300524",
                                }}
                                onClick={() => {
                                    buyPack(tier);
                                }}>
                                    <Text fontSize={"12px"} color={tier === "sapphire" ? "#80BC8A" : tier === "bronze" ? "brown" : tier === "gold" ? "gold" : "silver"}
                                    >{tier} {tier == "bronze" ? "1K" : tier == "silver" ?
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
                                    <>
                                        <Dialog.Header>
                                            <Dialog.Title>{wonCard.name}</Dialog.Title>
                                        </Dialog.Header>
                                        <Dialog.Body>

                                            <Box width={300} height={400} display={'flex'} flexDirection={'column'} alignItems={'center'} backgroundColor={"#e5ce9b"}>
                                                <Image style={{ position: 'absolute', top: '70px' }} src={`./images/${wonCard.image_file}`} alt={`./images/${wonCard.image_file}`} width={200} />
                                                <Image style={{ position: 'absolute' }} src={`./images/${wonCard.tier}_CardBase.png`} alt="al_tibb_al_wiqai-al_razi" width={260} />
                                                <Text style={{ position: 'relative', top: '224px', fontWeight: 'bold' }} >{wonCard.title}</Text>
                                                <Text style={{ position: 'relative', fontSize: '12px', color: 'black', top: '250px', maxWidth: '150px', fontWeight: 'bold' }}>{wonCard.description}</Text>
                                            </Box>

                                        </Dialog.Body>
                                    </>
                                )}
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Dialog.Root>
                ))}
            </HStack>
        </>
    );
};

export default BuyPackButtons;

