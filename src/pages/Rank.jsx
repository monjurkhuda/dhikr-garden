import React, { useEffect, useState, useRef } from 'react';
import { Table, Text, Box, VStack } from '@chakra-ui/react'
import { auth, db } from '../firebase';
import { getDocs, collection, updateDoc, doc} from "firebase/firestore";
import Flags from 'country-flag-icons/react/3x2'
import flagcodes from "../assets/data/flags.json"
import TopBar from "../components/TopBar"

const Rank = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([])
  const [playerRank, setPlayerRank] = useState(1)
  const [coins, setCoins] = useState(Number(localStorage.getItem("coins")) || 0);

  const itemRefs = useRef({});

  //localStorage.setItem("last_leaderboard_fetch", "4/20/2025")

  const todayDate = new Date().toLocaleDateString();
  const user = auth.currentUser;
  let leaderboardArray = [];

  useEffect(() => {
    async function fetchData() {
      if (localStorage.getItem("last_leaderboard_fetch") != todayDate) {
        const leaderboardSnapshot = await getDocs(collection(db, "leaderboard"));
        leaderboardSnapshot.forEach((snap) => {
          if (snap.id !== user.uid) {
            leaderboardArray.push({ ...snap.data(), id: snap.id });
          } else {
            if (coins < snap.data().coins) {
              localStorage.setItem("coins", snap.data().coins)
              setCoins(snap.data().coins)
            } else {
              const leaderboardRef = doc(db, "leaderboard", user.uid)
              updateDoc(leaderboardRef, {
                coins: coins,
              });
            }

            localStorage.setItem("username", snap.data().name)
            localStorage.setItem("country", snap.data().country)
            localStorage.setItem("region", snap.data().region)
          }
        });

        localStorage.setItem("last_leaderboard_fetch", todayDate)
        localStorage.setItem("leaderboard", JSON.stringify(leaderboardArray));
      }

      leaderboardArray = JSON.parse(localStorage.getItem("leaderboard"));
      leaderboardArray.unshift({ region: localStorage.getItem("region"), name: localStorage.getItem("username"), country: localStorage.getItem("country"), id: user.uid, coins: coins });
      leaderboardArray.sort((a, b) => b.coins - a.coins);
      setLeaderboard(leaderboardArray)

      leaderboardArray.forEach((entry, index) => {
        if (entry.id == user.uid) {
          setPlayerRank(index + 1)
        }
      }
      )
      setLoading(false)
    }
    fetchData();
  }, [])

  const Flag = ({ countryCode }) => {
    const FlagComponent = Flags[countryCode.toUpperCase()];
    return <FlagComponent width={"20px"} />;
  };

  if (loading) return <>Loading...</>

  return (
    <Box display={"flex"} justifyContent={"center"} maxHeight={"80vh"} overflow="auto">
      <VStack>
        <TopBar />
        <Table.Root size="lg" maxWidth={"320px"} striped>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader></Table.ColumnHeader>
              <Table.ColumnHeader>Rank</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Points</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {user.uid && leaderboard.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{flagcodes[item.country] == "OO" ? <Text>🏴</Text> : <Flag countryCode={flagcodes[item.country]} />}</Table.Cell>
                <Table.Cell backgroundColor={leaderboard[index].id === user.uid ? "#cc9600" : ""} fontWeight={leaderboard[index].id === user.uid ? "700" : "200"} >{index + 1}</Table.Cell>
                <Table.Cell backgroundColor={leaderboard[index].id === user.uid ? "#cc9600" : ""} fontWeight={leaderboard[index].id === user.uid ? "700" : "200"}>{item.name} </Table.Cell>
                <Table.Cell backgroundColor={leaderboard[index].id === user.uid ? "#cc9600" : ""} textAlign="end" fontWeight={leaderboard[index].id === user.uid ? "700" : "200"}>{item.coins}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </VStack>
    </Box>
  );
};

export default Rank;
