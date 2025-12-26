import { useEffect, useState } from 'react'
import axios from 'axios'
import './Contact.css'

const Contact = () => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile')
        setProfile(response.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }, [])


  return (
    <div className="contact">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">I'd love to hear from you</p>
          
          <div className="contact-content">
            <div className="contact-info">
              <h3>Contact Information</h3>
              {profile && (
                <>
                  <div className="info-item">
                    <strong>Email:</strong>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </div>
                  <div className="info-item">
                    <strong>Location:</strong>
                    <span>{profile.location}</span>
                  </div>
                  <div className="social-section">
                    <h4>Connect with me</h4>
                    <div className="social-buttons">
                      {profile.social.github && (
                        <a 
                          href={profile.social.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-button"
                        >
                          GitHub
                        </a>
                      )}
                      {profile.social.linkedin && (
                        <a 
                          href={profile.social.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-button"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

