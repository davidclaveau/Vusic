import React, { Component } from "react";
// import { BrowserRouter, Switch, Route } from "react-router-dom";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import TopArtistsPopularity from "./Pages/TopArtistsPopularity";
import TopArtistsFollowers from "./Pages/TopArtistsFollowers";
import TopArtistsGenres from "./Pages/TopArtistsGenres";
import RelatedArtists from "./Pages/RelatedArtists";
import TopTracksPopularity from "./Pages/TopTracksPopularity";
import TopTracksAnalysis from "./Pages/TopTracksAnalysis";
import TopTracksYears from "./Pages/TopTracksYears";
import Home from "./Pages/Home";
import Footer from "../src/components/Footer";
import "./_styles.scss";
import "./App.scss";

const routes = [
  { path: "/", name: "Vusic", Component: Home },
  {
    path: "/graphs/top-artists/popularity",
    name: "Artists by Popularity",
    Component: TopArtistsPopularity,
  },
  {
    path: "/graphs/top-artists/followers",
    name: "Artists by Followers",
    Component: TopArtistsFollowers,
  },
  {
    path: "/graphs/top-artists/:id/related-artists",
    name: "Related Artists",
    Component: RelatedArtists,
  },
  {
    path: "/graphs/top-artists/genres",
    name: "Artists by Genres",
    Component: TopArtistsGenres,
  },
  {
    path: "/graphs/top-tracks/popularity",
    name: "Tracks by Popularity",
    Component: TopTracksPopularity,
  },
  {
    path: "/graphs/top-tracks/years",
    name: "Tracks by Year",
    Component: TopTracksYears,
  },
  {
    path: "/graphs/top-tracks/analysis",
    name: "Tracks Analysis",
    Component: TopTracksAnalysis,
  },
];

class App extends Component {


  render() {
    return (
      <Router>
        <>
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand>
              <Nav.Link
                key="/"
                as={NavLink}
                to="/"
                activeClassName="active"
                exact
              >
                <img id="brand" src="/vusic_icon.png" alt="vusic-icon"></img>
              </Nav.Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">
                {routes
                  .filter(
                    (route) =>
                      route.path !==
                        "/graphs/top-artists/:id/related-artists" &&
                      route.path !== "/"
                  )
                  .map((route) => (
                    <Nav.Link
                      key={route.path}
                      as={NavLink}
                      to={route.path}
                      activeClassName="active"
                      exact
                    >
                      {route.name}
                    </Nav.Link>
                  ))}
              </Nav>
              <Form inline>
                <Button
                  variant="login-button"
                  href="http://localhost:4000/login"
                >
                  Login
                </Button>
              </Form>
            </Navbar.Collapse>
          </Navbar>
          <div>
            {routes.map(({ path, Component }) => (
              <Route key={path} exact path={path}>
                {({ match }) => (
                  <CSSTransition
                    in={match != null}
                    timeout={300}
                    classNames="page"
                    unmountOnExit
                  >
                    <Component />
                  </CSSTransition>
                )}
              </Route>
            ))}
          </div>
        <Footer/>
        </>
      </Router>
    );
  }
}

export default App;
