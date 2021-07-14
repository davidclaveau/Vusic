import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import ChordChart from '../components/ChordChart';
import VusicLoader from '../components/VusicLoader';
import Error from '../components/Error';

export const GET_ARTIST = gql`
  query GetArtist {
    topArtists {
      id
      name
      genres
      images {
        height
        url
        width
      }
    }
  }
`;

export default function TopArtistsPopularity () {
  return (
    <div>
      <Query query={GET_ARTIST}>
        {({ loading, data }) => {
          if (loading) {
            return (
              <VusicLoader />
            );
          }
          if (!data.topArtists) {
            return <Error />
          }
          return(
            <ChordChart graphData={data}></ChordChart>
          );
        }}
      </Query>
    </div>
  );
}
