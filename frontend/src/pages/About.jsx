import { useEffect, useState } from 'react'
import axios from 'axios'
import './About.css'

const About = () => {
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          axios.get('/api/profile'),
          axios.get('/api/skills')
        ])
        setProfile(profileRes.data)
        setSkills(skillsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="about">
      <section className="section">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">Get to know me better</p>
          
          {profile && (
            <div className="about-content">
              <div className="about-text">
                <h3>{profile.name}</h3>
                <p className="about-title">{profile.title}</p>
                <p className="about-bio">{profile.bio}</p>
                <div className="about-details">
                  <div className="detail-item">
                    <strong>Location:</strong> {profile.location}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {profile.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="skills-section">
            <h3 className="skills-title">Skills</h3>
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-percentage">{skill.level}%</span>
                  </div>
                  <div className="skill-bar">
                    <div 
                      className="skill-progress" 
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

