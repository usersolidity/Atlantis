import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const APIURL = "https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic";

const tokensQuery = `
  query {
    reserves {
      name
      underlyingAsset
      
      liquidityRate 
      stableBorrowRate
      variableBorrowRate
      
      aEmissionPerSecond
      vEmissionPerSecond
      sEmissionPerSecond
      
      totalATokenSupply
      totalCurrentVariableDebt
    }
  }
`;

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

export const request = async () => {
  return client
    .query({
      query: gql(tokensQuery),
    })
    .then((data) => {
      let result = data.data.reserves;
      //   result = result.map(function(value){return value.name});

      let resultObj = {};
      for (let i = 0; i < result.length; ++i)
        resultObj[result[i].underlyingAsset] =
          ((100 * result[i].liquidityRate) / Math.pow(10, 27)).toFixed(2) + "%";

      return resultObj;
    })
    .catch((err) => {
      console.log("Error fetching data: ", err);
    });
};
