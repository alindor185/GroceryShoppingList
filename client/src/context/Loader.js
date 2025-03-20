import React from "react";
import { Box, Spinner } from "@chakra-ui/react";

export const LoaderPage = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100vw"
      bg="gray.100"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.300"
        color="green.500"
        size="xl"
      />
    </Box>
  );
};
