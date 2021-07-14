import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { useHistory } from "react-router";
import BubblesGraphTAF from "../components/BubblesGraphTAF";
import VusicLoader from "../components/VusicLoader";
import Error from "../components/Error";

export const GET_ARTIST = gql`
  query GetArtist {
    topArtists {
      id
      name
      popularity
      genres
      followers {
        href
        total
      }
      images {
        height
        url
        width
      }
      external_urls {
        spotify
      }
    }
  }
`;

export default function TopArtistsFollowers() {
  // If a user selects an artist's bubble, will send user
  // to the artist's id, looking for related artists
  const history = useHistory();

  const onClick = (id, name, images, external_urls) => {
    history.push({
      pathname: `${id}/related-artists`,
      state: {
        id: id,
        name: name,
        images: [...images],
        external_urls: { ...external_urls },
      },
    });
  };

  return (
    <div>
      <Query query={GET_ARTIST}>
        {({ loading, data }) => {
          if (loading) {
            return <VusicLoader />;
          }
          if (!data.topArtists) {
            return <Error />
          }
          data.topArtists.forEach((element) => {
            element.numbers = element.followers.total;
          });

          return (
            <>
              <h1 >
                Artists by Followers
              </h1>
              <BubblesGraphTAF graphData={data} onClick={onClick}></BubblesGraphTAF>
            </>
          );
        }}
      </Query>
    </div>
  );
}
