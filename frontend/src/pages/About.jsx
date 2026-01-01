import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import './About.css'

const TypewriterHeading = ({ text, className }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const headingRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
          }
        })
      },
      { threshold: 0.5 }
    )

    const currentObserver = observerRef.current
    const currentElement = headingRef.current

    if (currentElement) {
      currentObserver.observe(currentElement)
    }

    return () => {
      if (currentElement && currentObserver) {
        currentObserver.unobserve(currentElement)
      }
    }
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 100) // Typing speed: 100ms per character

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, hasStarted])

  return (
    <h4 ref={headingRef} className={className}>
      {displayedText}
    </h4>
  )
}

const ExpandableItem = ({ title, place, date, description }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="expandable-item">
      <button 
        className="expandable-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="expandable-header-content">
          <div className="expandable-title-section">
            <span className="expandable-title">{title}</span>
            {date && <span className="expandable-date"> • {date}</span>}
          </div>
          {place && (
            <div className="expandable-place-line">
              <span className="expandable-place">{place}</span>
            </div>
          )}
        </div>
        <span className={`expandable-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="expandable-content">
          <p>{description}</p>
        </div>
      )}
    </div>
  )
}

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

  // Data structures for different sections
  const educationData = {
    institution: "Massachusetts Institute of Technology (MIT)",
    major: "Computer Science, Data Science, and Economics",
    coursework: ["Data Structures and Algorithms", "Machine Learning", "Econometrics", "Game Theory", "Linear Algebra", "Optimization for Business Analytics", "Probability and Statistics"],
    teaching: "Teaching Assistant (TA) for Physics: Electricity and Magnetism"
  }

  const workExperience = [
    { title: "Venture Associate Intern", place: "525 Venture Capital Firm", date: "December 2025 - Present", description: "Developing an AI-powered system that reviews founder calls, applications, and pitch decks to create initial deal memos and SWOT analyses, while learning from past decisions to flag risks and guide investment choices." },
    { title: "Research Intern", place: "MIT Computer Science and Artificial Intelligence Lab (CSAIL), Decentralized Information Group", date: "September 2024 - Present", description: "Boosted insurance communication efficiency by 60%+ by developing mathematical metrics for evaluating 10+ LLMs with Liberty Mutual and designing human/LLM studies using 300+ ratings to create auto-evaluation metrics for Agentic AI models." },
    { title: "Software Engineering Intern", place: "Earthian AI", date: "June 2025 - August 2025", description: "Built a full-stack AI chatbot using PyTorch, FastAPI, AWS, and React to improve climate risk analysis and insurance workflows, optimize decision-making by 70% time reduction, and handle real-world queries across energy and risk use cases." },
    { title: "Finance and Operations Intern", place: "Majira Project", date: "December 2024 - January 2025", description: "Enhanced fundraising and sourcing efforts by analyzing alumni company KPIs in Tableau, building financial models and an investment database, and executing a digital media campaign to raise awareness among donors, candidates, and partners." },
    { title: "Research Intern", place: "MIT Election Data Science Lab", date: "December 2024 - January 2025", description: "Transformed unstructured election legislation data into knowledge graphs and classified 500+ bills while processing 10K+ legislative transcripts with Python and R to analyze policy outcomes and stakeholder influence." },
    { title: "Product Management Intern, Technical Writer", place: "Eztia", date: "June 2023 - August 2023", description: "Analyzed 15+ health-tech sources and 50+ user feedback points to identify content gaps in medical cooling tech, proposed new blog series, and produced 10+ posts reaching 500+ customers and investors in under three months." },
    { title: "Software Engineering Intern", place: "Vertiq", date: "June 2023 - August 2023", description: "Developed software for testing propulsion robotics motors using Python, C++, ROS, and hardware tools, and presented applications to clients, boosting product adoption by over 50%." }
  ]

  const leadershipExperience = [
    { title: "Logistics Coordinator", place: "HackMIT 2025", date: "September 2024 - Present", description: "Managed logistics for one of the nation's largest undergraduate hackathons, coordinating lodging, hacker communications, and initiatives to maximize the hacker experience." },
    { title: "Board Representative, Career Development Committee", place: "MIT Society of Women Engineers (SWE) Chapter", date: "September 2024 - Present", description: "Led the SWE Annual Career Fair, coordinate industry info sessions, and develop workshops on communication, advocacy, and career exploration for club members." },
    { title: "Treasurer", place: "MIT IEEE/ACM Chapter", date: "September 2024 - Present", description: "Managed budget and led coordination with MIT administration to optimally allocate resources engaging 1,000+ MIT EECS students through faculty dinners, social events, and more." },
    { title: "Publicity/Marketing Chair", place: "MIT Undergraduate Research and Technology Conference", date: "September 2024 - Present", description: "Designed the conference logo and sponsorship and promotional materials for the largest-ever iteration of the conference, supporting and elevating student research." }
  ]

  const awards = [
    { title: "Samuel A. Green Scholarship Winner", place: "", date: "May 2024", description: "Awarded a $20,000 scholarship for demonstrating leadership potential and commitment to making a substantial impact in one's community." },
    { title: "Math Prize for Girls Invitee", place: "", date: "September 2023", description: "Selected as one of top 250 girls in the US and Canada to participate in the Math Prize for Girls competition at MIT." },
    { title: "3-time International Science and Engineering Fair (ISEF) Finalist", place: "", date: "2021, 2023, 2024", description: "Awarded for excellence in computer science (machine learning) research. 2024 Association for Computing Machinery $2,500 Special Award Winner." },
    { title: "National Junior Humanities and Science Symposium 1st Place Winner", place: "", date: "May 2022", description: "Awarded for excellence for machine learning-powered computational drug repurposing research." },
    { title: "Winner at University of Pennsylvania Pennapps Hackathon", place: "", date: "September 2023", description: "Developed a computer vision application for more accurate screening of dermatological conditions." },
    { title: "4-time American Invitational Mathematics Examination (AIME) Qualification", place: "", date: "September 2020-2024", description: "Qualified in the top 5% of test takers in the United States. Recognized as one of the top 5 girls in the Delaware Valley region." }
  ]
  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="about">
      <section className="section">
        <div className="container">
          {profile && (
            <>
              <div className="about-header">
                <div className="about-header-text">
                  <h3 className="about-name">{profile.fullName}</h3>
                  <p className="about-role">{profile.fullRole}</p>
                  <p className="about-intro">I'm interested in AI and fintech, and am passionate about finding ways to apply AI and ML to the financial services, operations, and investment industries.</p>
                  <p className="about-intro">Outside of classes, I help organize logistics for <a href="https://hackmit.org/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>HackMIT</a>, captain MIT's Indian Classical Dance Team (<a href="https://www.instagram.com/mitnritya/?hl=en" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>MIT Nritya</a>), serve on MIT's <a href="https://swe.mit.edu/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>Society of Women Engineers (SWE)</a> Board, and am treasurer for MIT's <a href="https://ieeeacm.mit.edu/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>IEEE/ACM</a> Chapter.</p>
                </div>
                {profile.headshot && (
                  <div className="about-headshot">
                    <img src={profile.headshot} alt={profile.fullName} />
                  </div>
                )}
              </div>

              <div className="about-sections-grid">
                {/* Education Section */}
                <div className="about-section-card">
                  <TypewriterHeading text="Education" className="section-card-title" />
                  <div className="education-content">
                    <div className="education-institution"><strong>{educationData.institution}</strong></div>
                    <div className="education-major"><strong>Major:</strong> {educationData.major}</div>
                    <div className="education-section">
                      <strong>Relevant Coursework:</strong>
                      <div className="coursework-list">
                        {educationData.coursework.map((course, index) => (
                          <span key={index} className="course-item">{course}{index < educationData.coursework.length - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                    </div>
                    <div className="education-teaching">{educationData.teaching}</div>
                  </div>
                </div>

                {/* Work and Research Experience */}
                <div className="about-section-card">
                  <TypewriterHeading text="Work and Research Experience" className="section-card-title" />
                  <div className="expandable-list">
                    {workExperience.map((item, index) => (
                      <ExpandableItem
                        key={index}
                        title={item.title}
                        place={item.place}
                        date={item.date}
                        description={item.description}
                      />
                    ))}
                  </div>
                </div>

                {/* Leadership Experience */}
                <div className="about-section-card">
                  <TypewriterHeading text="Leadership Experience" className="section-card-title" />
                  <div className="expandable-list">
                    {leadershipExperience.map((item, index) => (
                      <ExpandableItem
                        key={index}
                        title={item.title}
                        place={item.place}
                        date={item.date}
                        description={item.description}
                      />
                    ))}
                  </div>
                </div>

                {/* Awards and Achievements */}
                <div className="about-section-card">
                  <TypewriterHeading text="Awards and Achievements" className="section-card-title" />
                  <div className="expandable-list">
                    {awards.map((item, index) => (
                      <ExpandableItem
                        key={index}
                        title={item.title}
                        place={item.place}
                        date={item.date}
                        description={item.description}
                      />
                    ))}
                  </div>
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

