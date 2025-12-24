import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <span>Portfolio</span>
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive('/')}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about')}>
                About
              </Link>
            </li>
            <li>
              <Link to="/projects" className={isActive('/projects')}>
                Projects
              </Link>
            </li>
            <li>
              <Link to="/contact" className={isActive('/contact')}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

