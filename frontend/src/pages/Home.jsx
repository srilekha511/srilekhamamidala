import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Home.css'

const Home = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile')
        setProfile(response.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!profile) {
    return <div className="error">Failed to load profile</div>
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Hi, I'm <span className="highlight">{profile.name}</span>
            </h1>
            <p className="hero-subtitle">{profile.title}</p>
            <p className="hero-description">{profile.bio}</p>
            <div className="hero-buttons">
              <Link to="/projects" className="btn btn-primary">
                View My Work
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get In Touch
              </Link>
            </div>
            <div className="social-links">
              {profile.social.github && (
                <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="social-link">
                  GitHub
                </a>
              )}
              {profile.social.linkedin && (
                <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

