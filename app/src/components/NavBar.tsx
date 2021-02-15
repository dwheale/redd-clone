import React from "react";
import { Box, Flex, Link } from "@chakra-ui/layout";
import NextLink from 'next/link';
import { useWhoamiQuery } from "../generated/graphql";
import { Button } from "@chakra-ui/button";

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = () => {
  const [{data, fetching}] = useWhoamiQuery()
  let body = null;
  // data is loading
  if (fetching) {

  } else if (!data?.whoami) {
    // user not logged in
    body = (
      <>
        <NextLink href='/login'>
          <Link color='white' mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link color='white'>Register</Link>
        </NextLink>
      </>
      )
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.whoami.username}</Box>
        <Button variant='link'>Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex bg='tomato' p={4}>
      <Box ml={'auto'}>
        {body}
      </Box>
    </Flex>
  );
}