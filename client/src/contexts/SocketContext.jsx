

import { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`)

    newSocket.on("connect", () => {
      setConnected(true)
      console.log("Connected to server")
    })

    newSocket.on("disconnect", () => {
      setConnected(false)
      console.log("Disconnected from server")
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const value = {
    socket,
    connected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
