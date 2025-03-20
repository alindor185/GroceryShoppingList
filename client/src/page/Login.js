import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Checkbox,
  Link,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useUserContext } from "../context/UserContext";
import { FaGoogle, FaGithub, FaTwitter } from "react-icons/fa";

export const Login = () => {
  const toast = useToast();
  const { login, setUser } = useUserContext();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle Google login response
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      console.log("✅ Google Login Token Received:", token);
      localStorage.setItem("token", token);

      // ✅ Fetch user details after login
      fetch("http://localhost:3031/users/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            console.log("✅ User Data Fetched:", data.user);
            setUser(data.user);
            navigate("/home"); // ✅ Redirect user to Home
          } else {
            console.error("❌ Failed to fetch user data");
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
        title: "Login Failed",
        description: error?.message || "Invalid email or password.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("🔄 Redirecting to Google OAuth...");
    window.location.href = "http://localhost:3031/auth/google"; // ✅ Redirect to Google OAuth
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgGradient="linear(to-r, gray.200, gray.500)"
      p={4}
    >
      <Box
        dir="rtl"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        maxW="md"
        w="full"
      >
        <Heading mb={4} textAlign="center">כניסה</Heading>

        <Text mb={6} textAlign="center">
          אין לכם משתמש?{" "}
          <Link as={RouterLink} to="/register" color="blue.500" fontWeight="bold">
            לחצו כאן
          </Link>
        </Text>

        <form onSubmit={handleSubmit}>
          <FormControl id="email" isRequired mb={4}>
            <FormLabel>כתובת מייל</FormLabel>
            <Input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl id="password" isRequired mb={4}>
            <FormLabel>סיסמה</FormLabel>
            <Input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
            />
          </FormControl>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Checkbox name="remember" colorScheme="purple">זכור אותי</Checkbox>
            <Link as={RouterLink} to="/forgot-password" color="blue.500" fontSize="sm">
              שכחת סיסמה?
            </Link>
          </Box>

          <Button type="submit" width="full" isLoading={isLoading} mb={4}>
            התחבר
          </Button>
        </form>

        <HStack spacing={4} justify="center">
          <IconButton
            icon={<FaGoogle />}
            aria-label="Sign in with Google"
            variant="outline"
            colorScheme="red"
            onClick={handleGoogleLogin} // ✅ Handle Google Login
          />
          <IconButton icon={<FaGithub />} aria-label="Sign in with GitHub" variant="outline" colorScheme="gray" />
          <IconButton icon={<FaTwitter />} aria-label="Sign in with Twitter" variant="outline" colorScheme="twitter" />
        </HStack>
      </Box>
    </Box>
  );
};
