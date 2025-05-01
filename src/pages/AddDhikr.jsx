import React, { useEffect, useState } from 'react'
import { Text, Tag, VStack, Accordion, Button, Stack, HStack } from '@chakra-ui/react'
import { Toaster, toaster } from "../components/ui/toaster"
import TopBar from "../components/TopBar"

import adhkarData from "../assets/data/adhkar.json"
let adhkarTypes = []
let filtered_adhkar = [];

adhkarData.adhkar.forEach(adhkar => {
    if (!adhkarTypes.includes(adhkar.type)) {
        adhkarTypes.push(adhkar.type)
    }
})


function AddDhikr() {
    const [selectedType, setSeletedType] = useState("short")
    const [value, setValue] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        filtered_adhkar = adhkarData.adhkar.filter(obj => obj.type == selectedType)
        setValue(filtered_adhkar[0].translation)
        setLoading(false)
    }, [selectedType])

    if (loading) return <>Loading...</>

    return (
        <Stack paddingTop={4} paddingRight={4} paddingLeft={4}>
            <Toaster />
            <TopBar />
            <Text>Choose Istighfar Length:</Text>

            <HStack wrap="wrap">
                {adhkarTypes.map(type => {
                    return (
                        <>
                            {type === selectedType ? <Tag.Root colorPalette="green" size="lg" onClick={() => setSeletedType(type)}>
                                <Tag.Label>{type}</Tag.Label>
                            </Tag.Root> : <Tag.Root size="lg" onClick={() => setSeletedType(type)}>
                                <Tag.Label>{type}</Tag.Label>
                            </Tag.Root>}
                        </>
                    )
                })}
            </HStack>

            <VStack>
                <HStack width="100%" display="flex" justifyContent="space-between">
                    <Text>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</Text>
                    <HStack>
                        <Text>Press </Text>

                        <Text backgroundColor='#87e307'
                            color='black'
                            boxShadow='0px 6px 0px 0px #71ba0b'
                            width="20px"
                            height="20px"
                            textAlign="center"
                            fontSize="18px">+</Text>
                        <Text> to Add Istighfar</Text>
                    </HStack>
                </HStack>

                <Accordion.Root collapsible paddingBottom={20} overflowY={"scroll"} maxHeight={"70vh"}>
                    {filtered_adhkar.map((item, index) => (
                        <Accordion.Item key={item.id} value={item.translation}>

                            <HStack padding="10px">
                                <Accordion.ItemTrigger display={"flex"} justifyContent={"space-between"}>
                                    <Text>{item.transliteration}</Text>
                                    <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>

                                <Button onClick={() => {
                                        let dailyAdhkarString = localStorage.getItem("daily_adhkar");                                        
                                        let dailyAdhkarObj = JSON.parse(dailyAdhkarString);
                                        localStorage.setItem("last_repeat_date", "");

                                        dailyAdhkarObj[item.id] = {
                                            type: item.type,
                                            arabic: item.arabic,
                                            translation: item.translation,
                                            transliteration: item.transliteration,
                                            benefits: item.benefits,
                                            repetition: 1,
                                            repeated_today: 0
                                        };
                                        localStorage.setItem('daily_adhkar', JSON.stringify(dailyAdhkarObj));

                                    toaster.create({
                                        description: "Dhikr Added!",
                                        type: "success",
                                        duration: 500,
                                    })
                                }}
                                    size="xs"
                                    backgroundColor='#87e307'
                                    color='black'
                                    boxShadow='0px 6px 0px 0px #71ba0b'

                                    _active={{
                                        backgroundColor: 'white',
                                        boxShadow: '0px 2px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff',
                                        transform: 'translateY(4px)'
                                    }}
                                    _hover={{ backgroundColor: 'white', boxShadow: '0px 2px 0px 0px lightgray, 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px #fff, 0 0 30px #fff' }}
                                >
                                    <Text color="black" fontSize="24px" fontWeight='800'>+</Text>
                                </Button>
                            </HStack>

                            <Accordion.ItemContent>
                                <Accordion.ItemBody>{item.arabic}</Accordion.ItemBody>
                                <Accordion.ItemBody>Translation: {item.translation}</Accordion.ItemBody>
                                <Accordion.ItemBody>Benefits: {item.benefits}</Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>

            </VStack>

        </Stack>
    );
}

export default AddDhikr;
