import {
    Avatar,
    Box,
    Flex,
    Heading,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Text,
    useColorMode,
    useColorModeValue,
    Button,
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  import { SettingsIcon, SunIcon, MoonIcon, ArrowBackIcon } from "@chakra-ui/icons";
  import { useUserContext } from "../context/UserContext";

export const Topbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useUserContext();
    const { colorMode, toggleColorMode } = useColorMode();
    const bg = useColorModeValue("white", "gray.800");
    const color = useColorModeValue("gray.800", "white");
  
    const username = user?.fullName || user?.email;

    const handleProfile = () => {
      console.log("Profile clicked");
      navigate('/edit_profile');
    };
  
    const handleLogout = () => {
      logout()
    };
  
    return (
      <Flex
        as="nav"
        bg={bg}
        color={color}
        px={6}
        py={4}
        align="center"
        boxShadow="md"
      >
        <Heading as="h1" size="lg">
          Shoppingo
        </Heading>
        <Spacer />
        <Text dir="rtl" mr={4} >שלום, {username} </Text>
        <Avatar name={user?.fullName || user.email} src={user?.image} size="lg" ml={4} showBorder boxShadow="sm" />
        <IconButton
            variant="ghost"
          icon={colorMode === "light" ? <MoonIcon boxSize={6} /> : <SunIcon boxSize={6} />}
          isRound
          size="md"
          mr={4}
          onClick={toggleColorMode}
          aria-label="Toggle color mode"
        />
        <Menu size="md">
          <MenuButton
            as={IconButton}
             variant="ghost"
            icon={<SettingsIcon boxSize={6} />}
            isRound
            size="md"
            aria-label="Settings"
          />
          <MenuList>
            <MenuItem onClick={handleProfile}>עריכת פרופיל</MenuItem>
          </MenuList>
        </Menu>
        <Button rightIcon={<ArrowBackIcon />} onClick={handleLogout} variant='outline'>
            התנתק
        </Button>
      </Flex>
    );
  };
  