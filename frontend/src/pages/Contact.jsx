import { useEffect, useState } from 'react'
import axios from 'axios'
import './Contact.css'

const Contact = () => {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState('')

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, you would send this to your backend
    setStatus('Thank you for your message! I\'ll get back to you soon.')
    setFormData({ name: '', email: '', message: '' })
    setTimeout(() => setStatus(''), 5000)
  }

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

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  required
                ></textarea>
              </div>
              {status && <div className="form-status">{status}</div>}
              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

