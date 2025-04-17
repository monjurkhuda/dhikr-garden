import React, { useState } from 'react';
import {  createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut } from "firebase/auth";
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Text, Button, Flex, VStack, HStack } from '@chakra-ui/react'
import { Toaster, toaster } from "../components/ui/toaster"
import regions from "../assets/data/regions.json"
import countries from "../assets/data/countries.json"

function Account() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [morningEveningSplit, setMorningEveningSplit] = useState(localStorage.getItem("morning_evening_split") === "true" || false)
  const [dailyAdhkar, setDailyAdhkar] = useState(JSON.parse(localStorage.getItem("daily_adhkar")) || {});
  const [coins, setCoins] = useState(JSON.parse(localStorage.getItem("coins")) || 0);

  const [usercountry, setUserCountry] = useState('');
  const [username, setUsername] = useState('');
  const [usercity, setUserCity] = useState('');

  const user = auth.currentUser

  const handleAuth = async () => {
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(db, "users", userId), {
          coins: coins,
          streak: 0,
          morning_evening_split: morningEveningSplit,
          cards: {
            sapphire: [],
            gold: [],
            silver: [],
            bronze: []
          }
        });

        await setDoc(doc(db, "daily_adhkar", userId), {
          last_repeat_date: "",
          last_complete_date: "",
          daily_adhkar: dailyAdhkar,
        });

        await setDoc(doc(db, "leaderboard", userId), {
          coins: 0,
          name: username,
          country: usercountry,
          region: usercity
        });

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          if (coins > 0) {
            await updateDoc(doc(db, "users", userId), {
              coins: increment(coins),
            });            
          }          
        } else {
          console.log("No such document!");
        }        
      }
    } catch (error) {

      toaster.create({
        description: error.code,
        type: "error",
        duration: 2000,
      })

      if (error.code === 'auth/email-already-in-use') {
        console.error('Error: This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        console.error('Error: Invalid email format.');
      } else if (error.code === 'auth/weak-password') {
        console.error('Error: Password should be at least 6 characters.');
      } else if (error.code === 'auth/user-not-found') {
        console.error('Error: User not found.');
      } else if (error.code === 'auth/wrong-password') {
        console.error('Error: Wrong password.');
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  const handleSignOut = () => {
    localStorage.clear()
    signOut(auth);
  };

  if (user) {
    return (
    <Flex justifyContent={"center"} paddingTop={"100px"}>
    <Button onClick={() => handleSignOut()}>
      Sign Out
    </Button>
    </Flex>)
  }

  return (
    <VStack>
      <Toaster />

      <Text fontSize="2xl" fontWeight="bold" marginTop={"20px"}>{isRegistering ? 'Register' : 'Sign In'}</Text>

      <VStack>
        <input
          style={{ marginTop: "20px", height: "30px", width: "240px" }}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={{ marginTop: "20px", height: "30px", width: "240px" }}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isRegistering &&
          <>
            <input
              style={{ marginTop: "20px", height: "30px", width: "240px" }}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <select
              style={{ marginTop: "20px", height: "30px", width: "240px" }}
              value={usercountry}
              onChange={(e) => setUserCountry(e.target.value)}>
              <option value="">Select a Country</option>
              {Object.entries(countries).map(([code, country]) => (
                <option key={code} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </>
        }

        {isRegistering && usercountry && regions[usercountry] &&
          <select
            style={{ marginTop: "20px", height: "30px", width: "240px" }}
            disabled={!usercountry}
            value={usercity}
            onChange={(e) => setUserCity(e.target.value)}>
            <option value="">City/Region/Province/Territory</option>
            {regions[usercountry].map((region, index) => (
              <option key={index} value={region}>
                {region}
              </option>
            ))}
          </select>}


      </VStack>

      <HStack marginTop="20px">
        {isRegistering &&
          <Button onClick={handleAuth}
            disabled={!isRegistering || !email || !password || !username || !usercountry || !usercity}
          >Register</Button>
        }

        {!isRegistering && <Button onClick={handleAuth}>Sign In</Button>}

        <Button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Sign In' : 'Register'}
        </Button>
      </HStack>

    </VStack>
  );
}

export default Account;