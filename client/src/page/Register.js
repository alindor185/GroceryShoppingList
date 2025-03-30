import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Link,
  HStack,
  useToast,
  Flex,
} from "@chakra-ui/react";

const Register = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3031/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "נרשמת בהצלחה!",
          description: "כעת באפשרותך להתחבר למערכת.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login"); // Redirect to login page after successful registration
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="green.50">
      <Box
        w="400px"
        p={6}
        borderRadius="lg"
        boxShadow="xl"
        bg="white"
        textAlign="center"
      >
        <Heading mb={4} color="green.700">
          הרשמה
        </Heading>

        {error && (
          <Text color="red.500" fontSize="sm" mb={3}>
            {error}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl id="email" isRequired>
              <FormLabel>כתובת מייל</FormLabel>
              <Input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                bg="gray.100"
                borderRadius="md"
                _focus={{ bg: "white", borderColor: "green.500" }}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>סיסמה</FormLabel>
              <Input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="בחר סיסמה"
                bg="gray.100"
                borderRadius="md"
                _focus={{ bg: "white", borderColor: "green.500" }}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="green"
              isLoading={isLoading}
              size="lg"
              borderRadius="md"
              w="full"
            >
              הירשם
            </Button>
          </VStack>
        </form>

        <HStack justify="center" mt={4}>
          <Text fontSize="sm">כבר יש לך חשבון?</Text>
          <Link as={RouterLink} to="/login" color="green.500" fontSize="sm">
            התחבר כאן
          </Link>
        </HStack>
      </Box>
    </Flex>
  );
};

export default Register;
