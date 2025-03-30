import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  FormControl,
  Input,
  Button,
  Checkbox,
  Link,
  HStack,
  IconButton,
  Divider,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useUserContext } from "../context/UserContext";
import { FaGoogle, FaFacebook, FaLinkedin } from "react-icons/fa";
import Register from "./Register"; // Make sure the path is correct

const MotionBox = motion(Box);

export const Login = () => {
  const toast = useToast();
  const { login, setUser } = useUserContext();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      fetch("http://localhost:3031/users/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            navigate("/home");
          }
        })
        .catch((error) => console.error("❌ Error fetching user:", error));
    }
  }, [navigate, setUser]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(credentials);
      navigate("/home");
    } catch (error) {
      toast({
        title: "כניסה נכשלה",
        description: error?.message || "כתובת מייל או סיסמה שגויים.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3031/auth/google";
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="green.50">
      <Box
        w="900px"
        h="500px"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        boxShadow="xl"
        bg="white"
      >
        <Flex
          w="1800px"
          h="100%"
          transform={`translateX(${showRegister ? "-900px" : "0px"})`}
          transition="0.6s ease"
        >
          {/* Login Section */}
          <Box flex="1" p={10} textAlign="center" w="500px">
            <Heading mb={2} color="green.700">
              התחברות
            </Heading>
            <Text fontSize="sm" color="gray.500">
              התחבר באמצעות הרשתות החברתיות
            </Text>

            <HStack spacing={4} justify="center" mt={4}>
              <IconButton
                icon={<FaFacebook />}
                aria-label="Facebook Login"
                variant="outline"
                colorScheme="facebook"
                size="lg"
              />
              <IconButton
                icon={<FaGoogle />}
                aria-label="Google Login"
                variant="outline"
                colorScheme="red"
                size="lg"
                onClick={handleGoogleLogin}
              />
              <IconButton
                icon={<FaLinkedin />}
                aria-label="LinkedIn Login"
                variant="outline"
                colorScheme="linkedin"
                size="lg"
              />
            </HStack>

            <Divider my={6} />

            <form onSubmit={handleSubmit}>
              <FormControl id="email" isRequired mb={4}>
                <Input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="כתובת מייל"
                  bg="gray.100"
                  borderRadius="full"
                  _focus={{ bg: "white", borderColor: "green.500" }}
                />
              </FormControl>

              <FormControl id="password" isRequired mb={4}>
                <Input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="סיסמה"
                  bg="gray.100"
                  borderRadius="full"
                  _focus={{ bg: "white", borderColor: "green.500" }}
                />
              </FormControl>

              <HStack justify="space-between" alignItems="center" mb={4}>
                <Checkbox name="remember" colorScheme="green">
                  זכור אותי
                </Checkbox>
                <Link as={RouterLink} to="/forgot-password" color="green.500" fontSize="sm">
                  שכחת סיסמה?
                </Link>
              </HStack>

              <Button
                type="submit"
                width="full"
                isLoading={isLoading}
                mb={4}
                colorScheme="green"
                size="lg"
                borderRadius="full"
                _hover={{ bg: "green.600" }}
              >
                התחבר
              </Button>
            </form>
          </Box>

          {/* Register Section */}
          <Box flex="1" p={10} textAlign="center" w="900px" overflowY="auto">
            <Register onBackToLogin={() => setShowRegister(false)} />
          </Box>
        </Flex>

        {/* Sliding Green CTA Panel */}
        <MotionBox
          position="absolute"
          top="0"
          left={showRegister ? "0" : "50%"}
          width="50%"
          height="100%"
          bgGradient="linear(to-br, green.300, green.500)"
          color="white"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          p={10}
          transition="0.6s ease"
        >
          {showRegister ? (
            <>
              <Heading size="lg" mb={4}>
                כבר רשום?
              </Heading>
              <Text fontSize="md" mb={6}>
                התחבר עכשיו לחשבון שלך
              </Text>
              <Button
                colorScheme="whiteAlpha"
                variant="outline"
                borderRadius="full"
                _hover={{ bg: "white", color: "green.500" }}
                onClick={() => setShowRegister(false)}
              >
                התחבר
              </Button>
            </>
          ) : (
            <>
              <Heading size="lg" mb={4}>
                חדש כאן?
              </Heading>
              <Text fontSize="md" mb={6}>
                הצטרפו עכשיו וגלו אפשרויות חדשות!
              </Text>
              <RouterLink to="/register">
              Register
              </RouterLink>

              <Button
                colorScheme="whiteAlpha"
                variant="outline"
                borderRadius="full"
                _hover={{ bg: "white", color: "green.500" }}
                onClick={() => setShowRegister(true)}
              >
                הירשם עכשיו
              </Button>
            </>
          )}
        </MotionBox>
      </Box>
    </Flex>
  );
};
