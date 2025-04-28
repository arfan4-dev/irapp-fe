import  { useState } from 'react'

const useUsername = () => {
    const [userIdToUsername, setUserIdToUsername] = useState<Record<string, string>>({});


  return {
    userIdToUsername,
    setUserIdToUsername,
  }
}

export default useUsername