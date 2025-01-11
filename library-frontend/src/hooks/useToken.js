import { useEffect, useState } from "react"

const useToken = () => {
  const [token, setToken] = useState()

  useEffect(() => {
    const storedToken = localStorage.getItem("library-user-token")
    setToken(storedToken || null)
  }, [])

  const saveToken = (newToken) => {
    localStorage.setItem("library-user-token", newToken)
    setToken(newToken)
  }

  const clearToken = () => {
    localStorage.removeItem("library-user-token")
    setToken(null)
  }

  return { token, saveToken, clearToken }
}

export default useToken