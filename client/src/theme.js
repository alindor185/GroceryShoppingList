import { extendTheme, theme as baseTheme, withDefaultColorScheme } from "@chakra-ui/react";

const theme = extendTheme(
  {
    direction: "rtl",
    colors: {
      primary: baseTheme.colors.green,
      secondary: baseTheme.colors.teal,
    },
    styles: {
      global: {
        body: {
          direction: "rtl",
        },
      },
    },

  },

  withDefaultColorScheme({ colorScheme: "primary" })
);

export default theme;
