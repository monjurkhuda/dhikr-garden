import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import HomePublic from './pages/HomePublic'
import NavBar from './components/NavBar'
import Account from './pages/Account'
import DailyDhikr from './pages/DailyDhikr'
import Cards from './pages/Cards'
import Rank from './pages/Rank'
import { Provider } from "./components/ui/provider"
import { auth } from './firebase'
import AddDhikr from './pages/AddDhikr'
import { useState, useEffect } from 'react'
import { FaTruckLoading } from "react-icons/fa";
import TopBar from './components/TopBar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaTruckLoading />
      </div>
    )
  }

  return (
    <Provider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={user ? <Home /> : <HomePublic />}
          />

          <Route path='/dailydhikr' element={<DailyDhikr />} />

          <Route path='/account' element={<Account />} />

          <Route path='/adddhikr' element={<AddDhikr />} />

          <Route
            path="/rank"
            element={user ? <Rank /> : <Account />}
          />

          <Route
            path="/cards"
            element={user ? <Cards /> : <Account />}
          />

        </Routes>
        <NavBar />
      </BrowserRouter>
    </Provider>
  )
}

export default App
