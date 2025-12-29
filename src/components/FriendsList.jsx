import { useState, useEffect } from 'react'
import { getAllUsers } from '../firebase/users'
import './FriendsList.css'

const FriendsList = ({ currentUser, onSelectFriend, evaluatedFriends = [] }) => {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFriends = async () => {
      const allUsers = await getAllUsers()
      // Filter out current user
      const filteredFriends = allUsers.filter(user => user.id !== currentUser.id)
      setFriends(filteredFriends)
      setLoading(false)
    }
    loadFriends()
  }, [currentUser])

  const getImagePath = (name) => {
    return `/images/${name}.jpg`
  }

  if (loading) {
    return (
      <div className="friends-list-container">
        <div className="loading">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="friends-list-container">
      <h2 className="friends-list-title">اختر صديقاً</h2>
      <div className="friends-grid">
        {friends.map((friend) => {
          const isEvaluated = evaluatedFriends.includes(friend.id)
          return (
            <div
              key={friend.id}
              className={`friend-card ${isEvaluated ? 'evaluated' : ''}`}
              onClick={() => !isEvaluated && onSelectFriend(friend)}
            >
              <div className="friend-image-wrapper">
                <img
                  src={getImagePath(friend.name)}
                  alt={friend.name}
                  className={`friend-image ${isEvaluated ? 'evaluated' : ''}`}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="friend-image-placeholder" style={{ display: 'none' }}>
                  {friend.name.charAt(0)}
                </div>
                {isEvaluated && <div className="evaluated-badge">✓</div>}
              </div>
              <p className="friend-name">{friend.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FriendsList

