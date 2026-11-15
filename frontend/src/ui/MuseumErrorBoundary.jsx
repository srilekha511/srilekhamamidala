import { Component } from 'react'

// If the museum's code can't download (a stale deploy or a flaky connection), say so
// instead of blanking the whole site, and offer a reload or a way back to the landing page.
export default class MuseumErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="museum-error" role="alert">
        <p>The gallery couldn't load. Check your connection and try again.</p>
        <button className="pixel-button" onClick={() => window.location.reload()}>Reload</button>
        <button className="pixel-button" onClick={this.props.onHome}>Back to the landing page</button>
      </div>
    )
  }
}
