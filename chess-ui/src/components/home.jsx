import React, { Component } from "react";
import "./home.css";

class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div id="page-top">
        {/* Navigation */}
        <nav
          className="navbar navbar-expand-lg navbar-light fixed-top"
          id="mainNav"
        >
          <div className="container">
            <a className="navbar-brand js-scroll-trigger" href="#page-top">
              Rhome F
            </a>
            <button
              className="navbar-toggler navbar-toggler-right"
              type="button"
              data-toggle="collapse"
              data-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#about">
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#portfolio">
                    Portfolio
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#contact">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main */}
        <header className="masthead text-center text-white d-flex">
          <div className="container my-auto">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <h2>
                  <strong>Welcome to my Deep Learning sandbox</strong>
                </h2>
                <hr />
              </div>
              <div className="col-lg-8 mx-auto">
                <p className="text-faded mb-5">
                  {"What's new?"} <br />
                  {"Play against a homemade chess engine."}
                </p>
                <br />
                <a
                  className="btn btn-primary btn-xl js-scroll-trigger"
                  href="/chess"
                >
                  Play chess
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Interests */}
        <section id="services">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h2 className="section-heading">Interests</h2>
                <hr className="my-4" />
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-4 col-md-6 text-center">
                <div className="service-box mt-5 mx-auto">
                  <i
                    className="fas fa-4x fa-infinity text-primary mb-3 sr-icon-1"
                    data-sr-id="0"
                    style={{
                      visibility: "visible",
                      opacity: "1",
                      transform:
                        "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                      transition:
                        "opacity 0.6s cubic-bezier(0.5, 0, 0, 1) 0.2s, transform 0.6s cubic-bezier(0.5, 0, 0, 1) 0.2s"
                    }}
                  />
                  <h3 className="mb-3">Mathematics</h3>
                  <p className="text-muted mb-0">
                    Algebra, calculus, statistics.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 text-center">
                <div className="service-box mt-5 mx-auto">
                  <i
                    className="fas fa-4x fa-code text-primary mb-3 sr-icon-3"
                    data-sr-id="3"
                    style={{
                      visibility: "visible",
                      opacity: "1",
                      transform:
                        "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                      transition:
                        "opacity 0.6s cubic-bezier(0.5, 0, 0, 1) 0.6s, transform 0.6s cubic-bezier(0.5, 0, 0, 1) 0.6s"
                    }}
                  />
                  <h3 className="mb-3">Programming</h3>
                  <p className="text-muted mb-0">
                    Mostly q, python, C#, javascript.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 text-center">
                <div className="service-box mt-5 mx-auto">
                  <i
                    className="fas fa-4x fa-flask text-primary mb-3 sr-icon-2"
                    data-sr-id="2"
                    style={{
                      visibility: "visible",
                      opacity: "1",
                      transform:
                        "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                      transition:
                        "opacity 0.6s cubic-bezier(0.5, 0, 0, 1) 0.4s, transform 0.6s cubic-bezier(0.5, 0, 0, 1) 0.4s"
                    }}
                  />
                  <h3 className="mb-3">Sciences</h3>
                  <p className="text-muted mb-0">
                    Quantum physics... and computing!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio */}
        <section className="p-0" id="portfolio">
          <div className="container-fluid p-0">
            <div className="row no-gutters popup-gallery">
              <div className="col-lg-6 col-sm-6">
                <a className="portfolio-box" href="/chess">
                  <img
                    className="img-fluid"
                    src={require("./../assets/img/portfolio/chess-pieces.jpg")}
                    alt=""
                  />
                  <div className="portfolio-box-caption">
                    <div className="portfolio-box-caption-content">
                      <div className="project-category text-faded">
                        Reinforcement Learning
                      </div>
                      <div className="project-name">Deep chess</div>
                    </div>
                  </div>
                </a>
              </div>
              <div className="col-lg-6 col-sm-6">
                <a className="portfolio-box" href="/">
                  <img
                    className="img-fluid"
                    src={require("./../assets/img/portfolio/planets.jpg")}
                    alt=""
                  />
                  <div className="portfolio-box-caption">
                    <div className="portfolio-box-caption-content">
                      <div className="project-category text-faded">
                        Supervised Learning
                      </div>
                      <div className="project-name">Time series</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default HomeComponent;
