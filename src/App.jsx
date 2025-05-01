import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePublic from './pages/HomePublic'
import HomeTab from './pages/HomeTab'
import Home from './pages/Home'
import NavBar from './components/NavBar'
import DailyDhikr from './pages/DailyDhikr'
import Cards from './pages/Cards'
import { Provider } from "./components/ui/provider"
import AddDhikr from './pages/AddDhikr'
import Account from './pages/Account'
import Rank from "./pages/Rank"
import { useState, useEffect } from 'react'
import { auth } from './firebase'

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
        Loading...
      </div>
    )
  }

  return (
    <Provider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={user ? <HomeTab /> : <HomePublic />}
          />

          {/* <Route
            path="/home"
            element={<Home />}
          /> */}

          <Route path='/dailydhikr' element={<DailyDhikr />} />

          <Route path='/adddhikr' element={<AddDhikr />} />

          <Route
            path="/cards"
            element={user ? <Cards /> : <Account />}
          />

          <Route
            path="/rank"
            element={user ? <Rank /> : <Account />}
          />

          <Route
            path="/cards"
            element={user ? <Cards /> : <Account />}
          />

          <Route
            path="/account" element={<Account />}
          />

        </Routes>
        <NavBar />
      </BrowserRouter>
    </Provider>
  )
}

export default App
