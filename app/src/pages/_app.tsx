import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import theme from '../theme'
import * as React from "react";
import { cacheExchange, QueryInput } from "@urql/exchange-graphcache";
import { LoginMutation, RegisterMutation, WhoamiDocument, WhoamiQuery } from "../generated/graphql";

function betterUpdateQuery(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        login: (_result, args, cache, info) => {
          cache.updateQuery({ query: WhoamiDocument }, (data: WhoamiQuery) => {});
          betterUpdateQuery<LoginMutation, WhoamiQuery>(
            cache,
            {query: WhoamiDocument},
            _result,
            (result, query) => {
              if (result.login.errors) {
                return query;
              } else {
                return {
                  whoami: result.login.user,
                };
              }
            }
          );
        },
        register: (_result, args, cache, info) => {
          cache.updateQuery({ query: WhoamiDocument }, (data: WhoamiQuery) => {});
          betterUpdateQuery<RegisterMutation, WhoamiQuery>(
            cache,
            {query: WhoamiDocument},
            _result,
            (result, query) => {
              if (result.register.errors) {
                return query;
              } else {
                return {
                  whoami: result.register.user,
                };
              }
            }
          );
        }
      }
    }
  }), fetchExchange]
});

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
