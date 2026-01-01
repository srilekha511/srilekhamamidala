import { useEffect, useState } from 'react'
import { projects as projectsData } from '../data'
import './Projects.css'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    // Use local data instead of API call
    setProjects(projectsData)
    setLoading(false)
  }, [])

  const openModal = (project) => {
    setSelectedProject(project)
    setSelectedImageIndex(0)
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeModal = () => {
    setSelectedProject(null)
    document.body.style.overflow = 'auto' // Restore scrolling
  }

  const handleImageClick = (index) => {
    setSelectedImageIndex(index)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && selectedProject) {
      closeModal()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProject])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="projects" style={{backgroundImage: `linear-gradient(180deg, rgba(208, 215, 250, 0.906) 0%, rgba(167, 232, 232, 0.5) 100%), url(${import.meta.env.BASE_URL}projectsactual.jpg)`}}>
      <section className="section">
        <div className="container">
          <h2 className="section-title">My Projects</h2>
          <p className="section-subtitle">Check out some of my work below!</p>
          
          <div className="projects-grid">
            {projects.map((project) => {
              const getImagePath = (imgPath) => {
                return `${import.meta.env.BASE_URL}${imgPath.replace(/^\//, '')}`
              }
              return (
              <div key={project.id} className="project-card">
                <div className="project-image">
                  <img src={getImagePath(project.image)} alt={project.title} />
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-technologies">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => openModal(project)}
                    className="project-link"
                  >
                    View Project →
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject && (() => {
        const getImagePath = (imgPath) => {
          return `${import.meta.env.BASE_URL}${imgPath.replace(/^\//, '')}`
        }
        return (
        <div className="project-modal-overlay" onClick={closeModal}>
          <div className="project-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="project-modal-close" onClick={closeModal}>×</button>
            
            <div className="project-modal-body">
              {/* Left Side - Image Gallery */}
              <div className="project-modal-gallery">
                <div className="project-modal-main-image">
                  <img 
                    src={getImagePath(selectedProject.images[selectedImageIndex] || selectedProject.image)} 
                    alt={selectedProject.title} 
                  />
                </div>
                <div className="project-modal-thumbnails">
                  {selectedProject.images.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => handleImageClick(index)}
                    >
                      <img src={getImagePath(img)} alt={`${selectedProject.title} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Project Details */}
              <div className="project-modal-details">
                <h2 className="project-modal-title">{selectedProject.title}</h2>
                <div className="project-modal-category">{selectedProject.category}</div>
                <p className="project-modal-description">{selectedProject.description}</p>
                
                <div className="project-modal-technologies">
                  {selectedProject.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="project-modal-learned">
                  <h3 className="learned-heading">What I Learned</h3>
                  <p className="learned-description">{selectedProject.whatILearned}</p>
                </div>

                {selectedProject.link && (
                  <a 
                    href={selectedProject.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-modal-link"
                  >
                    {selectedProject.linkText || "View on GitHub"} →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        )
      })()}
    </div>
  )
}

export default Projects

