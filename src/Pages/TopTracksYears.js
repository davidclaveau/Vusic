import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import HeatMap from "../components/HeatMap";
import VusicLoader from "../components/VusicLoader";
import Error from "../components/Error";

export default function RelatedArtists(props) {
  const GET_TRACKS_INFO_FIRST = gql`
    query gettopTrackOffset {
      topTrackOffset(limit: "49", offset: "0") {
        id
        name
        artists {
          name
        }
        album {
          images {
            url
          }
          release_date
        }
      }
    }
  `;

  const GET_TRACKS_INFO_SECOND = gql`
    query gettopTrackOffset {
      topTrackOffset(limit: "50", offset: "49") {
        id
        name
        artists {
          name
        }
        album {
          images {
            url
          }
          release_date
        }
      }
    }
  `;

  return (
    <div>
      <Query query={GET_TRACKS_INFO_FIRST}>
        {({ loading: loadingOne, data: one }) => (
          <Query query={GET_TRACKS_INFO_SECOND}>
            {({ loading: loadingTwo, data: two }) => {
              if (loadingOne || loadingTwo) {
                return <VusicLoader />;
              }
              if (!one.topTrackOffset || two.topTrackOffset) {
                return <Error />
              }
              return (
                <>
                  <HeatMap dataGraphFirst={one} dataGraphSecond={two}></HeatMap>
                </>
              );
            }}
          </Query>
        )}
      </Query>
    </div>
  );
}
