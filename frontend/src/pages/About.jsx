import { useEffect, useState } from 'react'
import axios from 'axios'
import './About.css'

const About = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/profile')
        setProfile(response.data)
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
            <>
              <div className="about-header">
                <div className="about-header-text">
                  <h3 className="about-name">{profile.fullName}</h3>
                  <p className="about-role">{profile.fullRole}</p>
                </div>
                {profile.headshot && (
                  <div className="about-headshot">
                    <img src={profile.headshot} alt={profile.fullName} />
                  </div>
                )}
              </div>

              <div className="about-sections-grid">
                <div className="about-section-card">
                  <h4 className="section-card-title">Education</h4>
                  <p className="section-card-content">
                    Massachusetts Institute of Technology (MIT)
                    Bachelor of Science in Computer Science, Data Science, and Economics

                    Relevant Coursework:
                    Data Structures and Algorithms, Machine Learning, Econometrics, Game Theory, Linear Algebra, Optimization for Business Analytics, Probability and Statistics
                   
                  </p>
                </div>

                <div className="about-section-card">
                  <h4 className="section-card-title">Work and Research Experience</h4>
                  <p className="section-card-content">
                    Detail your professional work experience, internships, research projects, and contributions here.
                  </p>
                </div>

                <div className="about-section-card">
                  <h4 className="section-card-title">Leadership Experience</h4>
                  <p className="section-card-content">
                    Describe your leadership roles, extracurricular activities, clubs, organizations, and initiatives here.
                  </p>
                </div>

                <div className="about-section-card">
                  <h4 className="section-card-title">Awards and Achievements</h4>
                  <p className="section-card-content">
                  Samuel A. Green Scholarship Recipient May 2024: Awarded a $20,000 scholarship for demonstrating leadership potential and commitment to making a substantial impact in one's community.
                  Math Prize for Girls Invitee September 2023: Selected as one of top 250 girls in the US and Canada to participate in the Math Prize for Girls competition at MIT.
                  3-time International Science and Engineering Fair (ISEF) Finalist (2021, 2023, 2024): 
                  
                  
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default About

