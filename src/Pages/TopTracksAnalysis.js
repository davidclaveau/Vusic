import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import RadarGraph from "../components/RadarGraph";
import VusicLoader from "../components/VusicLoader";
import Error from "../components/Error";

const TOP_TRACKS = gql`
  query TOP_TRACKS {
    top10Tracks {
      id
      name
    }
  }
`;
const TRACKS_ANALYSIS = gql`
  query TRACKS_ANALYSIS {
    tracksAnalysis {
      id
      danceability
      energy
      speechiness
      acousticness
      instrumentalness
      liveness
      valence
    }
  }
`;

export default function TopTracksAnalysis() {
  return (
    <Query query={TOP_TRACKS}>
      {({ loading: loadingOne, data: one }) => (
        <Query query={TRACKS_ANALYSIS}>
          {({ loading: loadingTwo, data: two }) => {
            if (loadingOne || loadingTwo) {
              return (
                <VusicLoader/>
              );
            }
            if (!one.top10Tracks || !two.tracksAnalysis) {
              return <Error />
            }
              return (
                <RadarGraph dataGraphFirst={one} dataGraphSecond={two}></RadarGraph>
              );
            }}
          </Query>
        )}
      </Query>
  );
}
