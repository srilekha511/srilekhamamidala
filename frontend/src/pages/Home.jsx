import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profile as profileData } from '../data'
import './Home.css'

const Home = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // Use local data instead of API call
    setProfile(profileData)
    setLoading(false)
  }, [])

  // Reset typewriter when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayedText('')
      setCurrentIndex(0)
      setShowCursor(true)
    }
  }, [profile])

  // Typewriter effect
  useEffect(() => {
    if (!profile) return

    const fullText = `Hi, I'm ${profile.firstName}`
    
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 100) // Typing speed: 100ms per character
      
      return () => clearTimeout(timeout)
    } else {
      // Blinking cursor effect after typing is complete
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 530)
      
      return () => clearInterval(cursorInterval)
    }
  }, [currentIndex, profile])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!profile) {
    return <div className="error">Failed to load profile</div>
  }

  return (
    <div className="home">
      <section className="hero" style={{backgroundImage: `url(${import.meta.env.BASE_URL}website.webp)`}}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {displayedText}
              <span className="typewriter-cursor">{showCursor ? '|' : ''}</span>
            </h1>
            <p className="hero-subtitle">{profile.role}</p>
            <p className="hero-description">{profile.bio}</p>
            <div className="hero-buttons">
              <Link to="/projects" className="btn btn-primary">
                View My Work
              </Link>
            </div>
            <div className="connect-section">
              <p className="connect-text">Connect with me on:</p>
              <div className="social-icons">
                {profile.social.github && (
                  <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <img src={`${import.meta.env.BASE_URL}github.svg`} alt="GitHub" />
                  </a>
                )}
                {profile.social.linkedin && (
                  <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-linkedin">
                    <img src={`${import.meta.env.BASE_URL}linkedin.svg`} alt="LinkedIn" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

