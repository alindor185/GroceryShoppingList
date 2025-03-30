import {
  extendTheme,
  theme as baseTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";

const theme = extendTheme(
  {
    direction: "rtl",
    colors: {
      primary: baseTheme.colors.green,
      secondary: baseTheme.colors.teal,
    },
    fonts: {
      heading: `'Assistant', sans-serif`,
      body: `'Assistant', sans-serif`,
    },
    styles: {
      global: {
        body: {
          direction: "rtl",
          fontFamily: `'Assistant', sans-serif`,
          bg: "gray.50",
          color: "gray.800",
        },
      },
    },
    config: {
      initialColorMode: "light",
      useSystemColorMode: false,
    },
  },
  withDefaultColorScheme({ colorScheme: "primary" })
);

export default theme;
